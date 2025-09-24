import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import {
  Button,
  CircularProgress,
  Paper,
  Typography,
  IconButton,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

export default function PaymentPage() {
  const { id } = useParams(); // transaction ID
  const navigate = useNavigate();

  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [additionalServices, setAdditionalServices] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        // Fetch transaction
        const transRes = await fetch(
          `http://localhost:5000/api/transactions/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!transRes.ok) throw new Error("ไม่พบข้อมูล transaction");
        const transData = await transRes.json();
        setTransaction(transData);

        // Fetch additional services
        const pricesRes = await fetch("http://localhost:5000/api/prices", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (pricesRes.ok) {
          const pricesData = await pricesRes.json();
          setAdditionalServices(pricesData.additionalServices || []);
        }
      } catch (err) {
        console.error("Error fetching transaction:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <CircularProgress />
        <span className="ml-4 text-xl">กำลังโหลด...</span>
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center items-center h-screen text-red-600">
        <p>เกิดข้อผิดพลาด: {error}</p>
      </div>
    );

  if (!transaction)
    return (
      <div className="p-6 text-center text-lg font-semibold text-gray-700">
        ไม่พบข้อมูล transaction
      </div>
    );

  const { customer, car, serviceHistory, total_price } = transaction;

  const latestUnpaidService = serviceHistory?.is_paid ? null : serviceHistory;

  const getServiceNames = (serviceIds) => {
    return serviceIds
      .map((id) => {
        const svc = additionalServices.find((s) => s.id === id);
        return svc ? svc.name : null;
      })
      .filter(Boolean);
  };

  const handlePay = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:5000/api/transactions/${transaction._id}/pay`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("การชำระเงินไม่สำเร็จ");

      const updatedTransaction = await res.json();
      alert("ชำระเงินเรียบร้อยแล้ว!");

      // อัปเดต state ของ transaction
      setTransaction(updatedTransaction.transaction);
    } catch (err) {
      alert("เกิดข้อผิดพลาด: " + err.message);
      console.error(err);
    }
  };
  return (
    <div className="p-6 sm:p-10 space-y-6 bg-gray-100 min-h-screen">
      <div className="flex items-center">
        <IconButton onClick={() => navigate(-1)}>
          <ArrowBackIcon />
        </IconButton>
        <h1 className="text-2xl font-bold text-[#ea7f33] ml-4">หน้าชำระเงิน</h1>
      </div>

      <Paper className="p-6 rounded-lg" elevation={3}>
        <h2 className="text-xl font-semibold text-[#ea7f33] mb-4">
          ข้อมูลลูกค้า
        </h2>
        <Typography>
          <strong>ชื่อ-นามสกุล:</strong> {customer.customer_name}
        </Typography>
        <Typography>
          <strong>เบอร์โทรศัพท์:</strong> {customer.phone_number}
        </Typography>
        <Typography>
          <strong>รถ:</strong> {car.brand_car} / {car.car_registration}
        </Typography>
      </Paper>

      {latestUnpaidService ? (
        <Paper className="p-6 rounded-lg" elevation={3}>
          <h2 className="text-xl font-semibold text-[#ea7f33] mb-4">
            บริการที่ต้องชำระ
          </h2>
          {latestUnpaidService.parking_slot && (
            <>
              <Typography>
                <strong>ช่องจอด:</strong> {latestUnpaidService.parking_slot}
              </Typography>
              <Typography>
                <strong>วันเวลาเข้า:</strong>{" "}
                {dayjs(latestUnpaidService.entry_time).format(
                  "DD/MM/YYYY HH:mm"
                )}
              </Typography>
              {latestUnpaidService.exit_time && (
                <Typography>
                  <strong>วันเวลาออก:</strong>{" "}
                  {dayjs(latestUnpaidService.exit_time).format(
                    "DD/MM/YYYY HH:mm"
                  )}
                </Typography>
              )}
              <Typography>
                <strong>ราคาค่าจอด:</strong>{" "}
                {latestUnpaidService.parking_price?.toFixed(2) || "0.00"} บาท
              </Typography>
            </>
          )}

          {latestUnpaidService.services?.length > 0 && (
            <>
              <Typography className="mt-4 font-semibold">
                บริการเพิ่มเติม:
              </Typography>
              <ul className="list-disc pl-5">
                {getServiceNames(latestUnpaidService.services).map(
                  (name, i) => (
                    <li key={i}>{name}</li>
                  )
                )}
              </ul>
              <Typography>
                <strong>ราคาบริการเสริม:</strong>{" "}
                {latestUnpaidService.additional_price?.toFixed(2) || "0.00"} บาท
              </Typography>
            </>
          )}

          <Typography className="mt-4 text-2xl font-bold text-[#ea7f33]">
            ยอดรวม: {total_price?.toFixed(2) || "0.00"} บาท
          </Typography>

          <Button
            variant="contained"
            startIcon={<CheckCircleIcon />}
            onClick={handlePay}
            sx={{
              mt: 4,
              bgcolor: "#4CAF50",
              "&:hover": { bgcolor: "#45a049" },
              px: 6,
              py: 1.5,
            }}
          >
            ชำระเงิน
          </Button>
        </Paper>
      ) : (
        <div className="p-6 text-center text-lg font-semibold text-gray-700">
          รายการนี้ชำระเงินแล้ว
        </div>
      )}
    </div>
  );
}
