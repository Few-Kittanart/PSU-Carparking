import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // import useNavigate
import axios from "axios";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate(); // สร้าง navigate

  // ข้อมูล test account
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        {
          username,
          password,
        }
      );

      // ตัวอย่างการเรียกใช้งานใน Login.jsx
      const { token, user } = response.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      alert("ล็อกอินสำเร็จ!");
      navigate("/main"); // เปลี่ยนหน้า
    } catch (error) {
      console.error(error);
      alert("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-white px-4">
      {/* กล่อง login */}
      <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8 w-full max-w-[450px]">
        {/* หัวข้อ */}
        <div className="text-center mb-8">
          <h1 className="text-[1.8rem] sm:text-[2rem] md:text-[2.2rem] font-bold text-[#ea7f33] mb-2 tracking-tight leading-tight">
            Car Parking
          </h1>
          <p className="text-gray-600 text-[0.95rem] sm:text-base">
            เข้าสู่ระบบ
          </p>
        </div>

        {/* ฟอร์ม */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="ชื่อผู้ใช้"
              required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-[0.95rem] sm:text-base placeholder-gray-400 focus:outline-none focus:border-[#e79316] transition"
            />
          </div>

          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="รหัสผ่าน"
              required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-[0.95rem] sm:text-base placeholder-gray-400 focus:outline-none focus:border-[#e79316] transition"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-lg bg-[#e79316] text-white font-semibold text-[0.95rem] sm:text-base shadow-md hover:bg-[#eb9c25] transition-transform transform hover:-translate-y-0.5"
          >
            เข้าสู่ระบบ
          </button>
        </form>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-[0.8rem] sm:text-[0.85rem] text-gray-400 font-medium mb-2">
            พัฒนาระบบโดย
          </p>
          <a
            href="https://iarc.psu.ac.th/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[0.7rem] sm:text-[0.75rem] text-gray-500 leading-relaxed mb-3 hover:text-blue-600 transition"
          >
            ศูนย์วิจัยระบบอัตโนมัติอัจฉริยะ <br />
            คณะวิศวกรรมศาสตร์ มหาวิทยาลัยสงขลานครินทร์
          </a>
          <p className="text-[0.7rem] sm:text-[0.75rem] text-gray-400">
            © 2022 E-Maintenance Version 0.2.2.3 beta
          </p>
        </div>
      </div>
    </div>
  );
}
