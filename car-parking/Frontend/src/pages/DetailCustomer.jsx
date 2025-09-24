import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { IconButton } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import InfoIcon from "@mui/icons-material/Info";
import PrintIcon from "@mui/icons-material/Print";

export default function DetailCustomer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [serviceHistories, setServiceHistories] = useState([]);
  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const res = await fetch(
          `http://localhost:5000/api/customers/${id}/service-history`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!res.ok) {
          throw new Error("ไม่พบข้อมูลลูกค้า");
        }

        const data = await res.json();
        setCustomer(data.customer);
        setServiceHistories(data.serviceHistories || []);
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
      <div className="p-6 text-center text-lg font-semibold">
        ไม่พบข้อมูลลูกค้า
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center space-x-4">
        <IconButton onClick={() => navigate(-1)} className="text-gray-600">
          <ArrowBackIcon />
        </IconButton>
        <h2 className="text-3xl font-bold text-[#ea7f33]">รายละเอียดลูกค้า</h2>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h3 className="text-xl font-semibold mb-4 text-[#ea7f33]">
          ข้อมูลทั่วไป
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-gray-700 ">
          <p>
            <strong>ชื่อ-นามสกุล:</strong> {customer.customer_name}
          </p>
          <p>
            <strong>เบอร์โทรศัพท์:</strong> {customer.phone_number}
          </p>
          <p>
            <strong>ที่อยู่:</strong>
            {customer.house_number}, {customer.village} หมู่บ้าน {customer.road}
            , ถนน {customer.canton}, ตำบล {customer.district}, อำเภอ{" "}
            {customer.province}, จังหวัด {customer.zip_code}
          </p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h3 className="text-xl font-semibold mb-4 text-[#ea7f33]">
          ประวัติการใช้บริการ
        </h3>

        {customer.cars && customer.cars.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                    ลำดับ
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    ทะเบียนรถ
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    วันที่เข้าใช้บริการ
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    การบริการ
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    จำนวนเงิน
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    สถานะ
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {customer.cars.map((car) =>
                  (car.service_history || []).map((s, index) => {
                    let serviceType = "";
                    if (s.parking_slot && s.services?.length > 0)
                      serviceType = "เช่าที่จอด + บริการเพิ่มเติม";
                    else if (s.parking_slot) serviceType = "เช่าที่จอด";
                    else if (s.services?.length > 0)
                      serviceType = "บริการเพิ่มเติม";

                    return (
                      <tr key={s._id}>
                        <td className="px-4 py-2 text-center">{index + 1}</td>
                        <td className="px-4 py-2">{car.car_registration}</td>
                        <td>
                          {s.entry_time
                            ? new Date(s.entry_time).toLocaleDateString()
                            : "-"}
                        </td>

                        <td className="px-4 py-2">{serviceType}</td>
                        <td className="px-4 py-2">
                          {s.total_price?.toFixed(2) || 0} บาท
                        </td>
                        <td className="px-4 py-2">
                          <span
                            className={`px-2 py-1 rounded text-white font-semibold ${
                              s.is_paid ? "bg-green-500" : "bg-red-500"
                            }`}
                          >
                            {s.is_paid ? "ชำระแล้ว" : "ยังไม่ชำระ"}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">ยังไม่มีประวัติการใช้บริการ</p>
        )}
      </div>
    </div>
  );
}
