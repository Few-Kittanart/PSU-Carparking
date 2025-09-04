import React, { useState, useEffect } from "react";
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

export default function ManageAdditional() {
  const [search, setSearch] = useState("");
  const [additionalList, setAdditionalList] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:3000/api/additional")
      .then((res) => res.json())
      .then((data) => setAdditionalList(data));
  }, []);

  const filteredData = additionalList.filter(
    (row) =>
      row.customerName.includes(search) ||
      row.phone.includes(search)
  );

   return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold text-[#ea7f33]">
        การจัดการ - บริการเพิ่มเติม
      </h2>

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

      <TableContainer component={Paper} className="shadow-md mt-4">
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
                <TableCell>{row.customerName}</TableCell>
                <TableCell>{row.phone}</TableCell>
                <TableCell align="center">
                  <IconButton
                    color="primary"
                    title="รายละเอียด"
                    onClick={() => navigate(`/manage/additional/${row.id}`)}
                  >
                    <InfoIcon />
                  </IconButton>
                  <IconButton color="secondary" title="พิมพ์ใบบริการ">
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
