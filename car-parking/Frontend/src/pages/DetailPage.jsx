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
import CancelIcon from "@mui/icons-material/Cancel";
import PaymentIcon from '@mui/icons-material/Payment';
import dayjs from "dayjs";
import "dayjs/locale/th";

dayjs.locale("th");

// Component ย่อยสำหรับแสดง Key-Value
const DetailItem = ({ label, value }) => (
  <Grid item xs={12} sm={6}>
    <Typography color="text.secondary" variant="body2">{label}</Typography>
    <Typography variant="body1" sx={{ fontWeight: 500, wordBreak: 'break-word' }}>{value || "-"}</Typography>
  </Grid>
);

export default function DetailPage() {
  const { customerId, carId, serviceId } = useParams();
  const navigate = useNavigate();

  const [serviceDetail, setServiceDetail] = useState(null);
  const [serviceList, setServiceList] = useState([]);
  
  // ✅ 1. เพิ่ม State สำหรับเก็บ Map ช่องจอด
  const [parkingSlotMap, setParkingSlotMap] = useState({});

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ 2. แก้ไข useEffect นี้
  useEffect(() => {
    const fetchServiceDetail = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        // API 1: ดึงชื่อ Service (เหมือนเดิม)
        const priceRes = await fetch("http://localhost:5000/api/prices", { headers });
        const priceData = await priceRes.json();
        setServiceList(priceData.additionalServices || []);

        // (เพิ่ม) API 2: ดึงข้อมูลช่องจอดทั้งหมดเพื่อ "แปล"
        const slotsRes = await fetch("http://localhost:5000/api/parkingSlots", { headers });
        if (slotsRes.ok) {
          const slotsData = await slotsRes.json();
          const slotMap = {};
          slotsData.forEach(s => { 
            // สร้างชื่อเต็มเช่น "A-1"
            slotMap[s._id] = s.zone ? `${s.zone.name}-${s.number}` : `Slot-${s.number}`; 
          });
          setParkingSlotMap(slotMap); // <-- บันทึก Map ไว้
        }
        // (สิ้นสุดส่วนที่เพิ่ม)


        // API 3: ดึงข้อมูล Service หลัก (เหมือนเดิม)
        const res = await fetch(
          `http://localhost:5000/api/customers/${customerId}/cars/${carId}/services/${serviceId}`,
          { headers }
        );
        if (!res.ok) throw new Error("ไม่พบข้อมูลบริการ");
        const data = await res.json();
        setServiceDetail(data);

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchServiceDetail();
  }, [customerId, carId, serviceId]);
  
  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}><CircularProgress /></Box>;
  if (error) return <Typography color="error" sx={{ p: 6, textAlign: 'center' }}>เกิดข้อผิดพลาด: {error}</Typography>;
  if (!serviceDetail) return <Typography sx={{ p: 6, textAlign: 'center' }}>ไม่พบข้อมูล</Typography>;

  const { customer, car, serviceHistory } = serviceDetail;
  const getServiceName = (id) => serviceList.find((s) => s.id === id)?.name || `ID:${id}`;

  // ✅ 3. เพิ่มฟังก์ชันช่วยแปลช่องจอด
  const getParkingSlotName = (slotId) => {
    // ใช้ Map ที่ดึงมาในการแปล ID
    // ถ้าไม่เจอใน Map ให้แสดง ID เดิม หรือ "-"
    return parkingSlotMap[slotId] || slotId || "-"; 
  };


  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: "#f9fafb", minHeight: "100vh" }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: "bold", color: "#ea7f33" }}>
          รายละเอียดบริการ (ค้างชำระ)
        </Typography>
        <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} >
          กลับ
        </Button>
      </Stack>

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
              {serviceHistory.parking_slot && (
                
                // --- ✅ 4. แก้ไขจุดนี้ ---
                <DetailItem 
                  label="ช่องจอด" 
                  value={getParkingSlotName(serviceHistory.parking_slot)} // <-- ใช้ฟังก์ชันช่วยแปล
                />
              )}
              <DetailItem label="เวลาเข้า" value={dayjs(serviceHistory.entry_time).format("DD MMMM YYYY, HH:mm น.")} />
            </Grid>
            <Box>
              <Typography color="text.secondary" variant="body2">บริการเพิ่มเติม</Typography>
              <Box sx={{ mt: 1 }}>
                {serviceHistory.services?.length > 0 ? (
                  serviceHistory.services.map((s, idx) => (
                    <Chip key={idx} label={getServiceName(s)} size="small" sx={{ mr: 0.5, mb: 0.5 }}/>
                  ))
                ) : (<Typography variant="body1" sx={{ fontWeight: 500 }}>-</Typography>)}
              </Box>
            </Box>
            <Divider sx={{ my: 1 }} />
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                ยอดรวม: {serviceHistory.total_price?.toFixed(2) || "0.00"} บาท
              </Typography>
               <Chip
                  icon={<CancelIcon />}
                  label="ยังไม่ชำระ"
                  color="error"
                  sx={{ mt: 1, fontWeight: 'bold' }}
              />
            </Box>
            {!serviceHistory.is_paid && (
              <Button
                variant="contained"
                startIcon={<PaymentIcon />}
                fullWidth
                sx={{ mt: 2, py: 1.5, fontSize: '1rem', bgcolor: "#ea7f33", '&:hover': { bgcolor: '#d26d2a' } }}
                onClick={() => navigate(`/payment/${customer._id}/${car._id}/${serviceHistory._id}`)}
              >
                ไปยังหน้าชำระเงิน
              </Button>
            )}
          </Stack>
        </Paper>
      </Stack>
    </Box>
  );
}