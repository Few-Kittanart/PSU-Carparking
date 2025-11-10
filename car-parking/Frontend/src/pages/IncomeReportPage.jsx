import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Button,
  ButtonGroup,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  Box, // ◀️ เพิ่ม
  FormControl, // ◀️ เพิ่ม
  InputLabel, // ◀️ เพิ่ม
  MenuItem, // ◀️ เพิ่ม
  Select, // ◀️ เพิ่ม
  Stack, // ◀️ เพิ่ม
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ExportIcon from "@mui/icons-material/Download";
import dayjs from "dayjs";
import "dayjs/locale/th";

dayjs.locale("th");

export default function IncomeReportPage() {
  const [allData, setAllData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    groupBy: "day", // day, month, year, all
  });

  // 🔽 (แก้ไข 2 บรรทัดนี้) 🔽
  const [currentPage, setCurrentPage] = useState(
    () => Number(sessionStorage.getItem("incomeReportPage")) || 1
  );
  const [itemsPerPage, setItemsPerPage] = useState(
    () => Number(sessionStorage.getItem("incomeReportItemsPerPage")) || 10
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:5000/api/transactions", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to fetch transactions");

        const data = await res.json();

        // 🔽 (2) แก้ไข Logic การประมวลผลข้อมูล
        const transactions = data.flatMap((t) => {
          // 2.1 ตรวจสอบว่ามี serviceHistory และ "จ่ายเงินแล้ว" หรือไม่
          if (t.serviceHistory && t.serviceHistory.is_paid) {
            // 2.2 ถ้าจ่ายแล้ว, ใช้วันที่อัปเดต serviceHistory เป็น "วันที่รับเงิน"
            return [
              {
                id: t._id,
                date: t.serviceHistory.updatedAt, // ◀️ (สำคัญ!) ใช้วันที่จ่ายเงินจริง
                parking_lot: t.serviceHistory?.parking_slot || "ไม่ระบุ",
                total_price: t.serviceHistory?.total_price || 0,
                is_paid: true,
                payment_method: t.payment_method || "unknown",
              },
            ];
          }
          // 2.3 ถ้ายังไม่จ่าย "ไม่ต้องเอามารวมในรายงานรายได้"
          return [];
        });

        setAllData(transactions);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    let temp = [...allData];

    // Filter by date range (เหมือนเดิม)
    if (filters.startDate) {
      temp = temp.filter((t) =>
        dayjs(t.date).isAfter(dayjs(filters.startDate).startOf("day"))
      );
    }
    if (filters.endDate) {
      temp = temp.filter((t) =>
        dayjs(t.date).isBefore(dayjs(filters.endDate).endOf("day"))
      );
    }

    // 🔽 (ลบ) Filter by payment method (เราไม่ต้องการแล้ว)
    // if (filters.paymentMethod !== "all") { ... }

    // 🔽 (แก้ไข) Grouping Logic
    const groupedData = {};
    const format =
      filters.groupBy === "day"
        ? "YYYY-MM-DD"
        : filters.groupBy === "month"
        ? "YYYY-MM"
        : "YYYY";

    temp.forEach((t) => {
      const groupKey = dayjs(t.date).format(format);

      if (!groupedData[groupKey]) {
        groupedData[groupKey] = {
          entryDate: groupKey,
          servicesCount: 0,
          exitCount: 0,
          total_price: 0,
          total_cash: 0, // ◀️ เพิ่ม
          total_qr: 0, // ◀️ เพิ่ม
        };
      }

      groupedData[groupKey].servicesCount += 1;

      if (t.is_paid) {
        groupedData[groupKey].exitCount += 1;
      }

      // ◀️ (แก้ไข) Logic การบวกยอด
      const price = t.total_price || 0;
      groupedData[groupKey].total_price += price;

      if (t.payment_method === "cash") {
        groupedData[groupKey].total_cash += price;
      } else if (t.payment_method === "qr") {
        // (สมมติว่าใน DB เก็บเป็น 'qr')
        groupedData[groupKey].total_qr += price;
      }
    });

    const finalData = Object.values(groupedData).sort(
      (a, b) => dayjs(b.entryDate).unix() - dayjs(a.entryDate).unix()
    );

    setFilteredData(finalData);
    setCurrentPage(1);
  }, [allData, filters]);

  useEffect(() => {
    sessionStorage.setItem("incomeReportPage", currentPage);
  }, [currentPage]);

  // (จำจำนวนต่อหน้า)
  useEffect(() => {
    sessionStorage.setItem("incomeReportItemsPerPage", itemsPerPage);
  }, [itemsPerPage]);

  const handleExport = () => {
    // 🔽 (4.1) แก้ไข Headers ให้ตรงกับตาราง
    const header = [
      "วันที่/เดือน/ปี",
      "จำนวนที่ใช้บริการ",
      "จำนวนรถที่ออก",
      "รายได้ (เงินสด)",
      "รายได้ (สแกนจ่าย)",
      "รายได้รวม",
    ];

    // 🔽 (4.2) แก้ไข Rows ให้ดึงข้อมูลจาก groupedData (filteredData)
    const rows = filteredData.map((row) => [
      row.entryDate,
      row.servicesCount,
      row.exitCount,
      row.total_cash.toFixed(2),
      row.total_qr.toFixed(2),
      row.total_price.toFixed(2),
    ]);

    const csvContent = [
      header.join(","),
      ...rows.map((e) => e.map((item) => `"${item}"`).join(",")),
    ].join("\n");

    const blob = new Blob(["\ufeff" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `income_report_${filters.groupBy}_${dayjs().format("YYYY-MM-DD")}.csv` // (เพิ่ม groupBy ในชื่อไฟล์)
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleItemsPerPageChange = (event) => {
    setItemsPerPage(event.target.value);
    setCurrentPage(1); // กลับไปหน้า 1 เมื่อเปลี่ยนจำนวน
  };

  const getPageData = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredData.slice(startIndex, endIndex);
  };
  const pageCount = Math.ceil(filteredData.length / itemsPerPage);

  if (loading) {
    return <div className="p-6 text-center text-lg">กำลังโหลดข้อมูล...</div>;
  }
  if (error) {
    return (
      <div className="p-6 text-center text-lg text-red-500">
        เกิดข้อผิดพลาด: {error}
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-10 space-y-6">
      <h2 className="text-3xl font-bold text-[#ea7f33]">รายงานรายได้</h2>

      {/* Filter and Export Section */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200">
        <TextField
          label="วันที่เริ่มต้น"
          type="date"
          size="small"
          InputLabelProps={{ shrink: true }}
          value={filters.startDate}
          onChange={(e) =>
            setFilters({ ...filters, startDate: e.target.value })
          }
        />
        <TextField
          label="วันที่สิ้นสุด"
          type="date"
          size="small"
          InputLabelProps={{ shrink: true }}
          value={filters.endDate}
          onchange={(e) => setFilters({ ...filters, endDate: e.target.value })}
        />
        <ToggleButtonGroup
          value={filters.groupBy}
          exclusive
          onChange={(e, newGroupBy) => {
            if (newGroupBy) setFilters({ ...filters, groupBy: newGroupBy });
          }}
          size="small"
        >
          <ToggleButton value="day">รายวัน</ToggleButton>
          <ToggleButton value="month">รายเดือน</ToggleButton>
          <ToggleButton value="year">รายปี</ToggleButton>
        </ToggleButtonGroup>
        <Button
          variant="contained"
          onClick={handleExport}
          startIcon={<ExportIcon />}
          sx={{
            bgcolor: "#4caf50",
            "&:hover": { bgcolor: "#45a049" },
            mt: { xs: 2, sm: 0 },
          }}
        >
          Export CSV
        </Button>
      </div>

      {/* Income Report Table */}
      <TableContainer component={Paper} className="shadow-lg">
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell className="font-bold">ลำดับ</TableCell>
              <TableCell className="font-bold">วันที่/เดือน/ปี</TableCell>
              <TableCell className="font-bold">จำนวนที่ใช้บริการ</TableCell>
              <TableCell className="font-bold">จำนวนรถที่ออก</TableCell>
              <TableCell className="font-bold">รายได้ (เงินสด)</TableCell>
              <TableCell className="font-bold">รายได้ (สแกนจ่าย)</TableCell>
              <TableCell className="font-bold">รายได้รวม</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {getPageData().length > 0 ? (
              getPageData().map((row, index) => (
                <TableRow key={index}>
                  <TableCell>
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </TableCell>
                  <TableCell>{row.entryDate}</TableCell>
                  <TableCell>{row.servicesCount}</TableCell>
                  <TableCell>{row.exitCount}</TableCell>
                  <TableCell>{row.total_cash.toFixed(2)}</TableCell>
                  <TableCell>{row.total_qr.toFixed(2)}</TableCell>
                  <TableCell>{row.total_price.toFixed(2)} บาท</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  ไม่พบข้อมูลตามเงื่อนไขที่เลือก
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {/* 🔽 (6) เปลี่ยน UI ส่วนนี้ทั้งหมด 🔽 */}
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mt: 2, 
          p: 2, 
          bgcolor: 'background.paper',
          borderRadius: 1 
        }}
      >
        {/* (ตัวเลือกจำนวนต่อหน้า) */}
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>แสดง</InputLabel>
          <Select
            value={itemsPerPage}
            label="แสดง"
            onChange={handleItemsPerPageChange}
          >
            <MenuItem value={5}>5 รายการ</MenuItem>
            <MenuItem value={10}>10 รายการ</MenuItem>
            <MenuItem value={15}>15 รายการ</MenuItem>
            <MenuItem value={20}>20 รายการ</MenuItem>
          </Select>
        </FormControl>

        {/* (ตัวบอกหน้าและปุ่ม) */}
        <Stack direction="row" spacing={2} alignItems="center">
          <Typography>
            หน้า {currentPage} จาก {pageCount}
          </Typography>
          <Button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            ย้อนกลับ
          </Button>
          <Button
            disabled={currentPage === pageCount}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            ถัดไป
          </Button>
        </Stack>
      </Box>
    </div>
  );
}
