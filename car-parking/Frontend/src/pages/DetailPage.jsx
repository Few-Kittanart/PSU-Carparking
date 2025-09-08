import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { IconButton } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

// Service definitions to map IDs to names
const serviceDefinitions = [
  { id: 1, name: "ล้างรถ", price: 100 },
  { id: 2, name: "เช็ดภายใน", price: 50 },
  { id: 3, name: "ตรวจสภาพ", price: 200 },
  { id: 4, name: "เช่าที่จอด", price: 0 } // Parking service
];

export default function DetailPage() {
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
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCustomer();
    }
  }, [id]);

  const getServiceDetails = (serviceIds) => {
    return serviceIds?.map((id) => {
      const service = serviceDefinitions.find((s) => s.id === id);
      if (service) {
        if (service.id === 4) {
          return `${service.name} (ช่องจอด ${customer?.parking_slot})`;
        }
        return `${service.name} (${service.price} บาท)`;
      }
      return null;
    }).filter(Boolean);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-xl">
        กำลังโหลด...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-xl text-red-500">
        {error}
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="flex justify-center items-center h-screen text-xl text-gray-500">
        ไม่พบข้อมูลลูกค้าสำหรับ ID นี้
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-4 mb-6">
        <IconButton onClick={() => navigate(-1)} aria-label="back">
          <ArrowBackIcon />
        </IconButton>
        <h2 className="text-3xl font-bold text-[#ea7f33]">
          รายละเอียดลูกค้า: {customer.customer_name}
        </h2>
      </div>

      {/* Customer Info */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h3 className="text-xl font-semibold mb-4 text-[#ea7f33]">
          ข้อมูลลูกค้า
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
          <p>
            <strong>วันที่เข้ารับบริการ:</strong> {dayjs(customer.entry_time).format("DD/MM/YYYY HH:mm")}
          </p>
          {customer.exit_time && (
            <p>
              <strong>วันที่ออกจากบริการ:</strong> {dayjs(customer.exit_time).format("DD/MM/YYYY HH:mm")}
            </p>
          )}
        </div>
      </div>

      {/* Address Info */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h3 className="text-xl font-semibold mb-4 text-[#ea7f33]">
          ข้อมูลที่อยู่
        </h3>
        <p>
          {customer.house_number} หมู่บ้าน {customer.village}, ถนน{" "}
          {customer.road}, ตำบล {customer.canton}, อำเภอ {customer.district},
          จังหวัด {customer.province}, {customer.zip_code}
        </p>
      </div>

      {/* Vehicle Info */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h3 className="text-xl font-semibold mb-4 text-[#ea7f33]">
          ข้อมูลรถ
        </h3>
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
      </div>

      {/* Services Info */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h3 className="text-xl font-semibold mb-4 text-[#ea7f33]">
          ข้อมูลบริการ
        </h3>
        <ul className="list-disc pl-5">
          {getServiceDetails(customer.services).map((service, index) => (
            <li key={index}>{service}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}