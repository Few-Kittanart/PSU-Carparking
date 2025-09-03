import React, { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Sidebar from "../components/Sidebar";

export default function ServicePage() {
  const [service, setService] = useState("");
  const [showModal, setShowModal] = useState(false);

  const handleSelectService = (type) => {
    setService(type);
    setShowModal(true);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <Header onLogout={() => (window.location.href = "/")} />

        <main className="flex-1 p-6 sm:p-10">
          <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-10 max-w-4xl mx-auto">
            <h2 className="text-xl sm:text-2xl font-semibold mb-6">
              ประวัติผู้เข้ารับบริการ
            </h2>

            {/* Form */}
            <form className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input type="text" placeholder="ชื่อนามสกุลลูกค้า" className="border p-2 rounded w-full" />
                <input type="text" placeholder="เบอร์โทรศัพท์ลูกค้า" className="border p-2 rounded w-full" />
                <input type="text" placeholder="รหัสลูกค้า" className="border p-2 rounded w-full" />
                <input type="text" placeholder="บ้านเลขที่" className="border p-2 rounded w-full" />
                <input type="text" placeholder="หมู่บ้าน" className="border p-2 rounded w-full" />
                <input type="text" placeholder="ถนน" className="border p-2 rounded w-full" />
                <input type="text" placeholder="ตำบล" className="border p-2 rounded w-full" />
                <input type="text" placeholder="อำเภอ" className="border p-2 rounded w-full" />
                <input type="text" placeholder="จังหวัด" className="border p-2 rounded w-full" />
                <input type="text" placeholder="รหัสไปรษณีย์" className="border p-2 rounded w-full" />
                <input type="text" placeholder="ประเทศ" className="border p-2 rounded w-full" />
              </div>
            </form>

            {/* ปุ่มเลือกบริการ */}
            <div className="mt-6 flex flex-wrap gap-4">
              <button
                onClick={() => handleSelectService("เช่าที่จอด")}
                className="bg-[#FF4C1C] text-white px-6 py-2 rounded-lg hover:bg-[#ff5722] transition"
              >
                เช่าที่จอด
              </button>
              <button
                onClick={() => handleSelectService("บริการเพิ่มเติม")}
                className="bg-[#FF4BB1] text-white px-6 py-2 rounded-lg hover:bg-[#ff6ac1] transition"
              >
                บริการเพิ่มเติม
              </button>
              <button
                onClick={() => handleSelectService("จอด + บริการเพิ่มเติม")}
                className="bg-[#FF911C] text-white px-6 py-2 rounded-lg hover:bg-[#ffab4c] transition"
              >
                จอด + บริการเพิ่มเติม
              </button>
            </div>

            {/* Popup เฉพาะปุ่ม */}
            {showModal && (
              <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 relative">
                  <button
                    onClick={() => setShowModal(false)}
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
                  >
                    ✖
                  </button>
                  <div>
                    <h3 className="text-lg font-semibold mb-4">คุณเลือกบริการ: {service}</h3>
                    <p>รายละเอียดเพิ่มเติมจะแสดงที่นี่</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}
