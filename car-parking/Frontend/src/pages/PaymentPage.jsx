import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { Button, CircularProgress, Paper, Typography, IconButton } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

export default function PaymentPage() {
  const { customerId, carId, serviceId } = useParams();
  const navigate = useNavigate();

  const [serviceDetail, setServiceDetail] = useState(null);
  const [serviceList, setServiceList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ดึงรายละเอียด service
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

  // ดึงรายการบริการเพิ่มเติม
  useEffect(() => {
    const fetchServiceList = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:5000/api/price", {
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

  const handlePay = async () => {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(
      `http://localhost:5000/api/customers/${customerId}/cars/${carId}/services/${serviceId}/pay`,
      { method: "PUT", headers: { Authorization: `Bearer ${token}` } }
    );
    if (!res.ok) throw new Error("ชำระเงินไม่สำเร็จ");
    const updated = await res.json();
    alert("ชำระเงินเรียบร้อยแล้ว!");
    setServiceDetail(prev => ({
      ...prev,
      serviceHistory: updated.service,
    }));
  } catch (err) {
    alert("เกิดข้อผิดพลาด: " + err.message);
  }
};

  return (
    <div className="p-6 sm:p-10 space-y-6 bg-gray-100 min-h-screen">
      <div className="flex items-center">
        <IconButton onClick={() => navigate(-1)}>
          <ArrowBackIcon />
        </IconButton>
        <h1 className="text-2xl font-bold text-[#ea7f33] ml-4">หน้าชำระเงิน</h1>
      </div>

      <Paper className="p-6 rounded-lg" elevation={3}>
        <Typography variant="h6" className="mb-2 text-[#ea7f33]">ข้อมูลลูกค้า</Typography>
        <Typography><strong>ชื่อ-นามสกุล:</strong> {customer.customer_name}</Typography>
        <Typography><strong>เบอร์โทรศัพท์:</strong> {customer.phone_number}</Typography>
        <Typography><strong>รถ:</strong> {car.brand_car} / {car.car_registration}</Typography>
      </Paper>

      {serviceHistory && !serviceHistory.is_paid ? (
        <Paper className="p-6 rounded-lg" elevation={3}>
          <Typography variant="h6" className="mb-2 text-[#ea7f33]">บริการที่ต้องชำระ</Typography>
          {serviceHistory.parking_slot && (
            <>
              <Typography><strong>ช่องจอด:</strong> {serviceHistory.parking_slot}</Typography>
              <Typography><strong>วันเวลาเข้า:</strong> {dayjs(serviceHistory.entry_time).format("DD/MM/YYYY HH:mm")}</Typography>
              {serviceHistory.exit_time && (
                <Typography><strong>วันเวลาออก:</strong> {dayjs(serviceHistory.exit_time).format("DD/MM/YYYY HH:mm")}</Typography>
              )}
              <Typography><strong>ราคาค่าจอด:</strong> {serviceHistory.parking_price?.toFixed(2) || "0.00"} บาท</Typography>
            </>
          )}

          {serviceHistory.services?.length > 0 && (
            <>
              <Typography className="mt-2 font-semibold">บริการเพิ่มเติม:</Typography>
              <ul className="list-disc pl-5">
                {getServiceNames(serviceHistory.services).map((name, i) => <li key={i}>{name}</li>)}
              </ul>
              <Typography><strong>ราคาบริการเสริม:</strong> {serviceHistory.additional_price?.toFixed(2) || "0.00"} บาท</Typography>
            </>
          )}

          <Typography className="mt-4 text-2xl font-bold text-[#ea7f33]">ยอดรวม: {serviceHistory.total_price?.toFixed(2) || "0.00"} บาท</Typography>

          <Button variant="contained" startIcon={<CheckCircleIcon />} onClick={handlePay} sx={{ mt: 3, bgcolor: "#4CAF50", "&:hover": { bgcolor: "#45a049" }, px: 6, py: 1.5 }}>
            ชำระเงิน
          </Button>
        </Paper>
      ) : (
        <div className="p-6 text-center text-lg font-semibold text-gray-700">รายการนี้ชำระเงินแล้ว</div>
      )}
    </div>
  );
}
