import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaCar, FaTools, FaChartLine, FaFileAlt, FaCog } from "react-icons/fa";
import Header from "../components/Header";
import Footer from "../components/Footer";

const modules = [
  { label: "เข้าใช้บริการ", color: "#FF4C1C", icon: <FaCar /> },
  { label: "จัดการรถ", color: "#FF4BB1", icon: <FaTools /> },
  { label: "แดชบอร์ด", color: "#B14BFF", icon: <FaChartLine /> },
  { label: "รายงาน", color: "#FF911C", icon: <FaFileAlt /> },
  { label: "ข้อมูลระบบ", color: "#1C73FF", icon: <FaCog /> },
];

export default function Main() {
  const navigate = useNavigate();
  const [time, setTime] = useState(new Date());

  // Real-time clock
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    window.location.href = "/";
  };

  // Calculate clock hands
  const seconds = time.getSeconds();
  const minutes = time.getMinutes();
  const hours = time.getHours() % 12;
  const secondDeg = seconds * 6;
  const minuteDeg = minutes * 6 + seconds * 0.1;
  const hourDeg = hours * 30 + minutes * 0.5;

  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-800">
      <Header onLogout={handleLogout} />

      {/* Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-10 w-full max-w-6xl flex flex-col md:flex-row">
          {/* Left: Clock & Title */}
          <div className="md:w-1/2 md:border-r md:pr-8 flex flex-col items-center justify-center mb-8 md:mb-0">
            <h1 className="text-3xl sm:text-4xl font-bold mb-6 text-[#ea7f33]">
              CarParking
            </h1>

            {/* Analog Clock */}
            <div className="relative w-40 h-40 border-4 border-gray-300 rounded-full flex items-center justify-center mb-4">
              {/* Hour */}
              <div
                className="absolute bg-gray-800 rounded"
                style={{
                  width: "4px",
                  height: "40px",
                  top: "50%",
                  left: "50%",
                  transform: `translate(-50%, -100%) rotate(${hourDeg}deg)`,
                  transformOrigin: "bottom center",
                }}
              />
              {/* Minute */}
              <div
                className="absolute bg-gray-600 rounded"
                style={{
                  width: "2px",
                  height: "50px",
                  top: "50%",
                  left: "50%",
                  transform: `translate(-50%, -100%) rotate(${minuteDeg}deg)`,
                  transformOrigin: "bottom center",
                }}
              />
              {/* Second */}
              <div
                className="absolute bg-red-500 rounded"
                style={{
                  width: "1px",
                  height: "55px",
                  top: "50%",
                  left: "50%",
                  transform: `translate(-50%, -100%) rotate(${secondDeg}deg)`,
                  transformOrigin: "bottom center",
                }}
              />
              {/* Center dot */}
              <div className="absolute w-3 h-3 bg-gray-800 rounded-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </div>

            {/* Digital Time */}
            <div className="text-base sm:text-lg font-mono text-gray-700 text-center">
              <p>{time.toLocaleTimeString("th-TH")}</p>
              <p>
                {time.toLocaleDateString("th-TH", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>

          {/* Right: Module Cards */}
          <div className="md:w-1/2 md:pl-8 grid grid-cols-2 gap-6">
            {modules.map((mod, index) => (
              <div
                key={index}
                className="rounded-2xl p-8 flex flex-col items-center justify-center text-white font-bold cursor-pointer transition transform hover:scale-105 shadow-lg"
                style={{ backgroundColor: mod.color }}
                onClick={() => {
                  if (mod.label === "เข้าใช้บริการ") {
                    navigate("/service"); // Navigate to ServicePage
                  }
                }}
              >
                {React.cloneElement(mod.icon, { size: 40 })}
                <span className="mt-4 text-center text-lg sm:text-xl">{mod.label}</span>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
