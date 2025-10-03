import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Button,
  Paper,
  Typography,
  Divider,
  Box,
  Grid,
  Chip,
} from "@mui/material";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import "dayjs/locale/th";

dayjs.extend(duration);
dayjs.locale("th");

export default function ReportDetailPage() {
  const { customerId, serviceId } = useParams();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);
  const [car, setCar] = useState(null);
  const [service, setService] = useState(null);
  const [servicesMaster, setServicesMaster] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const token = localStorage.getItem("token");

        // ดึงข้อมูล master ของบริการเพิ่มเติม
        const priceRes = await fetch("http://localhost:5000/api/prices", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const priceData = await priceRes.json();
        setServicesMaster(priceData.additionalServices || []);

        // ดึงข้อมูลลูกค้า
        const res = await fetch(`http://localhost:5000/api/customers/${customerId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("ไม่สามารถโหลดข้อมูลลูกค้าได้");
        const data = await res.json();

        // ค้นหา service
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
    const d = diff.days();
    const h = diff.hours();
    const m = diff.minutes();
    return d > 0 ? `${d} วัน ${h} ชม. ${m} นาที` : `${h} ชม. ${m} นาที`;
  };

  // แปลง id ของบริการเพิ่มเติม → ชื่อ
  const getServiceName = (id) => {
    const s = servicesMaster.find((item) => item.id === id);
    return s ? s.name : id;
  };

  if (loading) return <div className="p-6 text-center text-lg">กำลังโหลดข้อมูล...</div>;
  if (error) return <div className="p-6 text-center text-lg text-red-500">เกิดข้อผิดพลาด: {error}</div>;
  if (!customer || !service) return <div className="p-6 text-center text-lg">ไม่พบข้อมูล</div>;

  return (
    <Box sx={{ p: { xs: 3, md: 6 }, bgcolor: "#f7f7f7", minHeight: "100vh" }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: "bold", color: "#ea7f33" }}>
          รายละเอียดการบริการ
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate(-1)}
          sx={{
            bgcolor: "#5c6bc0",
            "&:hover": { bgcolor: "#3f51b5" },
            textTransform: "none",
          }}
        >
          กลับ
        </Button>
      </Box>

      <Paper elevation={2} sx={{ p: 4, borderRadius: 3 }}>
        {/* ข้อมูลลูกค้า */}
        <Typography variant="h6" sx={{ fontWeight: "bold", color: "#ea7f33", mb: 2 }}>
          ข้อมูลลูกค้า
        </Typography>
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={4}>
            <Typography><strong>รหัสลูกค้า:</strong> {customerId}</Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Typography><strong>ชื่อ-นามสกุล:</strong> {customer.customer_name}</Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Typography><strong>เบอร์โทรศัพท์:</strong> {customer.phone_number}</Typography>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* ข้อมูลรถ */}
        <Typography variant="h6" sx={{ fontWeight: "bold", color: "#ea7f33", mb: 2 }}>
          ข้อมูลรถยนต์
        </Typography>
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={4}>
            <Typography><strong>ทะเบียนรถ:</strong> {car.car_registration} ({car.car_registration_province})</Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Typography><strong>ยี่ห้อ:</strong> {car.brand_car}</Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Typography><strong>รุ่น/ประเภท:</strong> {car.type_car}</Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Typography><strong>สี:</strong> {car.color}</Typography>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* รายละเอียดบริการ */}
        <Typography variant="h6" sx={{ fontWeight: "bold", color: "#ea7f33", mb: 2 }}>
          รายละเอียดการบริการ
        </Typography>
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={4}>
            <Typography><strong>ช่องจอด:</strong> {service.parking_slot || "-"}</Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Typography><strong>เวลาเข้า:</strong> {dayjs(service.entry_time).format("DD/MM/YYYY HH:mm")}</Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Typography><strong>เวลาออก:</strong> {service.exit_time ? dayjs(service.exit_time).format("DD/MM/YYYY HH:mm") : "-"}</Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Typography><strong>รวมระยะเวลา:</strong> {calculateDuration(service.entry_time, service.exit_time)}</Typography>
          </Grid>

          {/* บริการเพิ่มเติม */}
          <Grid item xs={12}>
            <Typography sx={{ fontWeight: "500", mb: 1 }}><strong>บริการเพิ่มเติม:</strong></Typography>
            <Box>
              {service.services?.length > 0 ? (
                service.services.map((s, idx) => (
                  <Chip
                    key={idx}
                    label={getServiceName(s)}
                    sx={{
                      mr: 1,
                      mb: 1,
                      bgcolor: "#f3f3f3",
                      border: "1px solid #ddd",
                      fontSize: "0.85rem",
                    }}
                  />
                ))
              ) : (
                <Typography color="text.secondary">ไม่มี</Typography>
              )}
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* สรุปค่าใช้จ่าย */}
        <Box sx={{ bgcolor: "#fafafa", p: 3, borderRadius: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: "bold", color: "#ea7f33", mb: 2 }}>
            สรุปค่าใช้จ่าย
          </Typography>
          <Typography variant="body1" sx={{ fontSize: "1.1rem", fontWeight: "500" }}>
            ยอดรวมทั้งหมด: <strong>{service.total_price?.toFixed(2) || "0.00"} บาท</strong>
          </Typography>
          <Typography
            sx={{
              mt: 1,
              fontWeight: "500",
              color: service.is_paid ? "green" : "red",
            }}
          >
            สถานะ: {service.is_paid ? "ชำระแล้ว" : "ยังไม่ชำระ"}
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}