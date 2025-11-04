import React, { useState, useEffect } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from "recharts";
import { format, subDays } from "date-fns";
import { th } from "date-fns/locale";
import { FaCarSide, FaDollarSign, FaUsers, FaClock, FaSearch, FaInfoCircle } from "react-icons/fa";

const API_URL = "http://localhost:5000/api";
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#E87A90", "#A1A8C8"];

// Helper Functions
const formatNumber = (num) => (num ? new Intl.NumberFormat('th-TH').format(num) : '0');
const formatDateForChart = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString.includes('T') ? dateString : dateString + 'T00:00:00');
  return format(date, 'd MMM', { locale: th });
};

const NoDataComponent = () => (
  <div className="flex flex-col justify-center items-center h-full text-gray-400">
    <FaInfoCircle className="text-4xl mb-2" />
    <p>ไม่มีข้อมูลในช่วงวันที่ที่เลือก</p>
  </div>
);

const DashboardPage = () => {
  const [summary, setSummary] = useState({});
  const [revenueBySlot, setRevenueBySlot] = useState([]);
  const [customerSegments, setCustomerSegments] = useState([]);
  const [revenueBreakdown, setRevenueBreakdown] = useState([]);
  const [monthlyTrend, setMonthlyTrend] = useState([]);
  const [topCustomers, setTopCustomers] = useState([]);
  const [topServices, setTopServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [serviceNameMap, setServiceNameMap] = useState({});

  // ✨ State ใหม่สำหรับเก็บข้อมูลรายรับตามวิธีชำระเงิน
  const [revenueByPaymentMethod, setRevenueByPaymentMethod] = useState([]);

  const [dateRange, setDateRange] = useState({
    startDate: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
  });

  const handleDateChange = (e) => {
    setDateRange({...dateRange, [e.target.name]: e.target.value });
  };

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    const { startDate, endDate } = dateRange;
    const token = localStorage.getItem("token");
    const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
    const params = `?startDate=${startDate}&endDate=${endDate}`;

    const pricesRes = await fetch(`${API_URL}/prices`, { headers });
    if (pricesRes.ok) {
        const pricesData = await pricesRes.json();
        const serviceMap = {};
        pricesData.additionalServices?.forEach(s => {
            serviceMap[s.id] = s.name;
        });
        setServiceNameMap(serviceMap);
    }

    const dashboardParams = `${API_URL}/dashboard`;
    const endpoints = [
      { key: 'summary', url: `${dashboardParams}/summary${params}`, setter: setSummary },
      { key: 'revenueBySlot', url: `${dashboardParams}/revenue-by-slot${params}`, setter: setRevenueBySlot },
      { key: 'customerSegments', url: `${dashboardParams}/customer-segments${params}`, setter: setCustomerSegments, processor: data => data.map(d => ({ name: d._id || 'ไม่ระบุ', value: d.count })) },
      { key: 'revenueBreakdown', url: `${dashboardParams}/revenue-breakdown${params}`, setter: setRevenueBreakdown },
      { key: 'monthlyTrend', url: `${dashboardParams}/monthly-trend${params}`, setter: setMonthlyTrend },
      { key: 'topCustomers', url: `${dashboardParams}/top-customers${params}`, setter: setTopCustomers },
      { key: 'topServices', url: `${dashboardParams}/services-by-count${params}`, setter: setTopServices },
      // ✨ เพิ่ม API Call ใหม่
      { 
        key: 'revenueByPaymentMethod', 
        url: `${dashboardParams}/revenue-by-payment-method${params}`, 
        setter: setRevenueByPaymentMethod,
        // แปลง 'cash' -> 'เงินสด', 'qr' -> 'สแกนจ่าย'
        processor: data => data.map(d => ({ ...d, name: d.name === 'cash' ? 'เงินสด' : 'สแกนจ่าย' })) 
      },
    ];

    try {
      await Promise.all(endpoints.map(ep =>
        fetch(ep.url, { headers })
          .then(res => res.ok ? res.json() : Promise.reject(new Error(`Failed to fetch ${ep.key}`)))
          .then(data => ep.processor ? ep.setter(ep.processor(data)) : ep.setter(data))
      ));
    } catch (err) {
      console.error(err);
      setError(err.message || "เกิดข้อผิดพลาดในการโหลดข้อมูล");
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => { fetchDashboardData(); }, []);

  const handleSearch = () => {
    fetchDashboardData();
  };

  const KPI_CARDS = [
    { title: "จำนวนรถทั้งหมด", value: formatNumber(summary.totalCars), icon: FaCarSide, color: "bg-blue-500" },
    { title: "รายได้รวม (บาท)", value: formatNumber(summary.totalRevenue), icon: FaDollarSign, color: "bg-green-500" },
    { title: "รถกำลังใช้บริการ", value: formatNumber(summary.activeSessions), icon: FaUsers, color: "bg-yellow-500" },
    { title: "เวลาจอดเฉลี่ย/ครั้ง", value: summary.averageParkingTime, icon: FaClock, color: "bg-red-500" },
  ];

  if(isLoading) return <div className="p-6 flex justify-center items-center min-h-screen text-xl">กำลังโหลดข้อมูล...</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Dashboard</h1>

      {/* Date Range */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 p-4 bg-white rounded-xl shadow-md items-center">
        <label className="font-semibold text-gray-600">จากวันที่:</label>
        <input type="date" name="startDate" value={dateRange.startDate} onChange={handleDateChange} className="p-2 border rounded-lg focus:ring-2 focus:ring-orange-500"/>
        <label className="font-semibold text-gray-600">ถึงวันที่:</label>
        <input type="date" name="endDate" value={dateRange.endDate} onChange={handleDateChange} className="p-2 border rounded-lg focus:ring-2 focus:ring-orange-500"/>
        <button onClick={handleSearch} className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-5 py-2 rounded-lg flex items-center gap-2 transition-all"><FaSearch/>ค้นหา</button>
      </div>

      {error && <div className="p-3 bg-red-100 text-red-700 rounded-lg mb-4">{error}</div>}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {KPI_CARDS.map((card,i)=>(
          <div key={i} className={`p-5 rounded-xl text-white shadow-lg flex items-center transition-transform hover:scale-105 ${card.color}`}>
            <div className="flex-grow">
              <p className="opacity-90">{card.title}</p>
              <p className="text-3xl font-bold">{card.value}</p>
            </div>
            <div className="text-4xl opacity-70"><card.icon/></div>
          </div>
        ))}
      </div>
      
      {/* ✨ ปรับ Layout เป็น 3 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">

        {/* Customer Segments Pie */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">สัดส่วนลูกค้า (ตามประเภทรถ)</h2>
          <ResponsiveContainer width="100%" height={300}>
            {customerSegments && customerSegments.length > 0 ? (
              <PieChart>
                <Pie data={customerSegments} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({name,percent})=>`${name} (${(percent*100).toFixed(0)}%)`}>
                  {customerSegments.map((e,i)=><Cell key={`cell-${i}`} fill={COLORS[i%COLORS.length]}/>)}
                </Pie>
                <Tooltip formatter={(value) => [`${formatNumber(value)} คัน`, "จำนวน"]}/>
                <Legend/>
              </PieChart>
            ): <NoDataComponent />}
          </ResponsiveContainer>
        </div>

        {/* Revenue Breakdown Pie */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">สัดส่วนรายได้ (บริการ)</h2>
          <ResponsiveContainer width="100%" height={300}>
            {revenueBreakdown && revenueBreakdown.length > 0 ? (
              <PieChart>
                <Pie data={revenueBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({name,percent})=>`${name} (${(percent*100).toFixed(0)}%)`}>
                  {revenueBreakdown.map((e,i)=><Cell key={`cell-${i}`} fill={COLORS[i%COLORS.length]}/>)}
                </Pie>
                <Tooltip formatter={(value) => [`${formatNumber(value)} บาท`, "รายได้"]}/>
                <Legend/>
              </PieChart>
            ): <NoDataComponent />}
          </ResponsiveContainer>
        </div>

        {/* ✨ กราฟใหม่: Revenue by Payment Method */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">สัดส่วนรายได้ (วิธีชำระเงิน)</h2>
          <ResponsiveContainer width="100%" height={300}>
            {revenueByPaymentMethod && revenueByPaymentMethod.length > 0 ? (
              <PieChart>
                <Pie data={revenueByPaymentMethod} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({name,percent})=>`${name} (${(percent*100).toFixed(0)}%)`}>
                  {revenueByPaymentMethod.map((e,i)=><Cell key={`cell-${i}`} fill={['#FFBB28', '#00C49F'][i%2]}/>)}
                </Pie>
                <Tooltip formatter={(value) => [`${formatNumber(value)} บาท`, "รายได้"]}/>
                <Legend/>
              </PieChart>
            ): <NoDataComponent />}
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* ส่วนที่เหลือของ Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Revenue by Day */}
        <div className="bg-white p-6 rounded-xl shadow-lg col-span-1 lg:col-span-2">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">รายได้รายวัน</h2>
            <ResponsiveContainer width="100%" height={300}>
                {revenueBySlot && revenueBySlot.length > 0 ? (
                <LineChart data={revenueBySlot}>
                    <CartesianGrid stroke="#f0f0f0" strokeDasharray="3 3"/>
                    <XAxis dataKey="date" tickFormatter={formatDateForChart}/>
                    <YAxis tickFormatter={formatNumber}/>
                    <Tooltip formatter={(value) => [`${formatNumber(value)} บาท`, "รายได้"]}/>
                    <Legend />
                    <Line type="monotone" dataKey="totalRevenue" name="รายได้รวม" stroke="#10b981" strokeWidth={2}/>
                </LineChart>
                ) : <NoDataComponent />}
            </ResponsiveContainer>
        </div>
        
        {/* Top Customers Table */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">5 ลูกค้าที่มาใช้บริการมากที่สุด</h2>
          {topCustomers && topCustomers.length > 0 ? (
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                <thead>
                    <tr className="bg-gray-50">
                    <th className="p-3 font-semibold">ชื่อลูกค้า</th>
                    <th className="p-3 font-semibold text-center">จำนวนครั้ง</th>
                    <th className="p-3 font-semibold text-right">ยอดใช้จ่าย (บาท)</th>
                    </tr>
                </thead>
                <tbody>
                    {topCustomers.map((c,i)=>(
                    <tr key={i} className="border-b hover:bg-gray-50">
                        <td className="p-3">{c.name}</td>
                        <td className="p-3 text-center">{c.visits}</td>
                        <td className="p-3 text-right font-medium text-green-600">{formatNumber(c.totalSpent)}</td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
          ): <NoDataComponent />}
        </div>
        
        {/* Top Services Table */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">5 บริการยอดนิยม</h2>
          {topServices && topServices.length > 0 ? (
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                <thead>
                    <tr className="bg-gray-50">
                    <th className="p-3 font-semibold">ชื่อบริการ</th>
                    <th className="p-3 font-semibold text-center">จำนวนครั้ง</th>
                    </tr>
                </thead>
                <tbody>
                    {topServices.map((s,i)=>(
                    <tr key={i} className="border-b hover:bg-gray-50">
                        <td className="p-3">{serviceNameMap[s._id] || `ID: ${s._id}`}</td>
                        <td className="p-3 text-center">{s.count}</td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
          ): <NoDataComponent />}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;