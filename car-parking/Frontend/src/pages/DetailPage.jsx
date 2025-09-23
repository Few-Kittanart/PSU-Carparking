import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import dayjs from "dayjs";

export default function DetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [transaction, setTransaction] = useState(null);
  const [servicesMap, setServicesMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);

  // Fetch transaction
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
      } finally {
        setLoading(false);
      }
    };
    fetchTransaction();
  }, [id]);

  // Fetch all services mapping (_id -> service_name)
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:5000/api/services", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("ไม่สามารถดึงข้อมูลบริการได้");
        const data = await res.json();
        const map = {};
        data.forEach(s => { map[s._id] = s.service_name; });
        setServicesMap(map);
      } catch (err) {
        console.error(err);
      }
    };
    fetchServices();
  }, []);

  const handlePayment = async () => {
    if (!transaction) return;
    setPaymentLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:5000/api/transactions/${transaction._id}/pay`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error("ไม่สามารถชำระเงินได้");
      setTransaction(prev => ({
        ...prev,
        serviceHistory: { ...prev.serviceHistory, is_paid: true }
      }));
      alert("ชำระเงินเรียบร้อยแล้ว!");
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setPaymentLoading(false);
    }
  };

  if (loading)
    return <div className="p-6 text-center font-semibold">กำลังโหลดข้อมูล...</div>;
  if (error)
    return <div className="p-6 text-center font-semibold text-red-500">เกิดข้อผิดพลาด: {error}</div>;

  const sh = transaction.serviceHistory || {};
  const parkingExists = !!sh.parking_slot;
  const additionalExists = sh.services && sh.services.length > 0;

  const serviceNames = sh.services?.map(id => servicesMap[id] || id) || [];

  return (
    <div className="p-6 sm:p-10 max-w-4xl mx-auto space-y-6">
      <h2 className="text-3xl font-bold text-[#ea7f33]">รายละเอียด Transaction</h2>

      {/* Customer & Car Info */}
      <div className="bg-white shadow-lg rounded-xl p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <strong>รหัส Transaction:</strong> {transaction._id}
          </div>
          <div>
            <strong>วันที่ทำรายการ:</strong> {dayjs(transaction.date).format("DD/MM/YYYY HH:mm")}
          </div>
          <div>
            <strong>ลูกค้า:</strong> {transaction.customer?.customer_name || "-"} (
            {transaction.customer?.phone_number || "-"})
          </div>
          <div>
            <strong>รถ:</strong> {transaction.car?.brand_car || "-"} / {transaction.car?.car_registration || "-"}
          </div>
        </div>

        {/* Parking Service */}
        {parkingExists && (
          <div className="mt-4 p-4 rounded-lg bg-[#fff4e6] border border-[#ffd699]">
            <h3 className="font-semibold text-[#ea7f33] mb-2">บริการเช่าที่จอด</h3>
            <div>ช่องจอด: {sh.parking_slot}</div>
            <div>เวลาเข้า: {dayjs(sh.entry_time).format("DD/MM/YYYY HH:mm")}</div>
            <div>เวลาออก: {dayjs(sh.exit_time).format("DD/MM/YYYY HH:mm")}</div>
            <div>จำนวนวัน: {sh.day_park}</div>
            <div>ราคาจอดรถ: {sh.parking_price?.toFixed(2) || 0} บาท</div>
          </div>
        )}

        {/* Additional Services */}
        {additionalExists && (
          <div className="mt-4 p-4 rounded-lg bg-[#e6f9ff] border border-[#99e0ff]">
            <h3 className="font-semibold text-[#00aaff] mb-2">บริการเพิ่มเติม</h3>
            <div>รายการ: {serviceNames.length > 0 ? serviceNames.join(", ") : "-"}</div>
            <div>ราคาบริการเพิ่มเติม: {sh.additional_price?.toFixed(2) || 0} บาท</div>
          </div>
        )}

        {/* Total & Payment */}
        <div className="mt-4 p-4 rounded-lg bg-[#f9f9f9] border border-gray-200">
          <div>
            <strong>ยอดรวมทั้งหมด:</strong> {sh.total_price?.toFixed(2) || 0} บาท
          </div>
          <div>
            <strong>สถานะชำระเงิน:</strong>{" "}
            {sh.is_paid ? (
              <span className="text-green-600 font-semibold">ชำระแล้ว</span>
            ) : (
              <span className="text-red-600 font-semibold">ยังไม่ได้ชำระ</span>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-4 mt-4">
          <button
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
            onClick={() => navigate(-1)}
          >
            กลับ
          </button>
          {!sh.is_paid && (
            <button
              className={`px-4 py-2 bg-[#ea7f33] text-white rounded hover:bg-[#d76a1d] ${
                paymentLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              onClick={handlePayment}
              disabled={paymentLoading}
            >
              {paymentLoading ? "กำลังชำระ..." : "ชำระเงิน"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
