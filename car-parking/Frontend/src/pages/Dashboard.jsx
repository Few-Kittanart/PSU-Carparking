import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from "recharts";
import { FaCarSide, FaDollarSign, FaUsers, FaClock, FaSearch } from "react-icons/fa";
import { format, subDays } from "date-fns";
import { th } from "date-fns/locale";

// *** สำคัญ: ต้องเป็น URL พื้นฐานของ dashboard route เท่านั้น ***
const API_URL = "http://localhost:5000/api/dashboard"; 
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#E87A90", "#A1A8C8"];

// ฟังก์ชันช่วยในการจัดรูปแบบตัวเลข (เช่น เพิ่ม comma)
const formatNumber = (num) => {
  if (num === undefined || num === null) return '0';
  return new Intl.NumberFormat('th-TH').format(num);
};

// ฟังก์ชันช่วยในการจัดรูปแบบวันที่สำหรับแกน X ของกราฟ
const formatDateForChart = (dateString) => {
  if (!dateString) return '';
  // ตรวจสอบว่าเป็น ISO string หรือไม่
  const date = new Date(dateString.includes('T') ? dateString : dateString + 'T00:00:00');
  return format(date, 'd MMM', { locale: th });
};

const DashboardPage = () => {
  // State สำหรับเก็บข้อมูลและสถานะต่างๆ
  const [summary, setSummary] = useState({
    totalCars: 0,
    totalRevenue: 0,
    activeSessions: 0,
    averageParkingTime: '0 ชั่วโมง 0 นาที'
  });
  const [revenueBySlot, setRevenueBySlot] = useState([]);
  const [sessionsByHour, setSessionsByHour] = useState([]);
  const [customerSegments, setCustomerSegments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State สำหรับ Date Range
  const [dateRange, setDateRange] = useState({
    startDate: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
  });

  const handleDateChange = (e) => {
    setDateRange({
      ...dateRange,
      [e.target.name]: e.target.value,
    });
  };

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError(null);

    const { startDate, endDate } = dateRange;
    const token = localStorage.getItem("token");
    const params = `?startDate=${startDate}&endDate=${endDate}`;
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    const endpoints = [
      { key: 'summary', url: `${API_URL}/summary${params}`, setter: setSummary, processor: (data) => data },
      { key: 'revenue', url: `${API_URL}/revenue-by-slot${params}`, setter: setRevenueBySlot, processor: (data) => data },
      { key: 'sessions', url: `${API_URL}/sessions-by-hour${params}`, setter: setSessionsByHour, processor: (data) => data },
      { key: 'segments', url: `${API_URL}/customer-segments${params}`, setter: setCustomerSegments, 
        processor: (data) => (data || []).map(item => ({
          name: item.carType || item._id || 'ไม่ระบุ', // รองรับ _id และ carType จาก controller
          value: item.count
        }))
      },
    ];

    try {
        const promises = endpoints.map(ep => 
            fetch(ep.url, { headers })
            .then(res => {
                if (!res.ok) {
                    throw new Error(`Failed to fetch ${ep.key} data: ${res.statusText}`);
                }
                return res.json();
            })
            .then(data => ep.setter(ep.processor(data)))
        );

        await Promise.all(promises);

    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.message || "An unknown error occurred while fetching dashboard data.");
      // ในกรณีที่ Error, ตั้งค่า State กลับเป็นค่าเริ่มต้นเพื่อป้องกัน Crash
      setSummary({ totalCars: 0, totalRevenue: 0, activeSessions: 0, averageParkingTime: '0 ชั่วโมง 0 นาที' });
      setRevenueBySlot([]);
      setSessionsByHour([]);
      setCustomerSegments([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // ต้องตรวจสอบว่าวันที่เริ่มต้นและสิ้นสุดเป็นค่าที่ถูกต้องก่อนเรียก fetch
    if (dateRange.startDate && dateRange.endDate) {
        fetchDashboardData();
    }
  }, [dateRange]); // เรียกใช้เมื่อ dateRange เปลี่ยน

  // ข้อมูลสำหรับ KPI Cards
  const KPI_CARDS = [
    {
      title: "จำนวนรถที่เข้าใช้บริการ (รวม)",
      value: formatNumber(summary.totalCars),
      icon: FaCarSide,
      color: "bg-blue-500",
    },
    {
      title: "รายได้รวม (บาท)",
      value: formatNumber(summary.totalRevenue),
      icon: FaDollarSign,
      color: "bg-green-500",
    },
    {
      title: "จำนวนรถที่กำลังใช้บริการ",
      value: formatNumber(summary.activeSessions),
      icon: FaUsers,
      color: "bg-yellow-500",
    },
    {
      title: "เวลาจอดเฉลี่ยต่อครั้ง",
      value: summary.averageParkingTime,
      icon: FaClock,
      color: "bg-red-500",
    },
  ];

  if (isLoading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-xl font-semibold text-gray-600">กำลังโหลดข้อมูล...</div>
      </div>
    );
  }


  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">ภาพรวม Dashboard</h1>

      {/* Date Range Picker */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 p-4 bg-white rounded-xl shadow-md items-center">
        <label htmlFor="startDate" className="font-medium text-gray-700">
          จากวันที่:
        </label>
        <input
          type="date"
          id="startDate"
          name="startDate"
          value={dateRange.startDate}
          onChange={handleDateChange}
          className="p-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500 transition duration-150"
        />

        <label htmlFor="endDate" className="font-medium text-gray-700">
          ถึงวันที่:
        </label>
        <input
          type="date"
          id="endDate"
          name="endDate"
          value={dateRange.endDate}
          onChange={handleDateChange}
          className="p-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500 transition duration-150"
        />

        <button
          onClick={fetchDashboardData}
          className="flex items-center justify-center px-4 py-2 bg-orange-600 text-white font-semibold rounded-lg shadow-md hover:bg-orange-700 transition duration-300 transform hover:scale-105 md:ml-auto"
          aria-label="ค้นหาข้อมูล"
        >
          <FaSearch className="mr-2" />
          ค้นหา
        </button>
      </div>

      {error && <div className="text-red-600 bg-red-100 p-3 rounded-xl mb-4 shadow-md">
        <p className="font-semibold">เกิดข้อผิดพลาดในการโหลดข้อมูล:</p>
        <p className="text-sm">{error}</p>
      </div>}
      
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {KPI_CARDS.map((card, index) => (
          <div
            key={index}
            className={`p-5 rounded-xl text-white shadow-xl flex items-center transition duration-300 transform hover:scale-[1.02] ${card.color}`}
          >
            <div className="flex-grow">
              <p className="text-sm font-medium opacity-80">{card.title}</p>
              <p className="text-3xl font-bold mt-1">{card.value}</p>
            </div>
            <div className="text-4xl opacity-70">
              <card.icon />
            </div>
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          
        {/* 1. Customer Segments (Pie Chart) - สัดส่วนลูกค้าตามประเภทรถ */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">สัดส่วนลูกค้า (ตามประเภทรถ)</h2>
          <ResponsiveContainer width="100%" height={300}>
            {customerSegments.length > 0 ? (
              <PieChart>
                <Pie
                  data={customerSegments}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(1)}%)`}
                >
                  {customerSegments.map((entry, index) => (
                    <Cell 
                      key={`cell-${entry.name}`} 
                      fill={COLORS[index % COLORS.length]} 
                    />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name) => [`${formatNumber(value)} คัน`, name]}
                />
                <Legend />
              </PieChart>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                ไม่มีข้อมูลสัดส่วนลูกค้าในช่วงเวลาที่เลือก
              </div>
            )}
          </ResponsiveContainer>
        </div>

        {/* 2. Sessions By Hour (Bar Chart) - การใช้งานตามช่วงเวลา */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">จำนวนการเข้าใช้บริการตามช่วงเวลา (ต่อชั่วโมง)</h2>
          <ResponsiveContainer width="100%" height={300}>
            {sessionsByHour.length > 0 ? (
                <BarChart data={sessionsByHour} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                        dataKey="_id" 
                        label={{ value: 'ชั่วโมง', position: 'bottom' }} 
                        tickFormatter={(hour) => `${hour}:00`}
                    />
                    <YAxis 
                        label={{ value: 'จำนวนเซสชัน', angle: -90, position: 'insideLeft' }} 
                        allowDecimals={false}
                    />
                    <Tooltip 
                        formatter={(value) => `${formatNumber(value)} ครั้ง`}
                        labelFormatter={(label) => `เวลา ${label}:00 น.`}
                    />
                    <Legend />
                    <Bar 
                        dataKey="count" 
                        name="จำนวนเซสชัน" 
                        fill="#3b82f6" 
                        radius={[4, 4, 0, 0]} 
                    />
                </BarChart>
            ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                    ไม่มีข้อมูลการเข้าใช้บริการตามช่วงเวลาในช่วงเวลาที่เลือก
                </div>
            )}
          </ResponsiveContainer>
        </div>

      </div>

      {/* 3. Revenue by Slot (Line Chart) - รายได้ตามวัน */}
      <div className="mt-6 bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">รายได้รวมตามวัน (บาท)</h2>
        <ResponsiveContainer width="100%" height={350}>
            {revenueBySlot.length > 0 ? (
                <LineChart data={revenueBySlot} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                        dataKey="date" 
                        tickFormatter={formatDateForChart} 
                        label={{ value: 'วันที่', position: 'bottom' }}
                    />
                    <YAxis 
                        label={{ value: 'รายได้ (บาท)', angle: -90, position: 'insideLeft' }}
                        tickFormatter={formatNumber}
                    />
                    <Tooltip 
                        formatter={(value) => [`${formatNumber(value)} บาท`, 'รายได้']}
                        labelFormatter={(label) => format(new Date(label), 'EEEE, d MMMM yyyy', { locale: th })}
                    />
                    <Legend />
                    <Line 
                        type="monotone" 
                        dataKey="totalRevenue" 
                        name="รายได้รวม" 
                        stroke="#10b981" 
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 6 }}
                    />
                </LineChart>
            ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                    ไม่มีข้อมูลรายได้ในช่วงเวลาที่เลือก
                </div>
            )}
        </ResponsiveContainer>
      </div>

    </div>
  );
};

export default DashboardPage;