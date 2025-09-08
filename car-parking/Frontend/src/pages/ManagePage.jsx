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
];

export default function ManagePage() {
  const [search, setSearch] = useState("");
  const [customerList, setCustomerList] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const navigate = useNavigate();

  // Fetch all customer data
  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch("http://localhost:5000/api/customers", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setCustomerList(data))
      .catch((err) => console.error(err));
  }, []);

  const getServiceNames = (serviceIds) => {
    return serviceIds
      ?.map((id) => {
        const service = serviceDefinitions.find((s) => s.id === id);
        return service ? service.name : "";
      })
      .filter(Boolean)
      .join(", ");
  };

  // Filtering logic
  const isParkingOnly = (customer) => {
    return (
      customer.services?.includes(PARKING_SERVICE_ID) &&
      customer.services?.length === 1
    );
  };

  const isAdditionalOnly = (customer) => {
    return (
      customer.services?.some((id) => id !== PARKING_SERVICE_ID) &&
      !customer.services?.includes(PARKING_SERVICE_ID)
    );
  };

  const isBothServices = (customer) => {
    return (
      customer.services?.includes(PARKING_SERVICE_ID) &&
      customer.services?.some((id) => id !== PARKING_SERVICE_ID)
    );
  };

  const filteredData = customerList.filter((row) => {
    const searchLower = search.toLowerCase();
    const matchesSearch =
      row.car_registration?.toLowerCase().includes(searchLower) ||
      row.customer_name?.toLowerCase().includes(searchLower) ||
      row.phone_number?.toLowerCase().includes(searchLower);

    switch (activeTab) {
      case "parking":
        return isParkingOnly(row) && matchesSearch;
      case "additional":
        return isAdditionalOnly(row) && matchesSearch;
      case "both":
        return isBothServices(row) && matchesSearch;
      default:
        // 'all' tab
        const hasService = row.services?.length > 0;
        return hasService && matchesSearch;
    }
  });

  const getActiveTabClass = (tabName) => {
    return `px-6 py-2 rounded-lg font-bold transition-colors ${
      activeTab === tabName
        ? "bg-[#ea7f33] text-white shadow-md"
        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
    }`;
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold text-[#ea7f33]">การจัดการรถ</h2>

      <div className="flex items-center gap-4">
        <TextField
          variant="outlined"
          size="small"
          label="ค้นหา (ทะเบียน, ลูกค้า, เบอร์)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            endAdornment: <SearchIcon color="action" />,
          }}
          className="w-80"
        />
      </div>

      <div className="flex gap-2 mt-4">
        <button
          className={getActiveTabClass("all")}
          onClick={() => setActiveTab("all")}
        >
          ทั้งหมด
        </button>
        <button
          className={getActiveTabClass("parking")}
          onClick={() => setActiveTab("parking")}
        >
          เช่าที่จอดอย่างเดียว
        </button>
        <button
          className={getActiveTabClass("additional")}
          onClick={() => setActiveTab("additional")}
        >
          บริการเพิ่มเติมอย่างเดียว
        </button>
        <button
          className={getActiveTabClass("both")}
          onClick={() => setActiveTab("both")}
        >
          ทั้งเช่าที่จอด + บริการเพิ่มเติม
        </button>
      </div>

      <TableContainer component={Paper} className="shadow-md mt-4">
        <Table>
          <TableHead>
            <TableRow className="bg-gray-100">
              <TableCell align="center">ลำดับ</TableCell>
              <TableCell>รหัสลูกค้า</TableCell>
              <TableCell>วันที่เข้ารับบริการ</TableCell>
              <TableCell>ทะเบียนรถ</TableCell>
              <TableCell>ยี่ห้อ</TableCell>
              <TableCell>สี</TableCell>
              <TableCell>ชื่อลูกค้า</TableCell>
              <TableCell>เบอร์โทรศัพท์</TableCell>
              <TableCell>บริการ</TableCell>
              <TableCell align="center">ดำเนินการ</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData.map((row, index) => (
              <TableRow key={row.customer_id} hover>
                <TableCell align="center">{index + 1}</TableCell>
                <TableCell>{row.customer_id}</TableCell>
                <TableCell>{row.entry_time}</TableCell>
                <TableCell>{row.car_registration}</TableCell>
                <TableCell>{row.brand_car}</TableCell>
                <TableCell>{row.color}</TableCell>
                <TableCell>{row.customer_name}</TableCell>
                <TableCell>{row.phone_number}</TableCell>
                <TableCell>
                  {/* แสดงป้ายกำกับ "จอดรถ" ถ้ามีบริการนี้ */}
                  {row.services?.includes(PARKING_SERVICE_ID) && (
                    <span className="bg-[#ea7f33] text-white px-2 py-1 rounded-full text-xs mr-2">
                      จอดรถ ({row.parking_slot})
                    </span>
                  )}
                  {/* แสดงชื่อบริการเพิ่มเติมอื่น ๆ */}
                  {getServiceNames(row.services?.filter(id => id !== PARKING_SERVICE_ID) || [])}
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