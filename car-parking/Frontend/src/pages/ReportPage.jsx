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
  IconButton,
  Tooltip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ExportIcon from "@mui/icons-material/Download";
import InfoIcon from "@mui/icons-material/Info";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import "dayjs/locale/th";

dayjs.extend(duration);
dayjs.locale("th");

export default function ReportPage() {
  const [allData, setAllData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    searchTerm: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:5000/api/customers", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          throw new Error("Failed to fetch reports");
        }

        const data = await res.json();
        const flattenedData = data
          .flatMap((customer) =>
            customer.cars.flatMap((car) =>
              car.service_history.map((service, serviceIndex) => ({
                service_id: `${customer._id}-${dayjs(service.entry_time).format(
                  "YYYYMMDDHHmmss"
                )}-${serviceIndex}`,
                customer_id: customer._id,
                customer_name: customer.customer_name,
                phone_number: customer.phone_number,
                car_registration: car.car_registration,
                car_registration_province: car.car_registration_province,
                brand_car: car.brand_car,
                type_car: car.type_car,
                color: car.color,
                entry_time: service.entry_time,
                exit_time: service.exit_time || "",
                parking_lot: service.parking_lot || "-",
                parking_slot: service.parking_slot || "-",
                services: service.services,
                total_price: service.total_price,
                is_paid: service.is_paid,
                note: service.note || "",
              }))
            )
          )
          .sort((a, b) => new Date(b.entry_time) - new Date(a.entry_time));

        setAllData(flattenedData);
        setFilteredData(flattenedData);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  useEffect(() => {
    let temp = [...allData];

    if (filters.startDate) {
      temp = temp.filter((row) =>
        dayjs(row.entry_time).isAfter(dayjs(filters.startDate).startOf("day"))
      );
    }
    if (filters.endDate) {
      temp = temp.filter((row) =>
        dayjs(row.entry_time).isBefore(dayjs(filters.endDate).endOf("day"))
      );
    }
    if (filters.searchTerm) {
      const searchTermLower = filters.searchTerm.toLowerCase();
      temp = temp.filter(
        (row) =>
          row.customer_name.toLowerCase().includes(searchTermLower) ||
          row.car_registration.toLowerCase().includes(searchTermLower)
      );
    }
    setFilteredData(temp);
  }, [allData, filters]);

  const calculateDuration = (entry, exit) => {
    if (!exit || !entry) return "-";
    const entryTime = dayjs(entry);
    const exitTime = dayjs(exit);
    const diff = dayjs.duration(exitTime.diff(entryTime));
    const days = diff.days();
    const hours = diff.hours();
    const minutes = diff.minutes();
    if (days > 0) {
      return `${days} วัน ${hours} ชั่วโมง`;
    } else {
      return `${hours} ชั่วโมง ${minutes} นาที`;
    }
  };

  const handleExport = () => {
    const header = [
      "ID การบริการ",
      "รหัสลูกค้า",
      "ชื่อ-นามสกุล",
      "เบอร์โทรศัพท์",
      "ทะเบียนรถ",
      "จังหวัด",
      "ยี่ห้อ",
      "รุ่น/ประเภท",
      "สี",
      "เวลาเข้า",
      "เวลาออก",
      "ระยะเวลา",
      "ช่องจอด",
      "บริการเพิ่มเติม",
      "ยอดรวม",
      "สถานะ",
    ];

    const rows = filteredData.map((row) => [
      row.service_id,
      row.customer_id,
      row.customer_name,
      row.phone_number,
      row.car_registration,
      row.car_registration_province,
      row.brand_car,
      row.type_car,
      row.color,
      dayjs(row.entry_time).format("YYYY-MM-DD HH:mm"),
      row.exit_time ? dayjs(row.exit_time).format("YYYY-MM-DD HH:mm") : "-",
      calculateDuration(row.entry_time, row.exit_time),
      row.parking_slot,
      row.services.join(", "),
      row.total_price,
      row.is_paid ? "ชำระแล้ว" : "ยังไม่ชำระ",
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
    link.setAttribute("download", `report_${dayjs().format("YYYY-MM-DD")}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-lg font-semibold">
        กำลังโหลดข้อมูล...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-lg font-semibold text-red-500">
        เกิดข้อผิดพลาดในการดึงข้อมูล: {error}
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-10 space-y-6">
      <h2 className="text-3xl font-bold text-[#ea7f33]">รายงานการบริการ</h2>

      {/* Filter Section */}
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
          onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
        />
        <TextField
          label="ค้นหา (ชื่อ/ทะเบียน)"
          size="small"
          value={filters.searchTerm}
          onChange={(e) =>
            setFilters({ ...filters, searchTerm: e.target.value })
          }
          InputProps={{
            endAdornment: <SearchIcon color="action" />,
          }}
          className="w-full sm:w-auto flex-1"
        />
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

      {/* Report Table */}
      <TableContainer component={Paper} className="shadow-lg">
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell className="font-bold">ลำดับ</TableCell>
              <TableCell className="font-bold">วันเข้ารับบริการ</TableCell>
              <TableCell className="font-bold">วันรับรถ</TableCell>
              <TableCell className="font-bold">วัน/ชั่วโมง</TableCell>
              <TableCell className="font-bold">ทะเบียนรถ</TableCell>
              <TableCell className="font-bold">จังหวัด</TableCell>
              <TableCell className="font-bold">ยี่ห้อ</TableCell>
              <TableCell className="font-bold">ชื่อลูกค้า</TableCell>
              <TableCell className="font-bold">ดำเนินการ</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData.length > 0 ? (
              filteredData.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    {dayjs(row.entry_time).format("DD/MM/YYYY")}
                  </TableCell>
                  <TableCell>
                    {row.exit_time
                      ? dayjs(row.exit_time).format("DD/MM/YYYY")
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {calculateDuration(row.entry_time, row.exit_time)}
                  </TableCell>
                  <TableCell>{row.car_registration}</TableCell>
                  <TableCell>{row.car_registration_province}</TableCell>
                  <TableCell>{row.brand_car}</TableCell>
                  <TableCell>{row.customer_name}</TableCell>
                  <TableCell>
                    <Tooltip title="ดูรายละเอียด">
                      <IconButton
                        onClick={() =>
                          navigate(
                            `/report/details/${row.customer_id}/${row.service_id}`
                          )
                        }
                      >
                        <InfoIcon color="primary" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={10} align="center">
                  ไม่พบข้อมูลตามเงื่อนไขที่เลือก
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}
