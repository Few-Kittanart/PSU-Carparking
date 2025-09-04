import React, { useState } from "react";
import {
  TextField,
  Button,
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

export default function ManageParking() {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  // ตัวอย่างข้อมูล mock
  const data = [
    {
      id: "BK001",
      dateIn: "2025-09-01 10:30",
      dateOut: "2025-09-02 12:00",
      plate: "กข 1234",
      province: "กรุงเทพฯ",
      brand: "Toyota",
      customer: "สมชาย ใจดี",
      phone: "0812345678",
    },
    {
      id: "BK002",
      dateIn: "2025-09-03 09:00",
      dateOut: "2025-09-03 17:00",
      plate: "ขข 5678",
      province: "เชียงใหม่",
      brand: "Honda",
      customer: "วิภา แสงทอง",
      phone: "0898765432",
    },
  ];

  // กรองข้อมูลตาม search
  const filteredData = data.filter(
    (row) =>
      row.plate.includes(search) ||
      row.customer.includes(search) ||
      row.phone.includes(search)
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <h2 className="text-2xl font-bold text-[#ea7f33]">การจัดการรถ - เช่าที่จอด</h2>

      {/* Search + Filter */}
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
        <Button variant="outlined" color="warning">
          ตัวกรอง
        </Button>
      </div>

      {/* Table */}
      <TableContainer component={Paper} className="shadow-md">
        <Table>
          <TableHead>
            <TableRow className="bg-gray-100">
              <TableCell align="center">ลำดับ</TableCell>
              <TableCell>ID</TableCell>
              <TableCell>วันที่เข้ารับบริการ</TableCell>
              <TableCell>วันที่รับรถ</TableCell>
              <TableCell>ทะเบียนรถ</TableCell>
              <TableCell>จังหวัด</TableCell>
              <TableCell>ยี่ห้อ</TableCell>
              <TableCell>ชื่อลูกค้า</TableCell>
              <TableCell>เบอร์โทรศัพท์</TableCell>
              <TableCell align="center">ดำเนินการ</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData.map((row, index) => (
              <TableRow key={row.id} hover>
                <TableCell align="center">{index + 1}</TableCell>
                <TableCell>{row.id}</TableCell>
                <TableCell>{row.dateIn}</TableCell>
                <TableCell>{row.dateOut}</TableCell>
                <TableCell>{row.plate}</TableCell>
                <TableCell>{row.province}</TableCell>
                <TableCell>{row.brand}</TableCell>
                <TableCell>{row.customer}</TableCell>
                <TableCell>{row.phone}</TableCell>
                <TableCell align="center">
                  <IconButton
                    color="primary"
                    title="รายละเอียด"
                    onClick={() => navigate(`/manage/parking/${row.id}`)}
                  >
                    <InfoIcon />
                  </IconButton>
                  <IconButton color="secondary" title="พิมพ์ใบจองที่จอด">
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
