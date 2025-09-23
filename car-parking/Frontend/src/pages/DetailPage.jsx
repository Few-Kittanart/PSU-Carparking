import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import dayjs from "dayjs";

export default function DetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [transaction, setTransaction] = useState(null);
  const [serviceList, setServiceList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ดึงข้อมูล transaction ตาม ID
  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`http://localhost:5000/api/transactions/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("ไม่พบข้อมูล transaction");
        const data = await res.json();
        setTransaction(data);
      } catch (err) {
        console.error(err);
        setError(err.message);
      }
    };
    fetchTransaction();
  }, [id]);

  // ดึงรายการบริการเพิ่มเติมจาก backend
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
      } finally {
        setLoading(false);
      }
    };
    fetchServiceList();
  }, []);

  if (loading)
    return <div className="p-6 text-center text-lg font-semibold">กำลังโหลดข้อมูล...</div>;

  if (error)
    return (
      <div className="p-6 text-center text-lg font-semibold text-red-500">
        เกิดข้อผิดพลาด: {error}
      </div>
    );

  if (!transaction) return null;

  const { customer, car, serviceHistory, total_price } = transaction;

  return (
    <div className="p-6 sm:p-10 space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="px-4 py-2 rounded-lg bg-[#ea7f33] text-white font-semibold hover:bg-[#d26d2a]"
      >
        ← กลับ
      </button>

      <h2 className="text-3xl font-bold text-[#ea7f33] mt-4">รายละเอียด Transaction</h2>

      <div className="space-y-4 mt-6">

        <div>
          <strong>รหัส Transaction:</strong> {transaction._id}
        </div>

        <div>
          <strong>วันที่ทำรายการ:</strong>{" "}
          {dayjs(transaction.date).format("DD/MM/YYYY HH:mm")}
        </div>

        <div>
          <strong>ลูกค้า:</strong> {customer.customer_name} ({customer.phone_number})
        </div>

        <div>
          <strong>รถ:</strong> {car.brand_car} / {car.car_registration}
        </div>

        {/* การเช่าที่จอด */}
        {serviceHistory.parking_slot && (
          <div className="p-4 rounded-xl bg-blue-100 space-y-2">
            <h3 className="text-lg font-semibold text-blue-700">เช่าที่จอด</h3>
            <div>
              <strong>ช่องจอด:</strong> {serviceHistory.parking_slot}
            </div>
            <div>
              <strong>วันที่เข้า:</strong>{" "}
              {dayjs(serviceHistory.entry_time).format("DD/MM/YYYY HH:mm")}
            </div>
            <div>
              <strong>วันที่ออก:</strong>{" "}
              {dayjs(serviceHistory.exit_time).format("DD/MM/YYYY HH:mm")}
            </div>
            <div>
              <strong>ราคา:</strong> {serviceHistory.parking_price} บาท
            </div>
            <div>
              <strong>รวมเวลาจอด:</strong> {serviceHistory.day_park}
            </div>
          </div>
        )}

        {/* บริการเพิ่มเติม */}
        {serviceHistory.services && serviceHistory.services.length > 0 && (
          <div className="p-4 rounded-xl bg-green-100 space-y-2">
            <h3 className="text-lg font-semibold text-green-700">บริการเพิ่มเติม</h3>
            <div>
              <strong>รายการ:</strong>{" "}
              {serviceHistory.services
                .map((id) => {
                  const service = serviceList.find((s) => s.id === id);
                  return service ? service.name : id;
                })
                .join(", ")}
            </div>
            <div>
              <strong>ราคา:</strong> {serviceHistory.additional_price} บาท
            </div>
          </div>
        )}

        <div className="p-4 rounded-xl bg-orange-100">
          <div>
            <strong>ยอดรวม:</strong> {total_price.toFixed(2)} บาท
          </div>
          <div>
            <strong>สถานะชำระเงิน:</strong>{" "}
            {serviceHistory.is_paid ? (
              <span className="text-green-700 font-semibold">ชำระแล้ว</span>
            ) : (
              <span className="text-red-500 font-semibold">ยังไม่ได้ชำระ</span>
            )}
          </div>
        </div>

        {/* ปุ่มชำระเงิน */}
        {!serviceHistory.is_paid && (
          <button
            onClick={() => navigate(`/manage/payment/${transaction._id}`)}
            className="px-6 py-2 rounded-lg bg-[#ea7f33] text-white font-semibold hover:bg-[#d26d2a]"
          >
            ชำระเงิน
          </button>
        )}
      </div>
    </div>
  );
}
