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
  Stack, // 1. Import Stack
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

export default function PaymentPage() {
  const { customerId, carId, serviceId } = useParams();
  const navigate = useNavigate();

  const [serviceDetail, setServiceDetail] = useState(null);
  const [serviceList, setServiceList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("cash"); 

  // (useEffect ... ดึงข้อมูล serviceDetail ... เหมือนเดิม)
  useEffect(() => {
    const fetchServiceDetail = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const res = await fetch(
          `http://localhost:5000/api/customers/${customerId}/cars/${carId}/services/${serviceId}`,
          { headers: { Authorization: `Bearer ${token}` } }
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


  // (useEffect ... ดึงข้อมูล serviceList ... เหมือนเดิม)
  useEffect(() => {
    const fetchServiceList = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:5000/api/prices", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("ไม่สามารถดึงข้อมูลบริการได้");
        const data = await res.json();
        setServiceList(data.additionalServices || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchServiceList();
  }, []);


  const handlePay = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:5000/api/customers/${customerId}/cars/${carId}/services/${serviceId}/pay`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ paymentMethod }),
        }
      );
      if (!res.ok) throw new Error("ชำระเงินไม่สำเร็จ");

      alert("ชำระเงินเรียบร้อยแล้ว!");

      // 2. เปลี่ยนเป็น navigate(-1) (ย้อนกลับ) จะยืดหยุ่นกว่า
      setTimeout(() => {
        navigate(-1); // กลับไปหน้าก่อนหน้า (ManagePage)
      }, 1500);
    } catch (err) {
      alert("เกิดข้อผิดพลาด: " + err.message);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <CircularProgress />
        <span className="ml-4 text-xl">กำลังโหลด...</span>
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center items-center h-screen text-red-600">
        <p>เกิดข้อผิดพลาด: {error}</p>
      </div>
    );

  if (!serviceDetail) return null;

  const { customer, car, serviceHistory } = serviceDetail;

  const getServiceNames = (serviceIds) =>
    serviceIds
      .map((id) => serviceList.find((s) => s.id === id)?.name)
      .filter(Boolean);

  return (
    // 3. เปลี่ยน <div> (root) เป็น <Box> และลบ className ที่ซ้ำซ้อนกับ Layout
    <Box>
      {/* 4. เปลี่ยน Header ให้เหมือนหน้า DetailPage */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 4 }}
      >
        <Typography variant="h4" sx={{ fontWeight: "bold", color: "#ea7f33" }}>
          หน้าชำระเงิน
        </Typography>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)} // 5. เปลี่ยน onClick
        >
          กลับ
        </Button>
      </Stack>

      {/* 6. ใช้ Stack คลุม Paper เพื่อให้มีระยะห่าง (spacing) ที่สม่ำเสมอ */}
      <Stack spacing={4}>
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

        {serviceHistory && !serviceHistory.is_paid ? (
          <Paper className="p-6 rounded-lg" elevation={3}>
            <Typography variant="h6" className="mb-2 text-[#ea7f33]">
              บริการที่ต้องชำระ
            </Typography>
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

            <Typography className="mt-4 text-2xl font-bold text-[#ea7f33]">
              ยอดรวม: {serviceHistory.total_price?.toFixed(2) || "0.00"} บาท
            </Typography>

            <FormControl component="fieldset" sx={{ mt: 3 }}>
              <FormLabel component="legend">เลือกวิธีชำระเงิน</FormLabel>
              <RadioGroup
                row
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <FormControlLabel
                  value="cash"
                  control={<Radio />}
                  label="เงินสด"
                />
                <FormControlLabel
                  value="qr"
                  control={<Radio />}
                  label="สแกนจ่าย"
                />
              </RadioGroup>
            </FormControl>

            {paymentMethod === "qr" && (
              <Box
                sx={{
                  mt: 2,
                  p: 2,
                  border: "1px dashed grey",
                  borderRadius: 2,
                  textAlign: "center",
                }}
              >
                <Typography>แสดง QR Code ที่นี่</Typography>
                {/* คุณสามารถใส่ Component รูปภาพ QR Code ของคุณตรงนี้ */}
              </Box>
            )}

            <Button
              variant="contained"
              startIcon={<CheckCircleIcon />}
              onClick={handlePay}
              sx={{
                mt: 3,
                bgcolor: "#4CAF50",
                "&:hover": { bgcolor: "#45a049" },
                px: 6,
                py: 1.5,
                display: "block",
              }}
            >
              ยืนยันการชำระเงิน
            </Button>
          </Paper>
        ) : (
          <div className="p-6 text-center text-lg font-semibold text-gray-700">
            รายการนี้ชำระเงินแล้ว
          </div>
        )}
      </Stack>
    </Box>
  );
}