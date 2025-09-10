import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import "dayjs/locale/th";
import { Button, Paper, Typography } from "@mui/material";

dayjs.extend(duration);
dayjs.locale("th");

const additionalServices = [
  { id: 1, name: "ล้างรถ", price: 100 },
  { id: 2, name: "เช็ดภายใน", price: 50 },
  { id: 3, name: "ตรวจสภาพ", price: 200 },
];

export default function ReportDetailPage() {
  const { customerId, serviceId } = useParams(); // ✅ รับ serviceId จาก URL
  const navigate = useNavigate();
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`http://localhost:5000/api/customers/${customerId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          throw new Error("Failed to fetch customer data");
        }
        const customerData = await res.json();
        
        let foundService = null;
        let foundCar = null;
        
        // ค้นหาข้อมูลบริการที่ตรงกับ serviceId
        for (const car of customerData.cars) {
          const service = car.service_history.find(s => {
            const serviceIndex = car.service_history.indexOf(s);
            const generatedServiceId = `${customerData.customer_id}-${dayjs(s.entry_time).format("YYYYMMDDHHmmss")}-${serviceIndex}`;
            return generatedServiceId === serviceId;
          });
          
          if (service) {
            foundService = service;
            foundCar = car;
            break;
          }
        }
        
        if (!foundCar || !foundService) {
          throw new Error("Service not found");
        }

        const calculatedData = {
          customer_name: customerData.customer_name,
          phone_number: customerData.phone_number,
          car_registration: foundCar.car_registration,
          car_registration_province: foundCar.car_registration_province,
          brand_car: foundCar.brand_car,
          type_car: foundCar.type_car,
          color: foundCar.color,
          ...foundService,
        };
        
        setReportData(calculatedData);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [customerId, serviceId]); // ✅ เปลี่ยน dependency เป็น serviceId

  const getServiceName = (serviceIds) => {
    if (!serviceIds || serviceIds.length === 0) return "ไม่มี";
    return serviceIds
      .map((id) => {
        const service = additionalServices.find((s) => s.id === id);
        return service ? service.name : "";
      })
      .filter(Boolean)
      .join(", ");
  };
  
  const calculateDuration = (entry, exit) => {
    if (!exit || !entry) return "-";
    const entryTime = dayjs(entry);
    const exitTime = dayjs(exit);
    const diff = dayjs.duration(exitTime.diff(entryTime));
    const days = diff.days();
    const hours = diff.hours();
    const minutes = diff.minutes();
    if (days > 0) {
      return `${days} วัน ${hours} ชั่วโมง ${minutes} นาที`;
    } else {
      return `${hours} ชั่วโมง ${minutes} นาที`;
    }
  };

  if (loading) return <div className="p-6 text-center text-lg">กำลังโหลดข้อมูล...</div>;
  if (error) return <div className="p-6 text-center text-lg text-red-500">เกิดข้อผิดพลาด: {error}</div>;
  if (!reportData) return <div className="p-6 text-center text-lg">ไม่พบข้อมูลบริการ</div>;

  const {
    customer_name,
    phone_number,
    car_registration,
    car_registration_province,
    brand_car,
    type_car,
    color,
    parking_slot,
    parking_lot,
    entry_time,
    exit_time,
    services,
    total_price,
    note,
  } = reportData;

  const getServicePrice = (id) => additionalServices.find(s => s.id === id)?.price || 0;
  const totalServicesPrice = services.reduce((sum, id) => sum + getServicePrice(id), 0);

  return (
    <div className="p-6 sm:p-10 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <Typography variant="h4" component="h2" className="text-3xl font-bold text-[#ea7f33]">
          รายละเอียดการบริการ
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate(-1)}
          sx={{ bgcolor: "#5c6bc0", "&:hover": { bgcolor: "#3f51b5" } }}
        >
          กลับ
        </Button>
      </div>
      <Paper elevation={3} className="p-6 space-y-8 rounded-lg">
        <div>
          <Typography variant="h5" className="font-bold mb-4 text-gray-700">
            ข้อมูลลูกค้าและรถ
          </Typography>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Typography>
              <strong>รหัสลูกค้า:</strong> {customerId}
            </Typography>
            <Typography>
              <strong>ชื่อ-นามสกุล:</strong> {customer_name}
            </Typography>
            <Typography>
              <strong>เบอร์โทรศัพท์:</strong> {phone_number}
            </Typography>
            <Typography>
              <strong>ทะเบียนรถ:</strong> {car_registration} ({car_registration_province})
            </Typography>
            <Typography>
              <strong>ยี่ห้อ:</strong> {brand_car}
            </Typography>
            <Typography>
              <strong>รุ่น/ประเภท:</strong> {type_car}
            </Typography>
            <Typography>
              <strong>สี:</strong> {color}
            </Typography>
          </div>
        </div>

        <div>
          <Typography variant="h5" className="font-bold mb-4 text-gray-700">
            รายละเอียดการบริการ
          </Typography>
          <div className="space-y-4">
            {parking_slot && (
              <div className="p-4 rounded-lg bg-gray-100 border border-gray-200">
                <Typography variant="h6" className="font-semibold mb-2 text-orange-600">
                  บริการเช่าที่จอด
                </Typography>
                <Typography>
                  <strong>ช่องจอดที่:</strong> {parking_slot}
                </Typography>
                <Typography>
                  <strong>เข้าวันที่:</strong> {dayjs(entry_time).format("DD/MM/YYYY")}
                </Typography>
                <Typography>
                  <strong>เวลาเข้า:</strong> {dayjs(entry_time).format("HH:mm")}
                </Typography>
                <Typography>
                  <strong>ออกวันที่:</strong> {exit_time ? dayjs(exit_time).format("DD/MM/YYYY") : "-"}
                </Typography>
                <Typography>
                  <strong>เวลาออก:</strong> {exit_time ? dayjs(exit_time).format("HH:mm") : "-"}
                </Typography>
                <Typography>
                  <strong>รวมระยะเวลา:</strong> {calculateDuration(entry_time, exit_time)}
                </Typography>
              </div>
            )}
            {services.length > 0 && (
              <div className="p-4 rounded-lg bg-gray-100 border border-gray-200">
                <Typography variant="h6" className="font-semibold mb-2 text-green-600">
                  บริการเพิ่มเติม
                </Typography>
                <ul className="list-disc pl-5 space-y-1">
                  {services.map((serviceId) => {
                    const service = additionalServices.find(s => s.id === serviceId);
                    return (
                      <li key={serviceId}>
                        <Typography>
                          **{service?.name || "ไม่ระบุ"}:** {service?.price || 0} บาท
                        </Typography>
                      </li>
                    );
                  })}
                </ul>
                <Typography className="mt-2">
                  <strong>รวมราคาบริการเพิ่มเติม:</strong> {totalServicesPrice} บาท
                </Typography>
              </div>
            )}
          </div>
        </div>
        <div>
          <Typography variant="h5" className="font-bold mb-4 text-gray-700">
            สรุป
          </Typography>
          <Typography className="text-lg">
            <strong>หมายเหตุ:</strong> {note || "-"}
          </Typography>
          <Typography className="text-xl font-bold mt-2">
            <strong>ยอดรวมทั้งหมด:</strong> {total_price} บาท
          </Typography>
        </div>
      </Paper>
    </div>
  );
}