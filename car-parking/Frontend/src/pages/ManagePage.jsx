import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

export default function ManagePage() {
  const [unpaidServices, setUnpaidServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("allServices");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUnpaidServices = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          "http://localhost:5000/api/customers/unpaid-services",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!res.ok) throw new Error("Failed to fetch data");
        const data = await res.json();
        setUnpaidServices(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUnpaidServices();
  }, []);

  if (loading)
    return (
      <div className="p-6 text-center text-lg font-semibold">
        กำลังโหลดข้อมูล...
      </div>
    );

  if (error)
    return (
      <div className="p-6 text-center text-lg font-semibold text-red-500">
        เกิดข้อผิดพลาด: {error}
      </div>
    );

  // Filter tabs
  const parkingOnly = unpaidServices.filter(
    (s) => s.parking_slot && s.services.length === 0
  );
  const additionalOnly = unpaidServices.filter(
    (s) => !s.parking_slot && s.services.length > 0
  );
  const parkingAndAdditional = unpaidServices.filter(
    (s) => s.parking_slot && s.services.length > 0
  );

  const renderTable = (data) => (
    <TableContainer component={Paper} className="shadow-lg">
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell className="font-bold text-lg text-gray-700">
              รหัสลูกค้า
            </TableCell>
            <TableCell className="font-bold text-lg text-gray-700">
              ชื่อ-นามสกุล
            </TableCell>
            <TableCell className="font-bold text-lg text-gray-700">
              เบอร์โทรศัพท์
            </TableCell>
            <TableCell className="font-bold text-lg text-gray-700">
              ทะเบียนรถ
            </TableCell>
            <TableCell className="font-bold text-lg text-gray-700">
              เวลาเข้า
            </TableCell>
            <TableCell className="font-bold text-lg text-gray-700 text-center">
              ประเภทบริการ
            </TableCell>
            <TableCell className="font-bold text-lg text-gray-700">
              ยอดรวม
            </TableCell>
            <TableCell className="font-bold text-lg text-gray-700">
              ดำเนินการ
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.length > 0 ? (
            data.map((service) => {
              const hasParking = !!service.parking_slot;
              const hasServices = service.services.length > 0;
              let serviceType, bgColor;

              if (hasParking && hasServices) {
                serviceType = `${service.parking_slot} + บริการเพิ่มเติม`;
                bgColor = "bg-purple-500";
              } else if (hasParking) {
                serviceType = service.parking_slot;
                bgColor = "bg-orange-400";
              } else if (hasServices) {
                serviceType = "บริการเพิ่มเติม";
                bgColor = "bg-green-500";
              } else {
                serviceType = "ไม่ระบุ";
                bgColor = "bg-gray-400";
              }

              return (
                <TableRow key={service.service_id}>
                  <TableCell>{service.customer_id}</TableCell>
                  <TableCell>{service.customer_name}</TableCell>
                  <TableCell>{service.phone_number}</TableCell>
                  <TableCell>{service.car_registration}</TableCell>
                  <TableCell>
                    {dayjs(service.entry_time).format("DD/MM/YYYY HH:mm")}
                  </TableCell>
                  <TableCell>
                    <div
                      className={`text-center py-2 px-3 rounded-full text-white font-semibold ${bgColor}`}
                    >
                      {serviceType}
                    </div>
                  </TableCell>
                  <TableCell>{service.total_price.toFixed(2)} บาท</TableCell>
                  <TableCell>
                    <Tooltip title="ดูรายละเอียด">
                      <IconButton
                        onClick={() => {
                          navigate(
                            `/manage/detail/${service.customer_id}/${service.car_id}/${service.service_id}`
                          );
                        }}
                      >
                        <SearchIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={8} align="center">
                ไม่มีรายการประเภทนี้ในขณะนี้
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <div className="p-6 sm:p-10 space-y-8">
      <h2 className="text-3xl font-bold text-[#ea7f33]">จัดการบริการ</h2>

      <div className="flex flex-wrap gap-4 text-sm font-medium ">
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded-full bg-orange-400"></span>
          <span>เช่าที่จอด</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded-full bg-green-500"></span>
          <span>บริการเพิ่มเติม</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded-full bg-purple-500"></span>
          <span>ทั้งสองอย่าง</span>
        </div>
      </div>

      <div className="flex gap-4 border-b border-gray-300">
        <button
          onClick={() => setActiveTab("allServices")}
          className={`py-3 px-6 font-semibold transition-colors ${
            activeTab === "allServices"
              ? "text-[#ea7f33] border-b-2 border-[#ea7f33]"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          ทั้งหมด
        </button>
        <button
          onClick={() => setActiveTab("parkingAndAdditional")}
          className={`py-3 px-6 font-semibold transition-colors ${
            activeTab === "parkingAndAdditional"
              ? "text-[#ea7f33] border-b-2 border-[#ea7f33]"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          เช่าที่จอด + บริการเพิ่มเติม
        </button>
        <button
          onClick={() => setActiveTab("parkingOnly")}
          className={`py-3 px-6 font-semibold transition-colors ${
            activeTab === "parkingOnly"
              ? "text-[#ea7f33] border-b-2 border-[#ea7f33]"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          เฉพาะเช่าที่จอด
        </button>
        <button
          onClick={() => setActiveTab("additionalOnly")}
          className={`py-3 px-6 font-semibold transition-colors ${
            activeTab === "additionalOnly"
              ? "text-[#ea7f33] border-b-2 border-[#ea7f33]"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          เฉพาะบริการเพิ่มเติม
        </button>
      </div>

      {activeTab === "allServices" && renderTable(unpaidServices)}
      {activeTab === "parkingAndAdditional" &&
        renderTable(parkingAndAdditional)}
      {activeTab === "parkingOnly" && renderTable(parkingOnly)}
      {activeTab === "additionalOnly" && renderTable(additionalOnly)}
    </div>
  );
}
