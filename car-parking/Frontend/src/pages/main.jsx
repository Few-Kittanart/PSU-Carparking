import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaCar, FaTools, FaChartLine, FaFileAlt, FaCog } from "react-icons/fa";

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
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState("");
  const [userAddress, setUserAddress] = useState("");

  useEffect(() => {
    const userString = localStorage.getItem("user");
    if (userString) {
      try {
        const user = JSON.parse(userString);
        setUserName(`${user.first_name} ${user.last_name}`);
        setUserRole(user.role);
        
        if (user.address) {
          const { house_number, road, canton, district, province, zip_code } = user.address;
          const addressText = [house_number, road, canton, district, province, zip_code]
            .filter(Boolean)
            .join(', ');
          setUserAddress(addressText);
        }
      } catch (error) {
        console.error("Failed to parse user data from localStorage", error);
        setUserName("Guest");
      }
    }

    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  const seconds = time.getSeconds();
  const minutes = time.getMinutes();
  const hours = time.getHours();

  const secondDeg = seconds * 6;
  const minuteDeg = minutes * 6 + seconds * 0.1;
  const hourDeg = (hours % 12) * 30 + minutes * 0.5;

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-5xl rounded-3xl bg-white shadow-2xl p-6 sm:p-10 flex flex-col md:flex-row items-center">
        {/* Left: Clock and User Info */}
        <div className="md:w-1/2 flex flex-col items-center justify-center p-6 border-b-2 md:border-b-0 md:border-r-2 border-gray-200 mb-6 md:mb-0">
          <div className="relative w-48 h-48 sm:w-64 sm:h-64 rounded-full border-4 border-[#e79316] mb-6 shadow-xl flex justify-center items-center bg-white">
            <div className="absolute w-3 h-3 bg-gray-800 rounded-full z-10" />

            <div
              className="absolute bg-gray-800 h-16 w-1 rounded-t-lg"
              style={{
                top: "50%",
                left: "50%",
                transform: `translate(-50%, -100%) rotate(${hourDeg}deg)`,
                transformOrigin: "bottom center",
              }}
            />
            <div
              className="absolute bg-gray-800 h-20 w-1 rounded-t-lg"
              style={{
                top: "50%",
                left: "50%",
                transform: `translate(-50%, -100%) rotate(${minuteDeg}deg)`,
                transformOrigin: "bottom center",
              }}
            />
            <div
              className="absolute bg-red-500 h-24 w-0.5 rounded-t-lg"
              style={{
                top: "50%",
                left: "50%",
                transform: `translate(-50%, -100%) rotate(${secondDeg}deg)`,
                transformOrigin: "bottom center",
              }}
            />
          </div>

          <div className="text-center">
            <h2 className="text-xl sm:text-2xl font-bold text-[#ea7f33] mb-2">
              ยินดีต้อนรับ   {userName}
            </h2>
            {userRole && (
              // ✅ ปรับขนาดตัวอักษรของ role
              <p className="text-xl sm:text-2xl font-bold text-[#ea7f33] mb-2">
                ตำแหน่ง: {userRole}
              </p>
            )}
            <div className="text-base sm:text-lg font-mono text-gray-700">
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
                  navigate("/service");
                } else if (mod.label === "จัดการรถ") {
                  navigate("/manage");
                }
                else if (mod.label === "แดชบอร์ด") {
                    navigate("/dashboard");
                } else if (mod.label === "รายงาน") {
                    navigate("/report");
                } else if (mod.label === "ข้อมูลระบบ") {
                    navigate("/settings");
                }
              }}
            >
              {React.cloneElement(mod.icon, { size: 40 })}
              <span className="mt-4 text-center text-lg sm:text-xl">
                {mod.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}