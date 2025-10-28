import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Button, Paper, Typography, Divider, Box, Grid, Chip,
  CircularProgress, Stack, TextField, Alert
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PersonIcon from "@mui/icons-material/Person";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import CancelIcon from "@mui/icons-material/Cancel";
import PaymentIcon from '@mui/icons-material/Payment';
import CalculateIcon from "@mui/icons-material/Calculate";
import SaveIcon from "@mui/icons-material/Save";
import dayjs from "dayjs";
import "dayjs/locale/th";
import axios from "axios"; // 1. Import axios

dayjs.locale("th");

// 2. คัดลอกฟังก์ชันคำนวณมาไว้ที่นี่
const calculateDurationAndPrice = (startTime, endTime, rates, roundingMinuteThreshold = 15) => {
  if (!startTime) return { price: 0, duration: "0 วัน 0 ชั่วโมง 0 นาที" };
  const entry = dayjs(startTime);
  const exit = endTime ? dayjs(endTime) : dayjs();
  let durationInMinutes = exit.diff(entry, "minute", true);
  if (durationInMinutes <= 0) return { price: 0, duration: "0 วัน 0 ชั่วโมง 0 นาที" };
  const dailyRate = parseFloat(rates.daily) || 0;
  const hourlyRate = parseFloat(rates.hourly) || 0;
  let totalDays = Math.floor(durationInMinutes / (24 * 60));
  let remainingMinutes = durationInMinutes % (24 * 60);
  let totalHours = Math.floor(remainingMinutes / 60);
  let totalMinutes = Math.round(remainingMinutes % 60);
  if (totalMinutes > roundingMinuteThreshold) { totalHours += 1; totalMinutes = 0; }
  if (totalHours >= 24) { totalDays += 1; totalHours = 0; }
  const parkingCost = (totalDays * dailyRate) + (totalHours * hourlyRate);
  const durationString = `${totalDays} วัน ${totalHours} ชั่วโมง ${totalMinutes} นาที`;
  return { price: parkingCost, duration: durationString };
};

// (Component DetailItem ... เหมือนเดิม)
const DetailItem = ({ label, value }) => ( <Grid item xs={12} sm={6}> <Typography color="text.secondary" variant="body2">{label}</Typography> <Typography variant="body1" sx={{ fontWeight: 500, wordBreak: 'break-word' }}>{value || "-"}</Typography> </Grid> );

export default function DetailPage() {
  const { customerId, carId, serviceId } = useParams();
  const navigate = useNavigate();

  const [serviceDetail, setServiceDetail] = useState(null);
  const [serviceList, setServiceList] = useState([]);
  const [parkingSlotMap, setParkingSlotMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null); // 3. State สำหรับแจ้งเตือน

  // 4. States สำหรับการแก้ไข
  const [parkingRates, setParkingRates] = useState({ daily: 0, hourly: 0 });
  const [editableEntry, setEditableEntry] = useState("");
  const [editableExit, setEditableExit] = useState("");
  
  // States สำหรับเก็บค่ายอดรวมที่คำนวณใหม่
  const [recalculatedParkingPrice, setRecalculatedParkingPrice] = useState(0);
  const [recalculatedTotalPrice, setRecalculatedTotalPrice] = useState(0);
  const [recalculatedDuration, setRecalculatedDuration] = useState("");

  const [isEditing, setIsEditing] = useState(false); // 5. State ควบคุมว่ากำลังแก้ไขหรือไม่


  useEffect(() => {
    const fetchServiceDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        setSuccess(null);
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        // API 1: ดึงชื่อ Service + ราคาจอด
        const priceRes = await fetch("http://localhost:5000/api/prices", { headers });
        const priceData = await priceRes.json();
        setServiceList(priceData.additionalServices || []);
        setParkingRates({ // 6. เก็บเรทราคา
          daily: priceData.dailyRate || 0,
          hourly: priceData.hourlyRate || 0,
        });

        // API 2: ดึงข้อมูลช่องจอด
        const slotsRes = await fetch("http://localhost:5000/api/parkingSlots", { headers });
        if (slotsRes.ok) {
          const slotsData = await slotsRes.json();
          const slotMap = {};
          slotsData.forEach(s => { slotMap[s._id] = s.zone ? `${s.zone.name}-${s.number}` : `Slot-${s.number}`; });
          setParkingSlotMap(slotMap);
        }

        // API 3: ดึงข้อมูล Service หลัก
        const res = await fetch(
          `http://localhost:5000/api/customers/${customerId}/cars/${carId}/services/${serviceId}`,
          { headers }
        );
        if (!res.ok) throw new Error("ไม่พบข้อมูลบริการ");
        const data = await res.json();
        setServiceDetail(data);

        // 7. ตั้งค่าเริ่มต้นให้ช่องแก้ไข
        const history = data.serviceHistory;
        const entryTime = dayjs(history.entry_time).format("YYYY-MM-DDTHH:mm");
        const exitTime = dayjs(history.exit_time || new Date()).format("YYYY-MM-DDTHH:mm");
        setEditableEntry(entryTime);
        setEditableExit(exitTime);

        // ตั้งค่ายอดรวมเริ่มต้น (จากฐานข้อมูล)
        setRecalculatedParkingPrice(history.parking_price || 0);
        setRecalculatedTotalPrice(history.total_price || 0);
        setRecalculatedDuration(history.day_park || "");

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchServiceDetail();
  }, [customerId, carId, serviceId]); // (useEffect นี้จะรันใหม่เมื่อ serviceId เปลี่ยน)


  // 8. ฟังก์ชันสำหรับปุ่ม "คำนวณใหม่"
  const handleRecalculate = () => {
    // ใช้เรทราคาที่ดึงมา
    const result = calculateDurationAndPrice(editableEntry, editableExit, parkingRates);
    // ราคาบริการเสริม (ดึงจาก serviceDetail ที่โหลดมา)
    const additionalPrice = serviceDetail.serviceHistory.additional_price || 0;
    // ยอดรวมใหม่ = ราคาจอดใหม่ + ราคาบริการเสริม (คงที่)
    const newTotal = result.price + additionalPrice;

    setRecalculatedParkingPrice(result.price);
    setRecalculatedTotalPrice(newTotal);
    setRecalculatedDuration(result.duration);
    setIsEditing(true); // 9. ตั้งสถานะว่า "มีการแก้ไข"
  };

  // 10. ฟังก์ชันสำหรับ "บันทึกการแก้ไข"
  const handleSaveChanges = async () => {
    if (!isEditing) {
      alert("คุณยังไม่ได้คำนวณราคาใหม่!");
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const payload = {
        entry_time: dayjs(editableEntry).toISOString(),
        exit_time: dayjs(editableExit).toISOString(),
        day_park: recalculatedDuration,
        parking_price: recalculatedParkingPrice,
        total_price: recalculatedTotalPrice,
        // (เราไม่ได้แตะ service เสริม หรือ id ช่องจอด)
        services: serviceDetail.serviceHistory.services,
        additional_price: serviceDetail.serviceHistory.additional_price,
        parking_slot: serviceDetail.serviceHistory.parking_slot,
      };

      // 11. เรียก API มาตรฐานของ serviceHistory (ไม่ใช่ payService)
      const res = await axios.put(
        `http://localhost:5000/api/serviceHistories/${serviceId}`,
        payload,
        { headers }
      );

      // อัปเดตหน้า UI ด้วยข้อมูลใหม่ที่เพิ่งบันทึก
      setServiceDetail(prev => ({ ...prev, serviceHistory: res.data }));
      setIsEditing(false); // ปิดสถานะแก้ไข
      setSuccess("บันทึกการแก้ไขเวลาและราคาเรียบร้อยแล้ว!");

    } catch (err) {
      console.error(err);
      setError("เกิดข้อผิดพลาดในการบันทึก: " + err.message);
    } finally {
      setLoading(false);
    }
  };


  
  if (loading && !serviceDetail) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}><CircularProgress /></Box>;
  if (error) return <Typography color="error" sx={{ p: 6, textAlign: 'center' }}>เกิดข้อผิดพลาด: {error}</Typography>;
  if (!serviceDetail) return <Typography sx={{ p: 6, textAlign: 'center' }}>ไม่พบข้อมูล</Typography>;

  const { customer, car, serviceHistory } = serviceDetail;
  const getServiceName = (id) => serviceList.find((s) => s.id === id)?.name || `ID:${id}`;
  const getParkingSlotName = (slotId) => parkingSlotMap[slotId] || slotId || "-"; 


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

      {/* 12. แสดง Alert เมื่อบันทึกสำเร็จหรือพลาด */}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Stack spacing={4}>
        {/* (การ์ดข้อมูลลูกค้า ... เหมือนเดิม) */}
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

        {/* (การ์ดข้อมูลรถยนต์ ... เหมือนเดิม) */}
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
            {/* 13. เพิ่มช่องแก้ไขเวลา (ถ้ายังไม่จ่าย) */}
            {!serviceHistory.is_paid && (
              <Box>
                <Typography variant="subtitle1" sx={{mb: 1, fontWeight: 'bold'}}>แก้ไขเวลา (ถ้าจำเป็น)</Typography>
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="เวลาเข้า (แก้ไขได้)"
                      type="datetime-local"
                      InputLabelProps={{ shrink: true }}
                      fullWidth
                      value={editableEntry}
                      onChange={(e) => setEditableEntry(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="เวลาออก (แก้ไขได้)"
                      type="datetime-local"
                      InputLabelProps={{ shrink: true }}
                      fullWidth
                      value={editableExit}
                      onChange={(e) => setEditableExit(e.target.value)}
                    />
                  </Grid>
                </Grid>
                <Button
                  variant="contained"
                  startIcon={<CalculateIcon />}
                  onClick={handleRecalculate}
                  sx={{ mb: 2, bgcolor: "#1976d2" }}
                >
                  คำนวณราคาค่าจอดใหม่
                </Button>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  color="success"
                  onClick={handleSaveChanges}
                  disabled={!isEditing || loading} // 14. Disable ถ้ายังไม่คำนวณ
                  sx={{ mb: 2, ml: 1 }}
                >
                  บันทึกการแก้ไข
                </Button>
                <Divider sx={{ mb: 2 }} />
              </Box>
            )}

            {/* ส่วนแสดงผลข้อมูล (ดึงจาก State ที่คำนวณใหม่) */}
            <Grid container spacing={2}>
              {serviceHistory.parking_slot && (
                <DetailItem 
                  label="ช่องจอด" 
                  value={getParkingSlotName(serviceHistory.parking_slot)}
                />
              )}
              {/* 15. แสดงเวลาจาก State ที่แก้ไขได้ */}
              <DetailItem label="เวลาเข้า" value={dayjs(editableEntry).format("DD MMMM YYYY, HH:mm น.")} />
              <DetailItem label="เวลาออก" value={dayjs(editableExit).format("DD MMMM YYYY, HH:mm น.")} />
              <DetailItem label="ระยะเวลา" value={recalculatedDuration} />
            </Grid>
            
            <Box>
              <Typography color="text.secondary" variant="body2">บริการเพิ่มเติม (คงที่)</Typography>
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
                {/* 16. แสดงยอดรวมจาก State ที่คำนวณใหม่ */}
                ยอดรวม: {recalculatedTotalPrice.toFixed(2) || "0.00"} บาท
              </Typography>
               <Chip
                  icon={serviceHistory.is_paid ? <CheckCircleIcon/> : <CancelIcon />}
                  label={serviceHistory.is_paid ? "ชำระแล้ว" : "ยังไม่ชำระ"}
                  color={serviceHistory.is_paid ? "success" : "error"}
                  sx={{ mt: 1, fontWeight: 'bold' }}
              />
            </Box>

            {/* 17. ปุ่มจ่ายเงิน (Disable ถ้ามีการแก้ไขที่ยังไม่บันทึก) */}
            {!serviceHistory.is_paid && (
              <Button
                variant="contained"
                startIcon={<PaymentIcon />}
                fullWidth
                disabled={isEditing || loading} // 18. Disable ปุ่ม
                sx={{ mt: 2, py: 1.5, fontSize: '1rem', bgcolor: "#ea7f33", '&:hover': { bgcolor: '#d26d2a' } }}
                onClick={() => navigate(`/payment/${customer._id}/${car._id}/${serviceHistory._id}`)}
              >
                {isEditing ? "โปรดบันทึกการแก้ไขก่อน" : "ไปยังหน้าชำระเงิน"}
              </Button>
            )}
          </Stack>
        </Paper>
      </Stack>
    </Box>
  );
}