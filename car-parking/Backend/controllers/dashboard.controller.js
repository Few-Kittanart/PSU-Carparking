const Transaction = require("../models/transaction.model");
const ServiceHistory = require("../models/serviceHistory.model");
const Car = require("../models/car.model");
const Customer = require("../models/customer.model");
const { format } = require("date-fns");

const formatDuration = (milliseconds) => {
  if (!milliseconds || isNaN(milliseconds)) return "0 ชั่วโมง 0 นาที";
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  return `${hours} ชั่วโมง ${minutes} นาที`;
};

const prepareDateRange = (req) => {
  const { startDate, endDate } = req.query;
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

// --- Executive Summary ---
exports.getExecutiveSummary = async (req, res) => {
  try {
    const { start, end } = prepareDateRange(req);

    // ✨ เปลี่ยนจากการใช้ .find() เป็น .aggregate() เพื่อให้กรองข้อมูลซับซ้อนได้
    const transactions = await Transaction.aggregate([
      // 1. ค้นหา Transaction ในช่วงวันที่ที่กำหนด
      {
        $match: {
          created_at: { $gte: start, $lte: end },
        },
      },
      // 2. เชื่อมข้อมูลกับ ServiceHistory
      {
        $lookup: {
          from: "servicehistories",
          localField: "serviceHistory",
          foreignField: "_id",
          as: "serviceDetails",
        },
      },
      // 3. แตก Array
      {
        $unwind: "$serviceDetails",
      },
      // 4. ✨ กรองเอาเฉพาะรายการที่ "จ่ายเงินแล้ว"
      {
        $match: {
          "serviceDetails.is_paid": true,
        },
      },
      // 5. เชื่อมข้อมูลกับ Car (เผื่อต้องใช้ในอนาคต)
      {
        $lookup: {
          from: "cars",
          localField: "car",
          foreignField: "_id",
          as: "carDetails",
        },
      },
      {
        $unwind: "$carDetails",
      },
    ]);

    let totalRevenue = 0;
    const uniqueCars = new Set();
    let totalDuration = 0;
    let sessionCount = 0;

    // ✨ Logic การคำนวณจะทำงานกับ Transaction ที่จ่ายเงินแล้วเท่านั้น
    transactions.forEach((t) => {
      totalRevenue += t.total_price || 0;

      if (t.carDetails && t.carDetails.car_registration) {
        uniqueCars.add(t.carDetails.car_registration);
      }

      if (
        t.serviceDetails &&
        t.serviceDetails.entry_time &&
        t.serviceDetails.exit_time
      ) {
        const entry = new Date(t.serviceDetails.entry_time);
        const exit = new Date(t.serviceDetails.exit_time);
        if (!isNaN(entry) && !isNaN(exit) && exit > entry) {
          totalDuration += exit - entry;
          sessionCount++;
        }
      }
    });

    // ส่วนการนับ Active Sessions ยังคงเหมือนเดิม เพราะไม่เกี่ยวกับรายรับ
    const activeSessions = await ServiceHistory.countDocuments({
      is_paid: false,
    });

    res.json({
      totalCars: uniqueCars.size,
      totalRevenue, // ✨ ยอดนี้จะถูกต้องแล้ว
      activeSessions,
      averageParkingTime: formatDuration(
        sessionCount > 0 ? totalDuration / sessionCount : 0
      ),
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Error loading summary", error: err.message });
  }
};

// --- Revenue by Slot ---
exports.getRevenueBySlot = async (req, res) => {
  try {
    const { start, end } = prepareDateRange(req);
    const transactions = await Transaction.find({
      created_at: { $gte: start, $lte: end },
    });
    const map = {};
    transactions.forEach((t) => {
      const key = format(new Date(t.created_at), "yyyy-MM-dd");
      map[key] = (map[key] || 0) + (t.total_price || 0);
    });
    const result = Object.keys(map)
      .map((date) => ({ date, totalRevenue: map[date] }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
    res.json(result);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Error loading revenue by slot", error: err.message });
  }
};

// --- Customer Segments ---
exports.getCustomerSegments = async (req, res) => {
  try {
    const { start, end } = prepareDateRange(req);
    const segments = await Transaction.aggregate([
      { $match: { created_at: { $gte: start, $lte: end } } },
      {
        $lookup: {
          from: "cars",
          localField: "car",
          foreignField: "_id",
          as: "carDetails",
        },
      },
      { $unwind: { path: "$carDetails", preserveNullAndEmptyArrays: false } },
      { $group: { _id: "$carDetails.type_car", count: { $sum: 1 } } },
    ]);
    res.json(segments.filter((s) => s._id));
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Error loading segments", error: err.message });
  }
};

// --- Revenue Breakdown ---
exports.getRevenueBreakdown = async (req, res) => {
  try {
    const { start, end } = prepareDateRange(req);
    const services = await ServiceHistory.find({
      createdAt: { $gte: start, $lte: end },
    });
    let parking = 0,
      additional = 0;
    services.forEach((s) => {
      parking += s.parking_price || 0;
      additional += s.additional_price || 0;
    });
    res.json([
      { name: "Parking", value: parking },
      { name: "Additional Services", value: additional },
    ]);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Error loading revenue breakdown", error: err.message });
  }
};

// --- Active Sessions by Day ---
exports.getActiveSessionsByDay = async (req, res) => {
  try {
    const { start, end } = prepareDateRange(req);
    const transactions = await Transaction.find({
      created_at: { $gte: start, $lte: end },
    }).populate("serviceHistory");
    const map = {};
    transactions.forEach((t) => {
      if (t.serviceHistory && t.serviceHistory.is_paid === false) {
        const dateKey = format(new Date(t.created_at), "yyyy-MM-dd");
        map[dateKey] = (map[dateKey] || 0) + 1;
      }
    });
    const result = Object.keys(map)
      .map((date) => ({ date, activeCount: map[date] }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
    res.json(result);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Error loading active sessions", error: err.message });
  }
};

// --- Monthly Trend ---
exports.getMonthlyTrend = async (req, res) => {
  try {
    const { start, end } = prepareDateRange(req);
    const transactions = await Transaction.find({
      created_at: { $gte: start, $lte: end },
    });
    const customers = await Customer.find({
      createdAt: { $gte: start, $lte: end },
    });
    const cars = await Car.find({ createdAt: { $gte: start, $lte: end } });
    const map = {};
    const getMonth = (date) => format(new Date(date), "yyyy-MM");
    transactions.forEach((t) => {
      const key = getMonth(t.created_at);
      if (!map[key]) map[key] = { revenue: 0, customers: 0, cars: 0 };
      map[key].revenue += t.total_price || 0;
    });
    customers.forEach((c) => {
      const key = getMonth(c.createdAt || new Date());
      if (!map[key]) map[key] = { revenue: 0, customers: 0, cars: 0 };
      map[key].customers += 1;
    });
    cars.forEach((c) => {
      const key = getMonth(c.createdAt || new Date());
      if (!map[key]) map[key] = { revenue: 0, customers: 0, cars: 0 };
      map[key].cars += 1;
    });
    const result = Object.keys(map)
      .map((k) => ({ month: k, ...map[k] }))
      .sort((a, b) => new Date(a.month) - new Date(b.month));
    res.json(result);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Error loading monthly trend", error: err.message });
  }
};

// --- Top Customers ---
exports.getTopCustomers = async (req, res) => {
  try {
    const { startDate, endDate, limit = 5 } = req.query;
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const top = await Transaction.aggregate([
      // 1. ค้นหา Transaction ในช่วงวันที่
      {
        $match: {
          created_at: { $gte: start, $lte: end },
        },
      },
      // ✨ 2. เชื่อมข้อมูลกับ ServiceHistory เพื่อเช็คสถานะ
      {
        $lookup: {
          from: "servicehistories",
          localField: "serviceHistory",
          foreignField: "_id",
          as: "serviceDetails",
        },
      },
      { $unwind: "$serviceDetails" },
      // ✨ 3. กรองเอาเฉพาะรายการที่ "จ่ายเงินแล้ว"
      {
        $match: {
          "serviceDetails.is_paid": true,
        },
      },
      // 4. จัดกลุ่มเพื่อนับ visit และยอดใช้จ่าย (จาก Transaction ที่จ่ายแล้วเท่านั้น)
      {
        $group: {
          _id: "$customer",
          totalSpent: { $sum: "$total_price" },
          visits: { $sum: 1 },
        },
      },
      // 5. จัดเรียงตามจำนวนครั้งที่มาสูงสุด
      { $sort: { visits: -1 } },
      { $limit: parseInt(limit) },
      // 6. เชื่อมข้อมูลกับ Customer เพื่อเอาชื่อมาแสดง
      {
        $lookup: {
          from: "customers",
          localField: "_id",
          foreignField: "_id",
          as: "customerDetails",
        },
      },
      { $unwind: "$customerDetails" },
      {
        $project: {
          _id: 0,
          name: "$customerDetails.customer_name",
          totalSpent: 1,
          visits: 1,
        },
      },
    ]);

    res.json(top);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Error loading top customers", error: err.message });
  }
};

// --- Top Services ---
exports.getServicesByCount = async (req, res) => {
  try {
    const { start, end } = prepareDateRange(req);
    const serviceIds = await Transaction.find({
      created_at: { $gte: start, $lte: end },
    }).distinct("serviceHistory");
    const counts = await ServiceHistory.aggregate([
      {
        $match: {
          _id: { $in: serviceIds },
          services: { $exists: true, $ne: [] },
        },
      },
      { $unwind: "$services" },
      { $group: { _id: "$services", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    res.json(counts);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Error loading top services", error: err.message });
  }
};

// --- Average Service Duration ---
exports.getAvgServiceDuration = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const services = await ServiceHistory.find({
      createdAt: { $gte: start, $lte: end }, // ใช้ createdAt
    });

    const durationMap = {},
      countMap = {};

    services.forEach((s) => {
      if (s.entry_time && s.exit_time && s.services.length > 0) {
        const ms = new Date(s.exit_time) - new Date(s.entry_time);
        s.services.forEach((id) => {
          durationMap[id] = (durationMap[id] || 0) + ms;
          countMap[id] = (countMap[id] || 0) + 1;
        });
      }
    });

    const result = Object.keys(durationMap).map((id) => ({
      serviceId: id,
      avgDuration: msToHoursMinutes(durationMap[id] / countMap[id]),
    }));

    function msToHoursMinutes(ms) {
      const totalSeconds = Math.floor(ms / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      return `${hours} ชั่วโมง ${minutes} นาที`;
    }

    res.json(result);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Error loading avg duration", error: err.message });
  }
};

// --- Alerts ---
exports.getAlerts = async (req, res) => {
  try {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    const overdue = await ServiceHistory.countDocuments({
      is_paid: false,
      createdAt: { $lt: oneMonthAgo },
    });
    res.json({ overdue });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Error loading alerts", error: err.message });
  }
};

// --- Revenue by Payment Method ---
exports.getRevenueByPaymentMethod = async (req, res) => {
  try {
    const { start, end } = prepareDateRange(req);

    const revenue = await Transaction.aggregate([
      // ขั้นตอนที่ 1: ค้นหา Transaction ในช่วงวันที่ที่กำหนด
      {
        $match: {
          created_at: { $gte: start, $lte: end },
          payment_method: { $exists: true, $ne: null },
        },
      },

      // ✨ ขั้นตอนที่ 2 (ใหม่): เชื่อมข้อมูลกับ ServiceHistory เพื่อเช็คสถานะการจ่ายเงิน
      {
        $lookup: {
          from: "servicehistories", // ชื่อ collection ของ ServiceHistory
          localField: "serviceHistory",
          foreignField: "_id",
          as: "serviceDetails",
        },
      },

      // ✨ ขั้นตอนที่ 3 (ใหม่): แตก Array ที่ได้จาก $lookup
      {
        $unwind: "$serviceDetails",
      },

      // ✨ ขั้นตอนที่ 4 (ใหม่): กรองเอาเฉพาะรายการที่ "จ่ายเงินแล้ว"
      {
        $match: {
          "serviceDetails.is_paid": true,
        },
      },

      // ขั้นตอนที่ 5: จัดกลุ่มตามวิธีชำระเงินและรวมยอด (เหมือนเดิม)
      {
        $group: {
          _id: "$payment_method",
          totalRevenue: { $sum: "$total_price" },
        },
      },

      // ขั้นตอนที่ 6: จัดรูปแบบผลลัพธ์ (เหมือนเดิม)
      {
        $project: {
          name: "$_id",
          value: "$totalRevenue",
          _id: 0,
        },
      },
    ]);

    res.json(revenue);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({
        message: "Error loading revenue by payment method",
        error: err.message,
      });
  }
};
