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
import PrintIcon from "@mui/icons-material/Print"; // ✅ 1. Import PrintIcon
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import "dayjs/locale/th";
import { CSVLink } from "react-csv";
import { useSettings } from "../context/SettingContext"; // ✅ 2. Import useSettings
import pdfMake from "pdfmake/build/pdfmake"; // ✅ 3. Import pdfMake
import pdfFonts from "../lib/pdfFonts"; // ✅ 4. Import pdfFonts

dayjs.extend(duration);
dayjs.locale("th");
pdfMake.fonts = pdfFonts; // ✅ 5. Setup Font

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

  const [exportData, setExportData] = useState([]);
  const [exportHeaders, setExportHeaders] = useState([]);

  const [serviceNameMap, setServiceNameMap] = useState({});
  const [parkingSlotMap, setParkingSlotMap] = useState({});

  const { settings, loading: settingsLoading } = useSettings(); // ✅ 6. Get settings

  // (useEffect fetchReports ... เหมือนเดิม)
  useEffect(() => {
    const fetchReports = async () => {
      // ... (โค้ด fetch ข้อมูล price, slot, customer เหมือนเดิม) ...
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        // --- (A) Fetch Prices ---
        const pricesRes = await fetch("http://localhost:5000/api/prices", { headers });
        if (pricesRes.ok) {
          const pricesData = await pricesRes.json();
          const serviceMap = {};
          pricesData.additionalServices.forEach(s => { serviceMap[s.id] = {name: s.name, price: s.price}; }); // เก็บ price ด้วย
          setServiceNameMap(serviceMap);
        }

        // --- (B) Fetch Parking Slots ---
        const slotsRes = await fetch("http://localhost:5000/api/parkingSlots", { headers });
        if (slotsRes.ok) {
          const slotsData = await slotsRes.json();
          const slotMap = {};
          slotsData.forEach(s => {
            slotMap[s._id] = s.zone ? `${s.zone.name}-${s.number}` : `Slot-${s.number}`;
          });
          setParkingSlotMap(slotMap);
        }

        // --- (C) Fetch Customers ---
        const res = await fetch("http://localhost:5000/api/customers", { headers });
        if (!res.ok) { throw new Error("Failed to fetch reports"); }
        const data = await res.json();
        // (Flatten data ... เหมือนเดิม)
        const flattenedData = data
          .flatMap((customer) =>
            customer.cars.flatMap((car) =>
              car.service_history.map((service, serviceIndex) => ({
                // ... (properties เหมือนเดิม) ...
                 service_id_gen: `${customer._id}-${dayjs(service.entry_time).format("YYYYMMDDHHmmss")}-${serviceIndex}`, // ID ที่สร้างเองสำหรับ navigate
                 _id: service._id, // ID จริงจาก DB
                 customer_id: customer._id,
                 customer_name: customer.customer_name,
                 phone_number: customer.phone_number,
                 car_id: car._id, // เพิ่ม car_id
                 car_registration: car.car_registration,
                 car_registration_province: car.car_registration_province,
                 brand_car: car.brand_car,
                 type_car: car.type_car,
                 color: car.color,
                 entry_time: service.entry_time,
                 exit_time: service.exit_time || "",
                 parking_slot_id: service.parking_slot || "-", // เก็บ ID ไว้ก่อน
                 parking_price: service.parking_price || 0, // เก็บราคาจอด
                 additional_price: service.additional_price || 0, // เก็บราคาเสริม
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


  // (useEffect filter data ... เหมือนเดิม)
  useEffect(() => { /* ... */ }, [allData, filters]);
  // (calculateDuration ... เหมือนเดิม)
  const calculateDuration = (entry, exit) => { /* ... */ };
  // (prepareExportData ... เหมือนเดิม)
  const prepareExportData = () => { /* ... */ };

  // ✅ 7. สร้างฟังก์ชัน handleGenerateReceipt (คล้ายกับ PaymentPage)
  const handleGenerateReceipt = (row) => {
    if (!settings) {
      alert("ข้อมูล Setting ยังโหลดไม่เสร็จ โปรดรอสักครู่");
      return;
    }

    // --- สร้างรายการบริการ ---
    const serviceItems = [];
    const parkingSlotName = parkingSlotMap[row.parking_slot_id] || row.parking_slot_id; // แปล ID ช่องจอด

    if (row.parking_slot_id !== '-') {
      serviceItems.push([
        { text: "ค่าบริการจอดรถ", style: "tableBody" },
        { text: `(ช่อง ${parkingSlotName})`, style: "tableBody" },
        { text: `${(row.parking_price || 0).toFixed(2)}`, style: "tableBody", alignment: "right" },
      ]);
    }

    row.services.forEach((serviceId) => {
       const serviceInfo = serviceNameMap[serviceId];
       serviceItems.push([
        { text: "บริการเพิ่มเติม", style: "tableBody" },
        { text: `(${serviceInfo?.name || "ID: " + serviceId})`, style: "tableBody" },
        { text: `${(serviceInfo?.price || 0).toFixed(2)}`, style: "tableBody", alignment: "right" },
      ]);
    });
     // เพิ่มแถวว่าง
     if (row.parking_slot_id !== '-' && row.services.length > 0) {
        serviceItems.push(['\u00A0', '\u00A0', '\u00A0']);
    }


    const docDefinition = {
      defaultStyle: { font: "Sarabun", fontSize: 12 },
      content: [
        // --- ส่วนหัว ---
         {
          columns: [
            settings.logo?.main ? { image: settings.logo.main, width: 100 } : { text: "" },
            {
              text: [
                { text: `${settings.companyName || "ชื่อบริษัท"}\n`, style: "header" },
                { text: `${settings.address?.number || ""} ${settings.address?.street || ""}\n`, style: "subheader" },
                { text: `${settings.address?.tambon || ""} ${settings.address?.amphoe || ""}\n`, style: "subheader" },
                { text: `${settings.address?.province || ""} ${settings.address?.zipcode || ""}\n`, style: "subheader" },
                { text: `โทร: ${settings.phoneNumber || "-"} `, style: "subheader" },
                { text: `เลขผู้เสียภาษี: ${settings.taxId || "-"}`, style: "subheader" },
              ],
              alignment: "right",
            },
          ],
        },
        { canvas: [{ type: "line", x1: 0, y1: 10, x2: 515, y2: 10 }] },
        // --- หัวเรื่อง ---
        { text: `ใบเสร็จรับเงิน ${row.is_paid ? '' : '(ย้อนหลัง - ยังไม่ชำระ)'}`, style: "title", alignment: "center", margin: [0, 15, 0, 10] },
        // --- ข้อมูลลูกค้า ---
         {
          columns: [
            {
               width: '*',
               text: [
                { text: "ลูกค้า: ", bold: true }, `${row.customer_name}\n`,
                { text: "เบอร์โทร: ", bold: true }, `${row.phone_number}\n`,
                { text: "ทะเบียนรถ: ", bold: true }, `${row.car_registration}`,
              ]
            },
            {
              width: 'auto',
              alignment: 'right',
              text: [
                  // ใช้เวลาออกเป็น proxy วันที่ชำระ ถ้ามี, หรือเวลาปัจจุบันถ้าไม่มี
                  { text: "วันที่ออกเอกสาร: ", bold: true }, `${dayjs(row.exit_time || new Date()).format("DD/MM/YYYY HH:mm น.")}\n`,
                  { text: "เวลาเข้า: ", bold: true }, `${dayjs(row.entry_time).format("DD/MM/YYYY HH:mm น.")}\n`,
                  { text: "เวลาออก: ", bold: true }, `${row.exit_time ? dayjs(row.exit_time).format("DD/MM/YYYY HH:mm น.") : "-"}`,
              ]
            }
          ],
          margin: [0, 0, 0, 10],
        },
        // --- ตาราง ---
        {
          table: {
            headerRows: 1, widths: ["30%", "40%", "30%"],
            body: [
              [ { text: "รายการ", style: "tableHeader" }, { text: "รายละเอียด", style: "tableHeader" }, { text: "ราคา (บาท)", style: "tableHeader", alignment: "right" } ],
              ...serviceItems,
            ],
          },
          layout: "lightHorizontalLines",
        },
        { canvas: [{ type: "line", x1: 0, y1: 5, x2: 515, y2: 5, lineWidth: 0.5, lineColor: '#cccccc' }], margin: [0, 10, 0, 0] },
        // --- สรุปยอด ---
        {
          table: {
            widths: ["*", "auto"],
            body: [
              [ { text: "ยอดรวมทั้งสิ้น", style: "totalText", alignment: "right" }, { text: `${(row.total_price || 0).toFixed(2)} บาท`, style: "totalAmount", alignment: "right" } ],
              // (เราไม่รู้ payment method จากหน้านี้)
              // [ { text: "วิธีชำระเงิน", style: "totalText", alignment: "right" }, { text: "-", style: "totalAmount", alignment: "right" } ],
              [ { text: "สถานะ", style: "totalText", alignment: "right" }, { text: row.is_paid ? "ชำระแล้ว" : "ยังไม่ชำระ", style: "totalAmount", color: row.is_paid ? "green" : "red", alignment: "right" } ],
            ],
          },
          layout: "noBorders", margin: [0, 10, 0, 0],
        },
      ],
      styles: {
        header: { fontSize: 16, bold: true }, subheader: { fontSize: 10, color: "gray" },
        title: { fontSize: 18, bold: true }, tableHeader: { bold: true, fontSize: 13 },
        tableBody: { fontSize: 12 }, totalText: { fontSize: 12, bold: true, margin: [0, 2, 0, 2] },
        totalAmount: { fontSize: 14, bold: true, margin: [0, 2, 0, 2] },
      },
    };
    pdfMake.createPdf(docDefinition).open();
  };

  // ✅ 8. เปลี่ยน Loading condition
  if (loading || settingsLoading) {
    return ( <div className="p-6 text-center text-lg font-semibold"> กำลังโหลดข้อมูล... </div> );
  }

  if (error) { /* ... Error UI ... */ }

  return (
    <div className="p-6 sm:p-10 space-y-6">
      <h2 className="text-3xl font-bold text-[#ea7f33]">รายงานการบริการ</h2>

      {/* Filter Section */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200">
        {/* (Filter Inputs ... เหมือนเดิม) */}
        <TextField label="วันที่เริ่มต้น" type="date" size="small" InputLabelProps={{ shrink: true }} value={filters.startDate} onChange={(e) => setFilters({ ...filters, startDate: e.target.value })} />
        <TextField label="วันที่สิ้นสุด" type="date" size="small" InputLabelProps={{ shrink: true }} value={filters.endDate} onChange={(e) => setFilters({ ...filters, endDate: e.target.value })} />
        <TextField label="ค้นหา (ชื่อ/ทะเบียน)" size="small" value={filters.searchTerm} onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })} InputProps={{ endAdornment: <SearchIcon color="action" /> }} className="w-full sm:w-auto flex-1" />
        <CSVLink data={exportData} headers={exportHeaders} filename={`report_${dayjs().format("YYYY-MM-DD")}.csv`} onClick={prepareExportData} uFEFF={true} >
          <Button variant="contained" startIcon={<ExportIcon />} sx={{ bgcolor: "#4caf50", "&:hover": { bgcolor: "#45a049" }, mt: { xs: 2, sm: 0 }, }} > Export CSV </Button>
        </CSVLink>
      </div>

      {/* Report Table */}
      <TableContainer component={Paper} className="shadow-lg">
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell className="font-bold">ลำดับ</TableCell>
              <TableCell className="font-bold">วันเข้ารับบริการ</TableCell>
              <TableCell className="font-bold">วันรับรถ</TableCell>
              {/* <TableCell className="font-bold">วัน/ชั่วโมง</TableCell> */}
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
                  <TableCell> {dayjs(row.entry_time).format("DD/MM/YYYY")} </TableCell>
                  <TableCell> {row.exit_time ? dayjs(row.exit_time).format("DD/MM/YYYY") : "-"} </TableCell>
                  {/* <TableCell> {calculateDuration(row.entry_time, row.exit_time)} </TableCell> */}
                  <TableCell>{row.car_registration}</TableCell>
                  <TableCell>{row.car_registration_province}</TableCell>
                  <TableCell>{row.brand_car}</TableCell>
                  <TableCell>{row.customer_name}</TableCell>
                  <TableCell>
                    <Tooltip title="ดูรายละเอียด">
                      <IconButton onClick={() => navigate( `/report/details/${row.customer_id}/${row.service_id_gen}` )}>
                        <InfoIcon color="primary" />
                      </IconButton>
                    </Tooltip>
                    {/* ✅ 9. เพิ่มปุ่มพิมพ์ */}
                    <Tooltip title="พิมพ์ใบเสร็จ">
                      <IconButton onClick={() => handleGenerateReceipt(row)}>
                        <PrintIcon color="action" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={10} align="center"> ไม่พบข้อมูลตามเงื่อนไขที่เลือก </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}