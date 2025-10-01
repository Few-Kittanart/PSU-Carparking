import React, { useState, useEffect } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from "recharts";
import { format, subDays } from "date-fns";
import { th } from "date-fns/locale";
import { FaCarSide, FaDollarSign, FaUsers, FaClock, FaSearch } from "react-icons/fa";

const API_URL = "http://localhost:5000/api/dashboard";
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#E87A90", "#A1A8C8"];

const formatNumber = (num) => (num ? new Intl.NumberFormat('th-TH').format(num) : '0');
const formatDateForChart = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString.includes('T') ? dateString : dateString + 'T00:00:00');
  return format(date, 'd MMM', { locale: th });
};
const formatDuration = (ms) => {
  if (!ms) return "0 ชั่วโมง 0 นาที";
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  return `${h} ชั่วโมง ${m} นาที`;
};

const DashboardPage = () => {
  const [summary, setSummary] = useState({});
  const [revenueBySlot, setRevenueBySlot] = useState([]);
  const [customerSegments, setCustomerSegments] = useState([]);
  const [revenueBreakdown, setRevenueBreakdown] = useState([]);
  const [activeSessionsByDay, setActiveSessionsByDay] = useState([]);
  const [monthlyTrend, setMonthlyTrend] = useState([]);
  const [topCustomers, setTopCustomers] = useState([]);
  const [topServices, setTopServices] = useState([]);
  const [avgServiceDuration, setAvgServiceDuration] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

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

    const endpoints = [
      { key: 'summary', url: `${API_URL}/summary${params}`, setter: setSummary },
      { key: 'revenueBySlot', url: `${API_URL}/revenue-by-slot${params}`, setter: setRevenueBySlot },
      { key: 'customerSegments', url: `${API_URL}/customer-segments${params}`, setter: setCustomerSegments, processor: data => data.map(d => ({ name: d._id || 'ไม่ระบุ', value: d.count })) },
      { key: 'revenueBreakdown', url: `${API_URL}/revenue-breakdown${params}`, setter: setRevenueBreakdown },
      { key: 'activeSessionsByDay', url: `${API_URL}/active-sessions${params}`, setter: setActiveSessionsByDay },
      { key: 'monthlyTrend', url: `${API_URL}/monthly-trend${params}`, setter: setMonthlyTrend },
      { key: 'topCustomers', url: `${API_URL}/top-customers${params}`, setter: setTopCustomers },
      { key: 'topServices', url: `${API_URL}/services-by-count${params}`, setter: setTopServices },
      { key: 'avgServiceDuration', url: `${API_URL}/avg-service-duration${params}`, setter: setAvgServiceDuration },
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

  useEffect(() => { fetchDashboardData(); }, [dateRange]);

  const KPI_CARDS = [
    { title: "จำนวนรถทั้งหมด", value: formatNumber(summary.totalCars), icon: FaCarSide, color: "bg-blue-500" },
    { title: "รายได้รวม (บาท)", value: formatNumber(summary.totalRevenue), icon: FaDollarSign, color: "bg-green-500" },
    { title: "รถกำลังใช้บริการ", value: formatNumber(summary.activeSessions), icon: FaUsers, color: "bg-yellow-500" },
    { title: "เวลาจอดเฉลี่ย/ครั้ง", value: summary.averageParkingTime, icon: FaClock, color: "bg-red-500" },
  ];

  if(isLoading) return <div className="p-6 flex justify-center items-center min-h-screen text-xl">กำลังโหลดข้อมูล...</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">ภาพรวม Dashboard</h1>

      {/* Date Range */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 p-4 bg-white rounded-xl shadow-md items-center">
        <label>จากวันที่:</label>
        <input type="date" name="startDate" value={dateRange.startDate} onChange={handleDateChange} className="p-2 border rounded"/>
        <label>ถึงวันที่:</label>
        <input type="date" name="endDate" value={dateRange.endDate} onChange={handleDateChange} className="p-2 border rounded"/>
        <button onClick={fetchDashboardData} className="bg-orange-600 text-white px-4 py-2 rounded flex items-center gap-2"><FaSearch/>ค้นหา</button>
      </div>

      {error && <div className="p-3 bg-red-100 text-red-600 rounded mb-4">{error}</div>}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {KPI_CARDS.map((card,i)=>(
          <div key={i} className={`p-5 rounded-xl text-white shadow-xl flex items-center ${card.color}`}>
            <div className="flex-grow">
              <p>{card.title}</p>
              <p className="text-3xl font-bold">{card.value}</p>
            </div>
            <div className="text-4xl opacity-70"><card.icon/></div>
          </div>
        ))}
      </div>

      {/* Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">

        {/* Customer Segments Pie */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold mb-4">สัดส่วนลูกค้า (ประเภทรถ)</h2>
          <ResponsiveContainer width="100%" height={300}>
            {customerSegments.length>0 ? (
              <PieChart>
                <Pie data={customerSegments} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({name,percent})=>`${name} (${(percent*100).toFixed(1)}%)`}>
                  {customerSegments.map((e,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
                </Pie>
                <Tooltip formatter={v=>[formatNumber(v)+' คัน']}/>
                <Legend/>
              </PieChart>
            ): <div className="flex justify-center items-center h-full text-gray-500">ไม่มีข้อมูล</div>}
          </ResponsiveContainer>
        </div>

        {/* Revenue Breakdown Pie */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Revenue Breakdown</h2>
          <ResponsiveContainer width="100%" height={300}>
            {revenueBreakdown.length>0 ? (
              <PieChart>
                <Pie data={revenueBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({name,percent})=>`${name} (${(percent*100).toFixed(1)}%)`}>
                  {revenueBreakdown.map((e,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
                </Pie>
                <Tooltip formatter={v=>[formatNumber(v)+' บาท']}/>
                <Legend/>
              </PieChart>
            ): <div className="flex justify-center items-center h-full text-gray-500">ไม่มีข้อมูล</div>}
          </ResponsiveContainer>
        </div>

        {/* Active Sessions */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold mb-4">จำนวนรถที่กำลังใช้บริการต่อวัน</h2>
          <ResponsiveContainer width="100%" height={300}>
            {activeSessionsByDay.length>0 ? (
              <BarChart data={activeSessionsByDay}>
                <CartesianGrid stroke="#f0f0f0" strokeDasharray="3 3"/>
                <XAxis dataKey="date" tickFormatter={formatDateForChart}/>
                <YAxis/>
                <Tooltip formatter={v=>[v+' คัน']}/>
                <Bar dataKey="activeCount" fill="#FF8042"/>
              </BarChart>
            ) : <div className="flex justify-center items-center h-full text-gray-500">ไม่มีข้อมูล</div>}
          </ResponsiveContainer>
        </div>

        {/* Monthly Trend */}
        <div className="bg-white p-6 rounded-xl shadow-lg col-span-2">
          <h2 className="text-xl font-semibold mb-4">Monthly Trend</h2>
          <ResponsiveContainer width="100%" height={350}>
            {monthlyTrend.length>0 ? (
              <LineChart data={monthlyTrend}>
                <CartesianGrid stroke="#f0f0f0" strokeDasharray="3 3"/>
                <XAxis dataKey="month"/>
                <YAxis/>
                <Tooltip/>
                <Legend/>
                <Line type="monotone" dataKey="revenue" name="รายได้" stroke="#10b981"/>
                <Line type="monotone" dataKey="customers" name="ลูกค้าใหม่" stroke="#0088FE"/>
                <Line type="monotone" dataKey="cars" name="รถใหม่" stroke="#FF8042"/>
              </LineChart>
            ) : <div className="flex justify-center items-center h-full text-gray-500">ไม่มีข้อมูล</div>}
          </ResponsiveContainer>
        </div>

        {/* Top Customers Table */}
        <div className="bg-white p-6 rounded-xl shadow-lg col-span-1">
          <h2 className="text-xl font-semibold mb-4">Top Customers</h2>
          {topCustomers.length>0 ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="border-b px-2 py-1">Name</th>
                  <th className="border-b px-2 py-1">Visits</th>
                  <th className="border-b px-2 py-1">Total Spent</th>
                </tr>
              </thead>
              <tbody>
                {topCustomers.map((c,i)=>(
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="border-b px-2 py-1">{c.name}</td>
                    <td className="border-b px-2 py-1">{c.visits}</td>
                    <td className="border-b px-2 py-1">{formatNumber(c.totalSpent)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ): <div>ไม่มีข้อมูล</div>}
        </div>

        {/* Top Services Table */}
        <div className="bg-white p-6 rounded-xl shadow-lg col-span-1">
          <h2 className="text-xl font-semibold mb-4">Top Services</h2>
          {topServices.length>0 ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="border-b px-2 py-1">Service ID</th>
                  <th className="border-b px-2 py-1">Count</th>
                </tr>
              </thead>
              <tbody>
                {topServices.map((s,i)=>(
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="border-b px-2 py-1">{s._id}</td>
                    <td className="border-b px-2 py-1">{s.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ): <div>ไม่มีข้อมูล</div>}
        </div>

        {/* Avg Service Duration */}
        <div className="bg-white p-6 rounded-xl shadow-lg col-span-2">
          <h2 className="text-xl font-semibold mb-4">Average Service Duration</h2>
          {avgServiceDuration.length>0 ? (
            <BarChart data={avgServiceDuration} height={300}>
              <CartesianGrid stroke="#f0f0f0" strokeDasharray="3 3"/>
              <XAxis dataKey="serviceId"/>
              <YAxis tickFormatter={v=>`${Math.floor(v/3600000)}h ${(Math.floor(v/60000)%60)}m`}/>
              <Tooltip formatter={v=>`${Math.floor(v/3600000)} ชั่วโมง ${(Math.floor(v/60000)%60)} นาที`}/>
              <Bar dataKey="avgDuration" fill="#A1A8C8"/>
            </BarChart>
          ) : <div className="flex justify-center items-center h-full text-gray-500">ไม่มีข้อมูล</div>}
        </div>

      </div>
    </div>
  );
};

export default DashboardPage;
