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
    paymentMethod: "all", // all, cash, transfer
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:5000/api/customers", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          throw new Error("Failed to fetch data");
        }

        const data = await res.json();
        const services = data.flatMap((customer) =>
          customer.cars.flatMap((car) =>
            car.service_history.map((service) => ({
              ...service,
              parking_lot: service.parking_lot || "ไม่ระบุ",
            }))
          )
        );
        setAllData(services);
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

    // Filter by date range
    if (filters.startDate) {
      temp = temp.filter(
        (row) => dayjs(row.entry_time).isAfter(dayjs(filters.startDate).startOf("day"))
      );
    }
    if (filters.endDate) {
      temp = temp.filter(
        (row) => dayjs(row.entry_time).isBefore(dayjs(filters.endDate).endOf("day"))
      );
    }

    // Filter by payment method
    if (filters.paymentMethod !== "all") {
      temp = temp.filter(
        (row) => row.payment_method === filters.paymentMethod
      );
    }

    // Grouping
    const groupedData = {};
    const format =
      filters.groupBy === "day" ? "YYYY-MM-DD" : filters.groupBy === "month" ? "YYYY-MM" : "YYYY";

    temp.forEach((service) => {
      const groupKey = dayjs(service.entry_time).format(format);
      if (!groupedData[groupKey]) {
        groupedData[groupKey] = {
          entryDate: groupKey,
          parkingLot: service.parking_lot,
          servicesCount: 0,
          exitCount: 0,
          income: 0,
        };
      }
      groupedData[groupKey].servicesCount += 1;
      if (service.exit_time) {
        groupedData[groupKey].exitCount += 1;
      }
      groupedData[groupKey].income += service.total_price || 0;
    });

    // Sort by date
    const finalData = Object.values(groupedData).sort((a, b) =>
      dayjs(b.entryDate).unix() - dayjs(a.entryDate).unix()
    );

    setFilteredData(finalData);
    setCurrentPage(1); // Reset to first page
  }, [allData, filters]);

  const handleExport = () => {
    const header = [
      "วันที่/เดือน/ปี", "ลานจอด", "จำนวนที่ใช้บริการ", "จำนวนรถที่ออก", "รายได้ทั้งหมด"
    ];
    const rows = filteredData.map((row) => [
      row.entryDate,
      row.parkingLot,
      row.servicesCount,
      row.exitCount,
      row.income,
    ]);
    const csvContent = [
      header.join(","),
      ...rows.map((e) => e.map(item => `"${item}"`).join(",")),
    ].join("\n");

    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `income_report_${dayjs().format("YYYY-MM-DD")}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
    return <div className="p-6 text-center text-lg text-red-500">เกิดข้อผิดพลาด: {error}</div>;
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
          onChange={(e) =>
            setFilters({ ...filters, endDate: e.target.value })
          }
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
        <ToggleButtonGroup
          value={filters.paymentMethod}
          exclusive
          onChange={(e, newPaymentMethod) => {
            if (newPaymentMethod) setFilters({ ...filters, paymentMethod: newPaymentMethod });
          }}
          size="small"
        >
          <ToggleButton value="all">ทั้งหมด</ToggleButton>
          <ToggleButton value="cash">เงินสด</ToggleButton>
          <ToggleButton value="transfer">โอนจ่าย</ToggleButton>
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
              <TableCell className="font-bold">ลาน</TableCell>
              <TableCell className="font-bold">วันที่/เดือน/ปี</TableCell>
              <TableCell className="font-bold">จำนวนที่ใช้บริการ</TableCell>
              <TableCell className="font-bold">จำนวนรถที่ออก</TableCell>
              <TableCell className="font-bold">รายได้</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {getPageData().length > 0 ? (
              getPageData().map((row, index) => (
                <TableRow key={index}>
                  <TableCell>{(currentPage - 1) * itemsPerPage + index + 1}</TableCell>
                  <TableCell>{row.parkingLot}</TableCell>
                  <TableCell>{row.entryDate}</TableCell>
                  <TableCell>{row.servicesCount}</TableCell>
                  <TableCell>{row.exitCount}</TableCell>
                  <TableCell>{row.income} บาท</TableCell>
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
      <div className="flex justify-center items-center gap-4 mt-4">
        <Button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(currentPage - 1)}
        >
          ย้อนกลับ
        </Button>
        <Typography>
          หน้า {currentPage} จาก {pageCount}
        </Typography>
        <Button
          disabled={currentPage === pageCount}
          onClick={() => setCurrentPage(currentPage + 1)}
        >
          ถัดไป
        </Button>
      </div>
    </div>
  );
}