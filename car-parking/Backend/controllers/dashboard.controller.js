const Transaction = require('../models/transaction.model');
const ServiceHistory = require('../models/serviceHistory.model');
const Car = require('../models/car.model');
const { format } = require('date-fns');

// ฟังก์ชันช่วยในการจัดรูปแบบระยะเวลาสำหรับ KPI
const formatDuration = (milliseconds) => {
    if (!milliseconds || isNaN(milliseconds)) return '0 ชั่วโมง 0 นาที';
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    return `${hours} ชั่วโมง ${minutes} นาที`;
};

// ฟังก์ชันเตรียมวันที่เริ่มต้นและสิ้นสุดจากการ Query Parameter
const prepareDateRange = (req) => {
    const { startDate, endDate } = req.query;
    // ใช้ Date.parse เพื่อให้รองรับรูปแบบ 'yyyy-MM-dd' ได้ดีขึ้น
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0); // Start of day
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // End of day
    return { start, end };
};

// --- 1. ดึงข้อมูลสรุปผู้บริหาร (Executive Summary / KPIs) ---
// Route: /api/dashboard/summary
exports.getExecutiveSummary = async (req, res) => {
    try {
        const { start, end } = prepareDateRange(req);

        // ดึง Transaction ที่เสร็จสมบูรณ์ในช่วงเวลาที่กำหนด (อิงจาก created_at ใน Transaction)
        const transactions = await Transaction.aggregate([
            // Match based on Transaction creation date
            { $match: { created_at: { $gte: start, $lte: end } } },
            // Populate serviceHistory และ car เพื่อดึงข้อมูลที่ใช้คำนวณ
            { $lookup: { from: 'servicehistories', localField: 'serviceHistory', foreignField: '_id', as: 'serviceDetails' } },
            { $unwind: { path: '$serviceDetails', preserveNullAndEmptyArrays: true } }, 
            { $lookup: { from: 'cars', localField: 'car', foreignField: '_id', as: 'carDetails' } },
            { $unwind: { path: '$carDetails', preserveNullAndEmptyArrays: true } },
        ]);

        let totalRevenue = 0;
        let uniqueCars = new Set();
        let totalParkingDurationMs = 0;
        let completedSessionsCount = 0;

        transactions.forEach(t => {
            // 1. Total Revenue
            totalRevenue += t.total_price || 0;

            // 2. Unique Cars (ใช้ทะเบียนรถเป็นตัวระบุหลัก)
            if (t.carDetails && t.carDetails.car_registration) {
                uniqueCars.add(t.carDetails.car_registration);
            } else if (t.car) {
                 // Fallback to car ID if registration is missing
                 uniqueCars.add(t.car.toString()); 
            }

            // 3. Average Parking Duration (ต้องมีทั้ง entry_time และ exit_time)
            if (t.serviceDetails && t.serviceDetails.entry_time && t.serviceDetails.exit_time) {
                const entry = new Date(t.serviceDetails.entry_time);
                const exit = new Date(t.serviceDetails.exit_time);
                // ตรวจสอบความถูกต้องของ Date และ exit > entry
                if (exit instanceof Date && !isNaN(exit) && entry instanceof Date && !isNaN(entry) && exit.getTime() > entry.getTime()) {
                    totalParkingDurationMs += exit.getTime() - entry.getTime();
                    completedSessionsCount++;
                }
            }
        });

        const averageParkingTimeMs = completedSessionsCount > 0 ? totalParkingDurationMs / completedSessionsCount : 0;

        // **✅ การปรับปรุง: Active Sessions นับจาก is_paid: false ตามคำแนะนำของผู้ใช้**
        // หมายถึงบริการที่ยังไม่ชำระเงิน (รถยังอยู่ในร้าน/บริการยังไม่เสร็จสมบูรณ์)
        const activeSessionsCount = await ServiceHistory.countDocuments({
            is_paid: false              
        });

        // Output data is clean, formatted, and ready for display in KPI cards
        res.json({
            totalCars: uniqueCars.size,
            totalRevenue: totalRevenue,
            activeSessions: activeSessionsCount, // ตอนนี้อิงตาม is_paid: false แล้ว
            averageParkingTime: formatDuration(averageParkingTimeMs), // เป็น String ที่แสดง "ชั่วโมง นาที"
        });

    } catch (err) {
        console.error("Executive Summary API Error:", err);
        res.status(500).json({ message: "Internal Server Error loading summary data.", error: err.message });
    }
};

// --- 2. ดึงข้อมูลรายได้ตามช่วงเวลา (Revenue by Date / Line Chart) ---
// Route: /api/dashboard/revenue-by-slot
exports.getRevenueBySlot = async (req, res) => {
    try {
        const { start, end } = prepareDateRange(req);

        // ดึง Transaction โดยใช้ created_at เป็นเกณฑ์
        const transactions = await Transaction.find({ created_at: { $gte: start, $lte: end } });
        
        const revenueBySlotMap = {};
        transactions.forEach(t => {
            // Grouping by date (yyyy-MM-dd)
            const dateKey = format(new Date(t.created_at), 'yyyy-MM-dd'); 
            revenueBySlotMap[dateKey] = (revenueBySlotMap[dateKey] || 0) + t.total_price;
        });

        // Convert Map to Array and sort by date for Line Chart rendering
        const revenueBySlot = Object.keys(revenueBySlotMap).map(date => ({
            date: date, // X-axis label
            totalRevenue: revenueBySlotMap[date] // Y-axis value
        })).sort((a, b) => new Date(a.date) - new Date(b.date));

        res.json(revenueBySlot);

    } catch (err) {
        console.error("Revenue By Slot API Error:", err);
        res.status(500).json({ message: "Internal Server Error loading revenue data.", error: err.message });
    }
};

// --- 3. ดึงข้อมูลจำนวนการใช้บริการตามชั่วโมง (Sessions by Hour / Bar Chart) ---
// Route: /api/dashboard/sessions-by-hour
exports.getSessionsByHour = async (req, res) => {
    try {
        const { start, end } = prepareDateRange(req);

        // Aggregation to group sessions by the hour of entry_time
        const sessions = await ServiceHistory.aggregate([
            { $match: { 
                entry_time: { $ne: null },
                // Convert entry_time string to Date for date range comparison
                $expr: {
                    $and: [
                        { $gte: [ { $toDate: "$entry_time" }, start ] },
                        { $lte: [ { $toDate: "$entry_time" }, end ] }
                    ]
                }
            }},
            { $group: {
                // Extract hour (0-23) from the converted entry_time
                _id: { $hour: { date: { $toDate: "$entry_time" } } }, 
                count: { $sum: 1 }
            }},
            { $sort: { _id: 1 } }
        ]);

        // IMPORTANT: Ensure all 24 hours (0-23) are present, filling with 0 if no sessions occurred
        const sessionsByHourMap = {};
        for (let i = 0; i < 24; i++) {
            sessionsByHourMap[i] = 0; 
        }

        sessions.forEach(s => {
            sessionsByHourMap[s._id] = s.count;
        });

        const sessionsByHour = Object.keys(sessionsByHourMap).map(hour => ({
            hour: parseInt(hour, 10), // X-axis: Hour of the day
            count: sessionsByHourMap[hour] // Y-axis: Number of sessions
        })).sort((a, b) => a.hour - b.hour);

        res.json(sessionsByHour);

    } catch (err) {
        console.error("Sessions By Hour API Error:", err);
        res.status(500).json({ message: "Internal Server Error loading sessions data.", error: err.message });
    }
};

// --- 4. ดึงข้อมูลส่วนแบ่งลูกค้า (Customer Segments / Pie Chart) ---
// Route: /api/dashboard/customer-segments
exports.getCustomerSegments = async (req, res) => {
    try {
        const { start, end } = prepareDateRange(req);

        // Aggregation to group completed transactions by Car Type
        const segments = await Transaction.aggregate([
            { $match: { created_at: { $gte: start, $lte: end } } },
            // Populate Car เพื่อเข้าถึง type_car
            { $lookup: { from: 'cars', localField: 'car', foreignField: '_id', as: 'carDetails' } },
            { $unwind: { path: '$carDetails', preserveNullAndEmptyArrays: false } }, 
            { $group: { 
                _id: '$carDetails.type_car', // Grouping key for Pie Chart label
                count: { $sum: 1 } // Value for Pie Chart size
            } }
        ]);
        
        // Output format: [{ _id: 'Sedan', count: 10 }, ...]
        // กรองค่าที่เป็น null/undefined ใน _id (เช่น ถ้าไม่มี type_car)
        const filteredSegments = segments.filter(s => s._id);

        res.json(filteredSegments);

    } catch (err) {
        console.error("Customer Segments API Error:", err);
        res.status(500).json({ message: "Internal Server Error loading segment data.", error: err.message });
    }
};
