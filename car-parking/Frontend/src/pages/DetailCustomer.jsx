import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { IconButton } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

export default function DetailCustomer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const res = await fetch(`http://localhost:5000/api/customers/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          throw new Error("ไม่พบข้อมูลลูกค้า");
        }

        const data = await res.json();
        setCustomer(data);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomer();
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

  if (!customer) {
    return (
      <div className="p-6 text-center text-lg font-semibold">ไม่พบข้อมูลลูกค้า</div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center space-x-4">
        <IconButton onClick={() => navigate(-1)} className="text-gray-600">
          <ArrowBackIcon />
        </IconButton>
        <h2 className="text-3xl font-bold text-[#ea7f33]">
          รายละเอียดลูกค้า
        </h2>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h3 className="text-xl font-semibold mb-4 text-[#ea7f33]">
          ข้อมูลทั่วไป
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <p>
            <strong>รหัสลูกค้า:</strong> {customer.customer_id}
          </p>
          <p>
            <strong>ชื่อ-นามสกุล:</strong> {customer.customer_name}
          </p>
          <p>
            <strong>เบอร์โทรศัพท์:</strong> {customer.phone_number}
          </p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h3 className="text-xl font-semibold mb-4 text-[#ea7f33]">
          ข้อมูลที่อยู่
        </h3>
        <p>
          {customer.house_number}, {customer.village} หมู่บ้าน {customer.road},
          ถนน {customer.canton}, ตำบล {customer.district}, อำเภอ{" "}
          {customer.province}, จังหวัด {customer.zip_code}
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h3 className="text-xl font-semibold mb-4 text-[#ea7f33]">
          ประวัติรถของลูกค้า
        </h3>
        {customer.car_registration ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <p>
              <strong>ทะเบียนรถ:</strong> {customer.car_registration} (
              {customer.car_registration_province})
            </p>
            <p>
              <strong>ยี่ห้อ:</strong> {customer.brand_car}
            </p>
            <p>
              <strong>รุ่น:</strong> {customer.type_car}
            </p>
            <p>
              <strong>สี:</strong> {customer.color}
            </p>
          </div>
        ) : (
          <p className="text-gray-500">ไม่พบข้อมูลรถของลูกค้า</p>
        )}
      </div>
    </div>
  );
}