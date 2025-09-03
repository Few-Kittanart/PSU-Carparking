import React from "react";

export default function Header({ onLogout }) {
  return (
    <header className="flex items-center justify-between bg-white shadow-md px-6 py-4">
      <div className="text-xl sm:text-2xl font-bold text-[#ea7f33]">
        🚗 CarParking
      </div>
      <button
        onClick={onLogout}
        className="bg-[#e79316] hover:bg-[#eb9c25] text-white px-4 py-2 rounded-lg font-semibold text-sm sm:text-base shadow-md transition"
      >
        ออกจากระบบ
      </button>
    </header>
  );
}
