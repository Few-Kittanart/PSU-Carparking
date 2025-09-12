import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { IconButton, Button, CircularProgress, Typography, Paper } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import "dayjs/locale/th";

export default function PaymentPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [latestUnpaidService, setLatestUnpaidService] = useState(null);
  const [additionalServices, setAdditionalServices] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        // Fetch additional services prices
        const pricesRes = await fetch("http://localhost:5000/api/prices", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const pricesData = await pricesRes.json();
        setAdditionalServices(pricesData.additionalServices || []);

        // Fetch customer data
        const customerRes = await fetch(`http://localhost:5000/api/customers/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!customerRes.ok) {
          throw new Error("ไม่พบข้อมูลลูกค้า");
        }
        const data = await customerRes.json();
        setCustomer(data);

        // Find the latest unpaid service
        if (data.cars && data.cars.length > 0) {
          const allUnpaidServices = data.cars.flatMap(car =>
            car.service_history.filter(service => service.is_paid === false)
          );
          
          if (allUnpaidServices.length > 0) {
            const latest = allUnpaidServices.sort((a, b) => 
              dayjs(b.entry_time) - dayjs(a.entry_time)
            )[0];
            setLatestUnpaidService(latest);
          }
        }

      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handlePay = async () => {
    if (!latestUnpaidService) {
      alert("ไม่พบรายการที่ยังไม่ได้ชำระเงิน");
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

      if (!res.ok) {
        throw new Error("การชำระเงินไม่สำเร็จ");
      }

      alert("ชำระเงินเรียบร้อยแล้ว!");
      navigate("/manage"); // Navigate back to manage page after successful payment
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการชำระเงิน: " + err.message);
      console.error(err);
    }
  };

  const getServiceName = (serviceIds) => {
    return serviceIds.map(id => {
      const service = additionalServices.find(s => s.id === id);
      return service ? service.name : null;
    }).filter(Boolean);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <CircularProgress />
        <span className="ml-4 text-xl">กำลังโหลด...</span>
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

  if (!customer || !latestUnpaidService) {
    return (
      <div className="p-6 text-center text-lg font-semibold text-gray-700">
        ไม่พบรายการที่ต้องชำระเงินสำหรับลูกค้านี้
      </div>
    );
  }

  const carInfo = customer.cars.find(car => 
    car.service_history.some(service => dayjs(service.entry_time).isSame(dayjs(latestUnpaidService.entry_time)))
  );

  return (
    <div className="p-6 sm:p-10 space-y-8 bg-gray-100 min-h-screen">
      <div className="flex items-center">
        <IconButton onClick={() => navigate(-1)} aria-label="back">
          <ArrowBackIcon />
        </IconButton>
        <h1 className="text-2xl font-bold text-[#ea7f33] ml-4">หน้าชำระเงิน</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Paper elevation={3} className="p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4 text-[#ea7f33]">
            ข้อมูลลูกค้า
          </h3>
          <div className="space-y-2 text-gray-700">
            <Typography>
              <strong>ชื่อ-นามสกุล:</strong> {customer.customer_name}
            </Typography>
            <Typography>
              <strong>เบอร์โทรศัพท์:</strong> {customer.phone_number}
            </Typography>
            <Typography>
              <strong>ทะเบียนรถ:</strong> {carInfo?.car_registration || "-"} ({carInfo?.car_registration_province || "-"})
            </Typography>
          </div>
        </Paper>

        <Paper elevation={3} className="p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4 text-[#ea7f33]">
            ข้อมูลบริการ
          </h3>
          <div className="space-y-2 text-gray-700">
            {latestUnpaidService.parking_slot && (
              <>
                <Typography>
                  <strong>ช่องจอด:</strong> {latestUnpaidService.parking_slot}
                </Typography>
                <Typography>
                  <strong>วันเวลาเข้า:</strong> {dayjs(latestUnpaidService.entry_time).format("DD/MM/YYYY HH:mm")}
                </Typography>
                {latestUnpaidService.exit_time && (
                    <Typography>
                        <strong>วันเวลาออก:</strong> {dayjs(latestUnpaidService.exit_time).format("DD/MM/YYYY HH:mm")}
                    </Typography>
                )}
                <Typography>
                    <strong>ราคาค่าจอด:</strong> {latestUnpaidService.parking_price?.toFixed(2) || "0.00"} บาท
                </Typography>
              </>
            )}
            {latestUnpaidService.services?.length > 0 && (
              <div className="mt-4">
                <Typography className="font-bold">
                  บริการเพิ่มเติม:
                </Typography>
                <ul className="list-disc pl-5">
                  {getServiceName(latestUnpaidService.services).map((name, index) => (
                    <li key={index}>{name}</li>
                  ))}
                </ul>
                <Typography className="mt-2">
                    <strong>ราคาบริการเสริม:</strong> {latestUnpaidService.additional_price?.toFixed(2) || "0.00"} บาท
                </Typography>
              </div>
            )}
          </div>
        </Paper>
      </div>

      <Paper elevation={3} className="p-6 rounded-lg flex flex-col items-center justify-center text-center">
        <h3 className="text-2xl font-bold mb-4 text-gray-800">สรุปค่าใช้จ่าย</h3>
        <p className="text-4xl font-extrabold text-[#ea7f33] mb-6">
          {latestUnpaidService.total_price?.toFixed(2) || "0.00"} บาท
        </p>
        <Button
          variant="contained"
          onClick={handlePay}
          sx={{
            bgcolor: "#4CAF50",
            "&:hover": { bgcolor: "#45a049" },
            px: 6,
            py: 1.5,
            fontSize: "1.2rem",
          }}
          startIcon={<CheckCircleIcon />}
        >
          ชำระเงิน
        </Button>
      </Paper>
    </div>
  );
}