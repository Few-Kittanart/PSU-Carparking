import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { IconButton } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

export default function DetailCar() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCar = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const res = await fetch(`http://localhost:5000/api/car/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          throw new Error("ไม่พบข้อมูลลูกค้า");
        }

        const data = await res.json();
        setCar(data);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCar();
  }, [id]);

  if (loading) {
    return (
      <div className="p-6 text-center text-lg font-semibold">กำลังโหลด...</div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-lg font-semibold text-red-500">
        เกิดข้อผิดพลาด: {error}
      </div>
    );
  }

  if (!Car) {
    return (
      <div className="p-6 text-center text-lg font-semibold">
        ไม่พบข้อมูลรถของลูกค้า
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center space-x-4">
        <IconButton onClick={() => navigate(-1)} className="text-gray-600">
          <ArrowBackIcon />
        </IconButton>
        <h2 className="text-3xl font-bold text-[#ea7f33]">รายละเอียดรถ</h2>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h3 className="text-xl font-semibold mb-4 text-[#ea7f33]">
          ข้อมูลทั่วไป
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-gray-700 ">
          <p>
            <strong>ป้ายทะเบียน</strong> {Car.car_registration},{" "}
            {Car.car_registration_province}
          </p>
          <p>
            <strong>ยี่ห้อ:</strong> {Car.brand_car}
          </p>
          <p>
            <strong>รุ่น:</strong> {Car.model_car}
          </p>
          <p>
            <strong>ประเภท:</strong> {Car.type_car}
          </p>
          <p>
            <strong>สี:</strong> {Car.color}
          </p>
        </div>
      </div>
      <div>
        <h3 className="text-xl font-semibold mb-4 text-[#ea7f33]">
          ข้อมูลเจ้าของรถ
          <p>
            <strong>ชื่อ-นามสกุล:</strong> {customer.customer_name}
          </p>
          <p>
            <strong>เบอร์โทรศัพท์:</strong> {customer.phone_number}
          </p>
        </h3>
      </div>
    </div>
  );
}
