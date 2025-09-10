import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { IconButton } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

const additionalServices = [
  { id: 1, name: "ล้างรถ", price: 100 },
  { id: 2, name: "เช็ดภายใน", price: 50 },
  { id: 3, name: "ตรวจสภาพ", price: 200 },
];

export default function PaymentPage() {
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

  const handlePayment = async () => {
    if (!window.confirm("ยืนยันการชำระเงิน?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/customers/${id}/pay`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        alert("ชำระเงินสำเร็จ!");
        navigate("/manage");
      } else {
        const data = await res.json();
        alert("ชำระเงินไม่สำเร็จ: " + data.message);
      }
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการเรียก API ชำระเงิน");
    }
  };

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
      <div className="p-6 text-center text-lg font-semibold">
        ไม่พบข้อมูลลูกค้า
      </div>
    );
  }

  const latestCar = customer.cars && customer.cars.length > 0 ? customer.cars[0] : null;
  const latestCarService = latestCar && latestCar.service_history.length > 0 ? latestCar.service_history[latestCar.service_history.length - 1] : null;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <IconButton onClick={() => navigate(-1)} className="text-gray-600">
            <ArrowBackIcon />
          </IconButton>
          <h2 className="text-3xl font-bold text-[#ea7f33]">
            ชำระเงิน
          </h2>
        </div>
        <button
          onClick={handlePayment}
          className="bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-3 rounded-lg flex items-center gap-2 transition"
        >
          <CheckCircleIcon />
          ยืนยันการชำระเงิน
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h3 className="text-xl font-semibold mb-4 text-[#ea7f33]">
          ข้อมูลลูกค้า
        </h3>
        <p>
          **ชื่อ-นามสกุล:** {customer.customer_name}
        </p>
        <p>
          **ทะเบียนรถ:** {latestCar ? latestCar.car_registration : "-"} ({latestCar ? latestCar.car_registration_province : "-"})
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h3 className="text-xl font-semibold mb-4 text-[#ea7f33]">
          รายละเอียดบริการ
        </h3>
        {latestCarService ? (
            <>
                <p>
                    **ช่องจอด:** {latestCarService.parking_slot || "-"}
                </p>
                <p>
                    **เวลาเข้า:** {latestCarService.entry_time}
                </p>
                <p>
                    **เวลาออก:** {latestCarService.exit_time || "-"}
                </p>
                <p className="font-bold mt-4">รายการบริการ:</p>
                <ul>
                    {latestCarService.services && latestCarService.services.length > 0 ? (
                        latestCarService.services.map((serviceId) => {
                            const service = additionalServices.find(s => s.id === serviceId);
                            return service ? <li key={service.id}>- {service.name} ({service.price} บาท)</li> : null;
                        })
                    ) : (
                        <li>- ไม่มีบริการเพิ่มเติม</li>
                    )}
                </ul>
            </>
        ) : (
            <p className="text-gray-500">ไม่พบข้อมูลบริการ</p>
        )}
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h3 className="text-xl font-semibold mb-4 text-[#ea7f33]">
          สรุปค่าใช้จ่าย
        </h3>
        {latestCarService ? (
            <p className="text-2xl font-bold text-[#ea7f33]">
                รวม: {latestCarService.services.reduce((acc, serviceId) => {
                    const service = additionalServices.find(s => s.id === serviceId);
                    return acc + (service ? service.price : 0);
                }, 0)} บาท
            </p>
        ) : (
            <p className="text-gray-500">ไม่พบค่าใช้จ่าย</p>
        )}
      </div>
    </div>
  );
}