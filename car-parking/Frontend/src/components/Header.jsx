import React from "react";
import { useSettings } from "../context/SettingContext";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const { settings, loading } = useSettings();
  const navigate = useNavigate();

  const handleLogout = () => {
    // ลบข้อมูลการล็อกอินออกจาก localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // เคลียร์ประวัติการนำทางเพื่อป้องกันการกดย้อนกลับ
    window.history.pushState(null, null, window.location.href);
    window.addEventListener('popstate', function(event) {
      window.history.pushState(null, null, window.location.href);
    });

    // นำทางไปยังหน้า Login
    navigate("/");
  };
  
  const handleLogoClick = () => {
    navigate("/main");
  };

  return (
    <header className="flex items-center justify-between bg-white shadow-md px-6 py-4">
      <div 
        className="text-xl sm:text-2xl font-bold text-[#ea7f33] cursor-pointer"
        onClick={handleLogoClick}
      >
        {settings?.systemName || "EParking"}
      </div>
      <button
        onClick={handleLogout}
        className="bg-[#e79316] hover:bg-[#eb9c25] text-white px-4 py-2 rounded-lg font-semibold text-sm sm:text-base shadow-md transition"
      >
        ออกจากระบบ
      </button>
    </header>
  );
}