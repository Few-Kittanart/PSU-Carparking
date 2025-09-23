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
          ประวัติรถของลูกค้า
        </h3>
        {customer.cars && customer.cars.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    ลำดับ
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    ทะเบียน
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    จังหวัด
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    ยี่ห้อ
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    รุ่น
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    ประเภท
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    สี
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    ดำเนินการ
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {customer.cars.map((car, index) => (
                  <tr key={car._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium text-gray-900">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {car.car_registration}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {car.car_registration_province}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {car.brand_car}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {car.type_car}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {car.type_car}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {car.color}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <IconButton color="primary" title="รายละเอียด">
                        <InfoIcon />
                      </IconButton>
                      <IconButton color="secondary" title="พิมพ์ใบรับบริการ">
                        <PrintIcon />
                      </IconButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">ไม่พบข้อมูลรถของลูกค้า</p>
        )}
      </div>
    </div>
  );
}
