import React, { useState, useEffect } from "react";

export default function Main() {
  const [time, setTime] = useState(new Date());

  // อัปเดตเวลาแบบ real-time
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    console.log("Logout clicked");
    // TODO: ลบ token และ redirect ไปหน้า login
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="flex items-center justify-between bg-blue-600 text-white px-6 py-4 shadow-md">
        <div className="text-xl font-bold">🚗 CarParking</div>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg font-semibold"
        >
          ออกจากระบบ
        </button>
      </header>

      {/* Content */}
      <main className="flex flex-1 p-6">
        {/* ซ้าย */}
        <div className="w-1/2 border-r pr-6 flex flex-col items-center justify-center">
          <h1 className="text-4xl font-bold mb-6">CarParking</h1>
          <div className="text-lg font-mono text-gray-700">
            <p>{time.toLocaleTimeString("th-TH")}</p>
            <p>{time.toLocaleDateString("th-TH", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}</p>
          </div>
        </div>

        {/* ขวา */}
        <div className="w-1/2 pl-6 grid grid-cols-2 gap-6">
          {["Module 1", "Module 2", "Module 3", "Module 4", "Module 5"].map(
            (mod, index) => (
              <div
                key={index}
                className="bg-white shadow-md rounded-xl p-6 flex items-center justify-center text-lg font-semibold hover:shadow-lg hover:bg-blue-50 cursor-pointer transition"
              >
                {mod}
              </div>
            )
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-200 text-center text-sm py-4 mt-auto">
        <p>
          Copyright © 2025 ศูนย์วิจัยระบบอัตโนมัติอัจฉริยะ คณะวิศวกรรมศาสตร์,
          ศูนย์ส่งเสริมอุตสาหกรรมภาคที่ 11 and Powered By IARC PSU Ver
          0.4.4.12
        </p>
        <div className="mt-1 space-x-4">
          <a
            href="https://iarc.psu.ac.th/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:underline"
          >
            IARC PSU
          </a>
          <a
            href="https://iarc.psu.ac.th/about/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:underline"
          >
            About Us
          </a>
        </div>
      </footer>
    </div>
  );
}
