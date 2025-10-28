import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import {
  Button,
  CircularProgress,
  Paper,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  FormLabel,
  Box,
  Stack,
  Divider,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useSettings } from "../context/SettingContext"; // ✅ 1. Import useSettings

export default function PaymentPage() {
  const { customerId, carId, serviceId } = useParams();
  const navigate = useNavigate();

  const [serviceDetail, setServiceDetail] = useState(null);
  const [serviceList, setServiceList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("cash");

  const { settings, loading: settingsLoading } = useSettings(); // ✅ 2. ดึง settings จาก Context

  // useEffect ดึงข้อมูล Service Detail และ Service List
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        // 1. ดึง Service Detail
        const detailRes = await fetch(
          `http://localhost:5000/api/customers/${customerId}/cars/${carId}/services/${serviceId}`,
          { headers }
        );
        if (!detailRes.ok) throw new Error("ไม่พบข้อมูลบริการ");
        const data = await detailRes.json();
        setServiceDetail(data);

        // 2. ดึง Service List (สำหรับแสดงชื่อ)
        const serviceListRes = await fetch("http://localhost:5000/api/prices", { headers });
        if (serviceListRes.ok) {
          const serviceListData = await serviceListRes.json();
          setServiceList(serviceListData.additionalServices || []);
        }

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false); // setLoading ที่นี่หลังจาก fetch ทั้งหมดเสร็จ
      }
    };
    fetchInitialData();
  }, [customerId, carId, serviceId]);

  // handlePay (เหมือนเดิม)
  const handlePay = async () => {
    try {
      const token = localStorage.getItem("token");
      const payload = { paymentMethod: paymentMethod };

      const res = await fetch(
        `http://localhost:5000/api/customers/${customerId}/cars/${carId}/services/${serviceId}/pay`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );
      if (!res.ok) throw new Error("ชำระเงินไม่สำเร็จ");

      alert("ชำระเงินเรียบร้อยแล้ว!");

      setTimeout(() => {
        navigate("/manage"); // กลับไปหน้า Manage
      }, 1500);

    } catch (err) {
      alert("เกิดข้อผิดพลาด: " + err.message);
    }
  };

  // ✅ 3. เปลี่ยน Loading condition
  if (loading || settingsLoading) // รอทั้งข้อมูล service และ settings
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}><CircularProgress /></Box>
    );

  if (error)
    return (
      <Typography color="error" sx={{ p: 6, textAlign: 'center' }}>เกิดข้อผิดพลาด: {error}</Typography>
    );

  if (!serviceDetail) return <Typography sx={{ p: 6, textAlign: 'center' }}>ไม่พบข้อมูลบริการ</Typography>; // เพิ่มข้อความกรณีไม่พบข้อมูล

  const { customer, car, serviceHistory } = serviceDetail;

  const getServiceNames = (serviceIds) =>
    serviceIds
      .map((id) => serviceList.find((s) => s.id === id)?.name)
      .filter(Boolean);

  // ✅ 4. หา QR Code ที่จะแสดง
  let qrCodeToShow = null;
  // ตรรกะ: แสดง QR ของ Bank 1 ถ้าติ๊ก 'showQrCode' และมีรูป
  if (settings?.bank1?.show && settings.bank1.showQrCode && settings.bank1.qrCodeImage) {
      qrCodeToShow = settings.bank1.qrCodeImage;
  }
  // ถ้า Bank 1 ไม่มี ให้ลองดู Bank 2 (Bank 2 ไม่มี showQrCode checkbox)
  else if (settings?.bank2?.show && settings.bank2.qrCodeImage) {
      qrCodeToShow = settings.bank2.qrCodeImage;
  }

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: "bold", color: "#ea7f33" }}>
          หน้าชำระเงิน
        </Typography>
        <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>
          กลับ
        </Button>
      </Stack>

      <Stack spacing={4}>
        {/* Paper ข้อมูลลูกค้า */}
        <Paper className="p-6 rounded-lg" elevation={3}>
          <Typography variant="h6" className="mb-2 text-[#ea7f33]">
            ข้อมูลลูกค้า
          </Typography>
          <Typography>
            <strong>ชื่อ-นามสกุล:</strong> {customer.customer_name}
          </Typography>
          <Typography>
            <strong>เบอร์โทรศัพท์:</strong> {customer.phone_number}
          </Typography>
          <Typography>
            <strong>รถ:</strong> {car.brand_car} / {car.car_registration}
          </Typography>
        </Paper>

        {/* Paper บริการที่ต้องชำระ */}
        {serviceHistory ? (
          <Paper className="p-6 rounded-lg" elevation={3}>
            <Typography variant="h6" className="mb-2 text-[#ea7f33]">
              บริการที่ต้องชำระ
            </Typography>

            {/* ส่วนแสดงรายละเอียดบริการ */}
            {serviceHistory.parking_slot && (
              <>
                <Typography>
                  <strong>ช่องจอด:</strong> {serviceHistory.parking_slot}
                </Typography>
                <Typography>
                  <strong>วันเวลาเข้า:</strong>{" "}
                  {dayjs(serviceHistory.entry_time).format("DD/MM/YYYY HH:mm")}
                </Typography>
                {serviceHistory.exit_time && (
                  <Typography>
                    <strong>วันเวลาออก:</strong>{" "}
                    {dayjs(serviceHistory.exit_time).format("DD/MM/YYYY HH:mm")}
                  </Typography>
                )}
                <Typography>
                  <strong>ราคาค่าจอด:</strong>{" "}
                  {serviceHistory.parking_price?.toFixed(2) || "0.00"} บาท
                </Typography>
              </>
            )}

            {serviceHistory.services?.length > 0 && (
              <>
                <Typography className="mt-2 font-semibold">
                  บริการเพิ่มเติม:
                </Typography>
                <ul className="list-disc pl-5">
                  {getServiceNames(serviceHistory.services).map((name, i) => (
                    <li key={i}>{name}</li>
                  ))}
                </ul>
                <Typography>
                  <strong>ราคาบริการเสริม:</strong>{" "}
                  {serviceHistory.additional_price?.toFixed(2) || "0.00"} บาท
                </Typography>
              </>
            )}
            {/* สิ้นสุดส่วนแสดงรายละเอียด */}

            <Divider sx={{ my: 2 }} />

            <Typography className="mt-4 text-2xl font-bold text-[#ea7f33]">
              ยอดรวม: {serviceHistory.total_price?.toFixed(2) || "0.00"} บาท
            </Typography>

            {/* ส่วนเลือกวิธีชำระเงิน */}
            <FormControl component="fieldset" sx={{ mt: 3 }}>
              <FormLabel component="legend">เลือกวิธีชำระเงิน</FormLabel>
              <RadioGroup
                row
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <FormControlLabel value="cash" control={<Radio />} label="เงินสด" />
                <FormControlLabel value="qr" control={<Radio />} label="สแกนจ่าย" />
              </RadioGroup>
            </FormControl>

            {/* ✅ 5. แก้ไขส่วนแสดง QR Code */}
            {paymentMethod === 'qr' && (
              <Box sx={{ mt: 2, p: 2, border: '1px dashed grey', borderRadius: 2, textAlign: 'center' }}>
                {qrCodeToShow ? (
                  <>
                    <Typography sx={{ mb: 1 }}>สแกน QR Code เพื่อชำระเงิน:</Typography>
                    <img
                      src={qrCodeToShow}
                      alt="Payment QR Code"
                      style={{ maxWidth: '200px', maxHeight: '200px', margin: 'auto', display: 'block', borderRadius: '4px' }}
                    />
                    {/* แสดงชื่อบัญชี/ธนาคารใต้รูป QR */}
                    {settings?.bank1?.show && settings.bank1.showQrCode && settings.bank1.qrCodeImage === qrCodeToShow && (
                       <Typography variant="caption" display="block" sx={{mt: 1, color: 'text.secondary'}}>
                         {settings.bank1.accountName} ({settings.bank1.bankName}) - {settings.bank1.accountNumber}
                       </Typography>
                    )}
                     {settings?.bank2?.show && settings.bank2.qrCodeImage === qrCodeToShow && (
                       <Typography variant="caption" display="block" sx={{mt: 1, color: 'text.secondary'}}>
                         {settings.bank2.accountName} ({settings.bank2.bankName}) - {settings.bank2.accountNumber}
                       </Typography>
                    )}
                  </>
                ) : (
                  <Typography color="error">
                    ยังไม่ได้ตั้งค่ารูป QR Code หรือไม่ได้เปิดใช้งานในหน้าตั้งค่า
                  </Typography>
                )}
              </Box>
            )}
            {/* (สิ้นสุดส่วนที่แก้ไข) */}

            {/* ปุ่มยืนยันการชำระเงิน */}
            <Button
              variant="contained"
              startIcon={<CheckCircleIcon />}
              onClick={handlePay}
              disabled={serviceHistory.is_paid}
              sx={{
                mt: 3,
                bgcolor: "#4CAF50",
                "&:hover": { bgcolor: "#45a049" },
                px: 6,
                py: 1.5,
                display: "block",
              }}
            >
              {serviceHistory.is_paid ? "ชำระเงินแล้ว" : "ยืนยันการชำระเงิน"}
            </Button>
          </Paper>
        ) : (
          <div className="p-6 text-center text-lg font-semibold text-gray-700">
            เกิดข้อผิดพลาด: ไม่พบข้อมูล Service History
          </div>
        )}
      </Stack>
    </Box>
  );
}