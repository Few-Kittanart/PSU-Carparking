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

export default function CustomerPage() {
  const [search, setSearch] = useState("");
  const [customerList, setCustomerList] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch("http://localhost:5000/api/customers", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setCustomerList(data);
      })
      .catch((err) => console.error(err));
  }, []);

  const filteredData = customerList.filter((row) => {
    const searchLower = search.toLowerCase();
    return (
      row.customer_name?.toLowerCase().includes(searchLower) ||
      row.phone_number?.toLowerCase().includes(searchLower) ||
      row.customer_id?.toString().includes(searchLower)
    );
  });

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold text-[#ea7f33]">การจัดการลูกค้า</h2>

      <div className="flex items-center gap-4">
        <TextField
          variant="outlined"
          size="small"
          label="ค้นหา (รหัส, ชื่อ, เบอร์โทรศัพท์)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            endAdornment: <SearchIcon color="action" />,
          }}
          className="w-80"
        />
      </div>

      <TableContainer component={Paper} className="shadow-md mt-4">
        <Table>
          <TableHead>
            <TableRow className="bg-gray-100">
              <TableCell align="center">ลำดับ</TableCell>
              <TableCell>รหัสลูกค้า</TableCell>
              <TableCell>ชื่อลูกค้า</TableCell>
              <TableCell>เบอร์โทรศัพท์</TableCell>
              <TableCell>ที่อยู่</TableCell>
              <TableCell align="center">ดำเนินการ</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData.map((row, index) => (
              <TableRow key={row.customer_id} hover>
                <TableCell align="center">{index + 1}</TableCell>
                <TableCell>{row.customer_id}</TableCell>
                <TableCell>{row.customer_name}</TableCell>
                <TableCell>{row.phone_number}</TableCell>
                <TableCell>
                  {row.house_number}, {row.road}, {row.canton}, {row.district}, {row.province}
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
                <TableCell colSpan={6} align="center">
                  ไม่พบข้อมูลลูกค้า
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}