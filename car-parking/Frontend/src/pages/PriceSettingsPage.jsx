import React, { useState, useEffect } from "react";
import { FaPlusCircle, FaSave, FaTrash } from "react-icons/fa";
import { TextField, Button, Box, Typography } from "@mui/material";

export default function PriceSettingsPage() {
  const [dailyRate, setDailyRate] = useState(0);
  const [hourlyRate, setHourlyRate] = useState(0);
  const [additionalServices, setAdditionalServices] = useState([]);
  const [newServiceName, setNewServiceName] = useState("");
  const [newServicePrice, setNewServicePrice] = useState(0);

  // จำลองการดึงข้อมูลราคาจาก API
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:5000/api/prices", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data) {
          setDailyRate(data.dailyRate || 0);
          setHourlyRate(data.hourlyRate || 0);
          setAdditionalServices(data.additionalServices || []);
        }
      } catch (err) {
        console.error("Error fetching prices:", err);
      }
    };
    fetchPrices();
  }, []);

  const handleAddService = () => {
    if (newServiceName && newServicePrice > 0) {
      setAdditionalServices([
        ...additionalServices,
        { name: newServiceName, price: parseFloat(newServicePrice), id: Date.now() },
      ]);
      setNewServiceName("");
      setNewServicePrice(0);
    }
  };

  const handleDeleteService = (id) => {
    setAdditionalServices(additionalServices.filter(s => s.id !== id));
  };

  const handleSavePrices = async () => {
    const payload = {
      dailyRate: parseFloat(dailyRate),
      hourlyRate: parseFloat(hourlyRate),
      additionalServices,
    };

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/prices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert("บันทึกข้อมูลราคาสำเร็จ!");
      } else {
        const data = await res.json();
        alert("บันทึกข้อมูลไม่สำเร็จ: " + data.message);
      }
    } catch (err) {
      console.error("Failed to save prices:", err);
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    }
  };

  return (
    <div className="p-6 sm:p-10 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-3xl font-bold text-[#ea7f33] mb-6">ตั้งค่าราคา</h2>

        <div className="space-y-6">
          {/* Parking Price Settings */}
          <div className="p-6 bg-gray-100 rounded-lg border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              ตั้งค่าราคาค่าจอด
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <TextField
                label="ราคาต่อวัน"
                type="number"
                value={dailyRate}
                onChange={(e) => setDailyRate(e.target.value)}
                variant="outlined"
                fullWidth
              />
              <TextField
                label="ราคาต่อชั่วโมง"
                type="number"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
                variant="outlined"
                fullWidth
              />
            </div>
          </div>

          {/* Additional Service Settings */}
          <div className="p-6 bg-gray-100 rounded-lg border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              ตั้งค่าบริการเพิ่มเติม
            </h3>
            <div className="space-y-3 mb-4">
              {additionalServices.map((service) => (
                <div
                  key={service.id}
                  className="flex items-center justify-between bg-white p-3 rounded-md shadow-sm"
                >
                  <Typography>
                    {service.name} ({service.price} บาท)
                  </Typography>
                  <Button
                    variant="text"
                    color="error"
                    onClick={() => handleDeleteService(service.id)}
                    startIcon={<FaTrash />}
                  >
                    ลบ
                  </Button>
                </div>
              ))}
            </div>

            <Box className="flex gap-2">
              <TextField
                label="ชื่อบริการ"
                value={newServiceName}
                onChange={(e) => setNewServiceName(e.target.value)}
                variant="outlined"
                className="flex-1"
              />
              <TextField
                label="ราคา"
                type="number"
                value={newServicePrice}
                onChange={(e) => setNewServicePrice(e.target.value)}
                variant="outlined"
                sx={{ width: "120px" }}
              />
              <Button
                variant="contained"
                onClick={handleAddService}
                startIcon={<FaPlusCircle />}
                sx={{ bgcolor: "#ea7f33", "&:hover": { bgcolor: "#e06d1f" } }}
              >
                เพิ่ม
              </Button>
            </Box>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end mt-6">
          <Button
            variant="contained"
            onClick={handleSavePrices}
            startIcon={<FaSave />}
            sx={{
              px: 6,
              py: 1.5,
              bgcolor: "#4CAF50",
              "&:hover": { bgcolor: "#45a049" },
            }}
          >
            บันทึก
          </Button>
        </div>
      </div>
    </div>
  );
}