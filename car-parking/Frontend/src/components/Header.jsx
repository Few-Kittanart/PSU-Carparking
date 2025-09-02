import React from "react";

export default function Header({ onLogout }) {
  return (
    <header className="flex items-center justify-between bg-blue-600 text-white px-6 py-4 shadow-md">
      <div className="text-xl font-bold">🚗 CarParking</div>
      <button
        onClick={onLogout}
        className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg font-semibold"
      >
        ออกจากระบบ
      </button>
    </header>
  );
}
