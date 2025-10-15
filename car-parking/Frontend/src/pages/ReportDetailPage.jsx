import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Button, Paper, Typography, Divider, Box, Grid, Chip,
  CircularProgress, Stack
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PersonIcon from "@mui/icons-material/Person";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import "dayjs/locale/th";

dayjs.extend(duration);
dayjs.locale("th");

// Component ย่อยสำหรับแสดง Key-Value
const DetailItem = ({ label, value }) => (
  <Grid item xs={12} sm={6}>
    <Typography color="text.secondary" variant="body2">{label}</Typography>
    <Typography variant="body1" sx={{ fontWeight: 500, wordBreak: 'break-word' }}>{value || "-"}</Typography>
  </Grid>
);

export default function ReportDetailPage() {
  const { customerId, serviceId } = useParams();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);
  const [car, setCar] = useState(null);
  const [service, setService] = useState(null);
  const [servicesMaster, setServicesMaster] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ใช้ Logic การดึงข้อมูลแบบเดิม
  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        const priceRes = await fetch("http://localhost:5000/api/prices", { headers });
        const priceData = await priceRes.json();
        setServicesMaster(priceData.additionalServices || []);

        const res = await fetch(`http://localhost:5000/api/customers/${customerId}`, { headers });
        if (!res.ok) throw new Error("ไม่สามารถโหลดข้อมูลลูกค้าได้");
        const data = await res.json();

        let foundCar = null;
        let foundService = null;
        for (const c of data.cars) {
          const s = c.service_history.find((sv, idx) => {
            const genId = `${data._id}-${dayjs(sv.entry_time).format("YYYYMMDDHHmmss")}-${idx}`;
            return genId === serviceId;
          });
          if (s) {
            foundCar = c;
            foundService = s;
            break;
          }
        }

        if (!foundCar || !foundService) throw new Error("ไม่พบรายการบริการ");

        setCustomer(data);
        setCar(foundCar);
        setService(foundService);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [customerId, serviceId]);

  const calculateDuration = (entry, exit) => {
    if (!entry || !exit) return "-";
    const diff = dayjs.duration(dayjs(exit).diff(dayjs(entry)));
    const d = diff.days(); const h = diff.hours(); const m = diff.minutes();
    return d > 0 ? `${d} วัน ${h} ชม. ${m} นาที` : `${h} ชม. ${m} นาที`;
  };

  const getServiceName = (id) => servicesMaster.find((item) => item.id === id)?.name || `ID: ${id}`;
  
  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}><CircularProgress /></Box>;
  if (error) return <Typography color="error" sx={{ p: 6, textAlign: 'center' }}>เกิดข้อผิดพลาด: {error}</Typography>;
  if (!customer || !car || !service) return <Typography sx={{ p: 6, textAlign: 'center' }}>ไม่พบข้อมูล</Typography>;

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: "#f9fafb", minHeight: "100vh" }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: "bold", color: "#ea7f33" }}>
          รายละเอียดการบริการ
        </Typography>
        <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} >
          กลับ
        </Button>
      </Stack>

      {/* ✨ ใช้ Stack เรียงการ์ดทั้งหมดจากบนลงล่าง */}
      <Stack spacing={4}>
        {/* การ์ดข้อมูลลูกค้า */}
        <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
            <PersonIcon sx={{ color: "#ea7f33" }} />
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>ข้อมูลลูกค้า</Typography>
          </Stack>
          <Grid container spacing={2}>
            <DetailItem label="ชื่อ-นามสกุล" value={customer.customer_name} />
            <DetailItem label="เบอร์โทรศัพท์" value={customer.phone_number} />
          </Grid>
        </Paper>

        {/* การ์ดข้อมูลรถยนต์ */}
        <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
            <DirectionsCarIcon sx={{ color: "#ea7f33" }} />
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>ข้อมูลรถยนต์</Typography>
          </Stack>
          <Grid container spacing={2}>
            <DetailItem label="ทะเบียนรถ" value={`${car.car_registration} (${car.car_registration_province})`} />
            <DetailItem label="ยี่ห้อ" value={car.brand_car} />
            <DetailItem label="รุ่น/ประเภท" value={car.type_car} />
            <DetailItem label="สี" value={car.color} />
          </Grid>
        </Paper>
        
        {/* การ์ดสรุปบริการ */}
        <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
            <ReceiptLongIcon sx={{ color: "#ea7f33" }} />
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>สรุปบริการและค่าใช้จ่าย</Typography>
          </Stack>
          <Divider sx={{ my: 2 }} />
          <Stack spacing={2}>
            <Grid container spacing={2}>
                <DetailItem label="ช่องจอด" value={service.parking_slot} />
                <DetailItem label="เวลาเข้า" value={dayjs(service.entry_time).format("DD MMMM YYYY, HH:mm น.")} />
                <DetailItem label="เวลาออก" value={service.exit_time ? dayjs(service.exit_time).format("DD MMMM YYYY, HH:mm น.") : "-"} />
                <DetailItem label="รวมระยะเวลา" value={calculateDuration(service.entry_time, service.exit_time)} />
            </Grid>
            <Box>
              <Typography color="text.secondary" variant="body2">บริการเพิ่มเติม</Typography>
              <Box sx={{ mt: 1 }}>
                {service.services?.length > 0 ? (
                  service.services.map((s, idx) => (
                    <Chip key={idx} label={getServiceName(s)} size="small" sx={{ mr: 0.5, mb: 0.5 }}/>
                  ))
                ) : (<Typography variant="body1" sx={{ fontWeight: 500 }}>-</Typography>)}
              </Box>
            </Box>
            <Divider sx={{ my: 1 }} />
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                ยอดรวม: {service.total_price?.toFixed(2) || "0.00"} บาท
              </Typography>
               <Chip
                  icon={service.is_paid ? <CheckCircleIcon /> : <CancelIcon />}
                  label={service.is_paid ? "ชำระแล้ว" : "ยังไม่ชำระ"}
                  color={service.is_paid ? "success" : "error"}
                  sx={{ mt: 1, fontWeight: 'bold' }}
              />
            </Box>
          </Stack>
        </Paper>
      </Stack>
    </Box>
  );
}