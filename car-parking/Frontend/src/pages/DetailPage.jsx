import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { IconButton } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

// Service definitions to map IDs to names and prices
const serviceDefinitions = [
  { id: 1, name: "ล้างรถ", price: 100 },
  { id: 2, name: "เช็ดภายใน", price: 50 },
  { id: 3, name: "ตรวจสภาพ", price: 200 },
  { id: 4, name: "เช่าที่จอด", price: 0 } // Parking service
];

const PARKING_SERVICE_ID = 4;

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
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchCustomer();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-xl">
        กำลังโหลด...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-xl text-red-600">
        <p>เกิดข้อผิดพลาด: {error}</p>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="flex justify-center items-center h-screen text-xl">
        ไม่พบข้อมูลลูกค้า
      </div>
    );
  }

  const getServiceDetails = (serviceIds) => {
    if (!serviceIds) return [];
    return serviceIds.map(id => serviceDefinitions.find(s => s.id === id)).filter(Boolean);
  };

  const parkingService = getServiceDetails(customer.services).find(s => s.id === PARKING_SERVICE_ID);
  const additionalServices = getServiceDetails(customer.services).filter(s => s.id !== PARKING_SERVICE_ID);
  const totalServicePrice = additionalServices.reduce((sum, service) => sum + service.price, 0);

  return (
    <div className="p-8 bg-white-100 min-h-screen">
      <div className="flex items-center mb-6">
        <IconButton onClick={() => navigate(-1)} aria-label="back">
          <ArrowBackIcon />
        </IconButton>
        <h1 className="text-3xl font-bold text-[#ea7f33] ml-4">
          รายละเอียดลูกค้า
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Info */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-2xl font-bold mb-4 text-[#ea7f33]">
            ข้อมูลลูกค้า
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
            <p><strong>ชื่อ-นามสกุล:</strong> {customer.customer_name}</p>
            <p><strong>เบอร์โทรศัพท์:</strong> {customer.phone_number}</p>
            <p><strong>รหัสลูกค้า:</strong> {customer.customer_id}</p>
            <p><strong>วันที่เข้ารับบริการ:</strong> {dayjs(customer.entry_time).format("DD/MM/YYYY HH:mm")}</p>
            <p className="md:col-span-2"><strong>ที่อยู่:</strong> {customer.house_number} หมู่บ้าน {customer.village}, ถนน {customer.road}, ตำบล {customer.canton}, อำเภอ {customer.district}, จังหวัด {customer.province}, {customer.zip_code}</p>
          </div>
        </div>

        {/* Vehicle Info */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-2xl font-bold mb-4 text-[#ea7f33]">
            ข้อมูลรถ
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
            <p><strong>ทะเบียนรถ:</strong> {customer.car_registration}</p>
            <p><strong>จังหวัด (ป้าย):</strong> {customer.car_registration_province}</p>
            <p><strong>ยี่ห้อ:</strong> {customer.brand_car}</p>
            <p><strong>รุ่น:</strong> {customer.type_car}</p>
            <p><strong>สี:</strong> {customer.color}</p>
          </div>
        </div>
        
        {/* Services Info */}
        <div className="bg-white p-6 rounded-lg shadow-lg lg:col-span-2">
          <h3 className="text-2xl font-bold mb-4 text-[#ea7f33]">
            ข้อมูลบริการ
          </h3>
          <div className="space-y-4">
            {parkingService && (
              <div>
                <h4 className="font-bold text-lg text-[#ea7f33]">
                  - เช่าที่จอด:
                </h4>
                <div className="pl-4 mt-2">
                  <span className="bg-[#ea7f33] text-white px-3 py-1 rounded-full text-sm font-semibold">
                    ช่องจอด: {customer.parking_slot}
                  </span>
                </div>
              </div>
            )}
            {additionalServices.length > 0 && (
              <div>
                <h4 className="font-bold text-lg text-green-600">
                  - บริการเพิ่มเติม:
                </h4>
                <ul className="list-none space-y-2 pl-4 mt-2">
                  {additionalServices.map(s => (
                    <li key={s.id} className="bg-green-100 p-2 rounded-lg flex justify-between items-center">
                      <span className="text-gray-800">{s.name}</span>
                      <span className="font-semibold text-green-700">{s.price} บาท</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="mt-6 pt-4 border-t-2 border-dashed border-gray-300">
              <p className="text-right text-2xl font-bold text-gray-800">
                ยอดรวมทั้งหมด: {totalServicePrice} บาท
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}