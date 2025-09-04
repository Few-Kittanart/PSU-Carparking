import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@mui/material";

export default function ParkingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  // mock data (จริง ๆ ต้อง fetch จาก backend โดยใช้ id)
  const booking = {
    id: id,
    dateIn: "2025-09-01 10:30",
    dateOut: "2025-09-02 12:00",
    plate: "กข 1234",
    province: "กรุงเทพฯ",
    brand: "Toyota",
    customer: "สมชาย ใจดี",
    phone: "0812345678",
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-[#ea7f33]">
        รายละเอียดการเช่าที่จอด (ID: {booking.id})
      </h2>

      <div className="bg-white shadow rounded-lg p-6 space-y-4 border">
        <p><strong>วันที่เข้ารับบริการ:</strong> {booking.dateIn}</p>
        <p><strong>วันที่รับรถ:</strong> {booking.dateOut}</p>
        <p><strong>ทะเบียนรถ:</strong> {booking.plate}</p>
        <p><strong>จังหวัด:</strong> {booking.province}</p>
        <p><strong>ยี่ห้อ:</strong> {booking.brand}</p>
        <p><strong>ชื่อลูกค้า:</strong> {booking.customer}</p>
        <p><strong>เบอร์โทรศัพท์:</strong> {booking.phone}</p>
      </div>

      <div className="flex justify-between">
        <Button variant="outlined" color="secondary" onClick={() => navigate(-1)}>
          ← กลับ
        </Button>
        <Button variant="contained" color="warning">
          พิมพ์ใบจองที่จอด
        </Button>
      </div>
    </div>
  );
}
