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
import InfoIcon from "@mui/icons-material/Info";
import { useNavigate } from "react-router-dom";

export default function CarPage() {
  const [search, setSearch] = useState("");
  const [carList, setCarList] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch("http://localhost:5000/api/customers", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        // ✅ แปลงข้อมูลลูกค้าให้อยู่ในรูปแบบรายการรถ
        const cars = data.flatMap(customer =>
          customer.cars.map(car => ({
            ...car, // ข้อมูลรถ
            customer_id: customer.customer_id, // เพิ่มข้อมูลลูกค้า
            customer_name: customer.customer_name,
            phone_number: customer.phone_number,
          }))
        );
        setCarList(cars);
      })
      .catch((err) => console.error(err));
  }, []);

  const filteredData = carList.filter((row) => {
    const searchLower = search.toLowerCase();
    return (
      row.car_registration?.toLowerCase().includes(searchLower) ||
      row.brand_car?.toLowerCase().includes(searchLower) ||
      row.customer_name?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold text-[#ea7f33]">การจัดการรถลูกค้า</h2>

      <div className="flex items-center gap-4">
        <TextField
          variant="outlined"
          size="small"
          label="ค้นหา (ทะเบียน, ยี่ห้อ, ชื่อลูกค้า)"
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
              <TableCell>ทะเบียนรถ</TableCell>
              <TableCell>ยี่ห้อ</TableCell>
              <TableCell>รุ่น</TableCell>
              <TableCell>สี</TableCell>
              <TableCell>ชื่อเจ้าของ</TableCell>
              <TableCell align="center">ดำเนินการ</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData.map((row, index) => (
              <TableRow key={row.customer_id + row.car_registration} hover>
                <TableCell align="center">{index + 1}</TableCell>
                <TableCell>
                  {row.car_registration} ({row.car_registration_province})
                </TableCell>
                <TableCell>{row.brand_car}</TableCell>
                <TableCell>{row.type_car}</TableCell>
                <TableCell>{row.color}</TableCell>
                <TableCell>{row.customer_name}</TableCell>
                <TableCell align="center">
                  <IconButton
                    color="primary"
                    title="รายละเอียด"
                    onClick={() => navigate(`/manage/details/${row.customer_id}`)}
                  >
                    <InfoIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {filteredData.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  ไม่พบข้อมูลรถลูกค้า
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}