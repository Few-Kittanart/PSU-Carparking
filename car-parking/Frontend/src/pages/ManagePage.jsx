import React, { useState, useEffect } from "react";
import {
  TextField,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import PrintIcon from "@mui/icons-material/Print";
import InfoIcon from "@mui/icons-material/Info";
import { useNavigate } from "react-router-dom";

// Service definitions to map IDs to names
const PARKING_SERVICE_ID = 4;
const serviceDefinitions = [
  { id: 1, name: "ล้างรถ" },
  { id: 2, name: "เช็ดภายใน" },
  { id: 3, name: "ตรวจสภาพ" },
  { id: 4, name: "เช่าที่จอด" }
];

// ฟังก์ชันสำหรับแปลง ID บริการเป็นชื่อ
const getServiceNames = (serviceIds) => {
  if (!serviceIds) return null;
  const names = serviceIds.map(id => {
    const service = serviceDefinitions.find(s => s.id === id);
    return service ? service.name : null;
  }).filter(Boolean);
  return names.join(", ");
};

export default function ManagePage() {
  const [search, setSearch] = useState("");
  const [customerList, setCustomerList] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch("http://localhost:5000/api/customers", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Data fetched from API:", data);
        setCustomerList(data);
      })
      .catch((err) => console.error(err));
  }, []);

  const filteredData = customerList.filter((row) => {
    const hasParking = row.services?.includes(PARKING_SERVICE_ID);
    const hasAdditionalServices = row.services?.some(id => id !== PARKING_SERVICE_ID);
    
    switch (activeTab) {
      case "parking":
        return hasParking && !hasAdditionalServices;
      case "services":
        return !hasParking && hasAdditionalServices;
      case "parkingAndServices":
        return hasParking && hasAdditionalServices;
      case "all":
      default:
        return true;
    }
  }).filter(row => {
    const lowerSearch = search.toLowerCase();
    return (
      (row.customer_name?.toLowerCase().includes(lowerSearch) ||
        row.phone_number?.includes(lowerSearch) ||
        row.car_registration?.toLowerCase().includes(lowerSearch))
    );
  });

  const getActiveTabClass = (tabName) => {
    return `px-4 py-2 border-b-2 font-semibold ${
      activeTab === tabName
        ? "border-[#ea7f33] text-[#ea7f33]"
        : "border-transparent text-gray-500 hover:text-[#ea7f33]"
    }`;
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-[#ea7f33]">จัดการข้อมูลลูกค้า</h2>
        <div className="flex space-x-2">
          <TextField
            label="ค้นหา"
            variant="outlined"
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              endAdornment: (
                <IconButton>
                  <SearchIcon />
                </IconButton>
              ),
            }}
          />
        </div>
      </div>

      <div className="flex mb-4">
        <button
          onClick={() => setActiveTab("all")}
          className={`px-4 py-2 border-b-2 font-semibold ${
            activeTab === "all"
              ? "border-[#ea7f33] text-[#ea7f33]"
              : "border-transparent text-gray-500 hover:text-[#ea7f33]"
          }`}
        >
          ทั้งหมด
        </button>
        <button
          onClick={() => setActiveTab("parking")}
          className={`px-4 py-2 border-b-2 font-semibold ${
            activeTab === "parking"
              ? "border-[#ea7f33] text-[#ea7f33]"
              : "border-transparent text-gray-500 hover:text-[#ea7f33]"
          }`}
        >
          จอดรถ
        </button>
        <button
          onClick={() => setActiveTab("services")}
          className={`px-4 py-2 border-b-2 font-semibold ${
            activeTab === "services"
              ? "border-[#ea7f33] text-[#ea7f33]"
              : "border-transparent text-gray-500 hover:text-[#ea7f33]"
          }`}
        >
          บริการอื่นๆ
        </button>
        <button
          onClick={() => setActiveTab("parkingAndServices")}
          className={`px-4 py-2 border-b-2 font-semibold ${
            activeTab === "parkingAndServices"
              ? "border-[#ea7f33] text-[#ea7f33]"
              : "border-transparent text-gray-500 hover:text-[#ea7f33]"
          }`}
        >
          จอดรถ+บริการ
        </button>
      </div>

      <TableContainer component={Paper} className="shadow-md rounded-lg">
        <Table aria-label="simple table">
          <TableHead className="bg-[#ea7f33]">
            <TableRow>
              <TableCell className="text-white">ลำดับ</TableCell>
              <TableCell className="text-white">รหัสลูกค้า</TableCell>
              <TableCell className="text-white">ชื่อ-นามสกุล</TableCell>
              <TableCell className="text-white">เบอร์โทรศัพท์</TableCell>
              <TableCell className="text-white">ทะเบียนรถ</TableCell>
              <TableCell className="text-white">จังหวัด (ป้าย)</TableCell>
              <TableCell className="text-white">ยี่ห้อรถ</TableCell>
              <TableCell className="text-white">สีรถ</TableCell>
              <TableCell className="text-white">บริการ</TableCell>
              <TableCell className="text-white" align="center">
                จัดการ
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData.map((row, index) => (
              <TableRow key={row.customer_id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{row.customer_id}</TableCell>
                <TableCell>{row.customer_name}</TableCell>
                <TableCell>{row.phone_number}</TableCell>
                <TableCell>{row.car_registration}</TableCell>
                <TableCell>{row.car_registration_province}</TableCell>
                <TableCell>{row.brand_car}</TableCell>
                <TableCell>{row.color}</TableCell>
                <TableCell>
                  <div className="flex flex-col space-y-2">
                    {/* แสดงป้ายสำหรับ "เช่าที่จอด" ถ้ามี */}
                    {row.services?.includes(PARKING_SERVICE_ID) && (
                      <span className="bg-[#ea7f33] text-white px-2 py-1 rounded-full text-xs self-start">
                       {row.parking_slot}
                      </span>
                    )}

                    {/* แสดงป้ายสำหรับ "บริการเพิ่มเติม" ถ้ามี */}
                    {row.services?.filter(id => id !== PARKING_SERVICE_ID).length > 0 && (
                      <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs self-start">
                        {getServiceNames(row.services?.filter(id => id !== PARKING_SERVICE_ID))}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell align="center">
                  <IconButton
                    color="primary"
                    title="รายละเอียด"
                    onClick={() => navigate(`/manage/details/${row.customer_id}`)}
                  >
                    <InfoIcon />
                  </IconButton>
                  <IconButton color="secondary" title="พิมพ์ใบรับบริการ">
                    <PrintIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {filteredData.length === 0 && (
              <TableRow>
                <TableCell colSpan={10} align="center">
                  ไม่พบข้อมูล
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}