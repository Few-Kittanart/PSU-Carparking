import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaCar, FaTools, FaFileAlt, FaCog } from "react-icons/fa";

export default function Sidebar() {
  const [openMenu, setOpenMenu] = useState({});
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState("");
  const [permissions, setPermissions] = useState([]);

  useEffect(() => {
    // ดึงข้อมูล user ที่เก็บอยู่ใน Local Storage
    const userString = localStorage.getItem("user");
    if (userString) {
      try {
        const user = JSON.parse(userString);
        setUserName(`${user.first_name} ${user.last_name}`);
        setUserRole(user.role.charAt(0).toUpperCase() + user.role.slice(1));
        setPermissions(user.permissions || []);
        
      } catch (error) {
        console.error("Failed to parse user data", error);
      }
    }
  }, []);

  const toggleMenu = (key) => {
    setOpenMenu((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const menuItems = [
    { label: "การใช้บริการ", icon: <FaCar />, path: "/service", permission: "การใช้บริการ" }, // <--- แก้ไขชื่อสิทธิ์
    {
      label: "การจัดการ",
      icon: <FaTools />,
      subMenu: [
        { label: "จัดการบริการ", path: "/manage", permission: "จัดการบริการ" }, // <--- แก้ไขชื่อสิทธิ์
        {
          label: "ลูกค้าสัมพันธ์",
          subMenu: [
            { label: "ลูกค้า", path: "/crm/customer", permission: "ลูกค้า" }, // <--- แก้ไขชื่อสิทธิ์
            { label: "รถลูกค้า", path: "/crm/car", permission: "รถลูกค้า" }, // <--- แก้ไขชื่อสิทธิ์
          ],
        },
      ],
    },
    { label: "แดชบอร์ด", icon: <FaTools />, path: "/dashboard", permission: "แดชบอร์ด" }, // <--- แก้ไขชื่อสิทธิ์
    {
      label: "รายงาน",
      icon: <FaFileAlt />,
      subMenu: [
        { label: "รายงานการบริการ", path: "/report", permission: "รายงานการบริการ" }, // <--- แก้ไขชื่อสิทธิ์
        { label: "รายงานรายได้", path: "/report/income", permission: "รายงานรายได้" }, // <--- แก้ไขชื่อสิทธิ์
      ],
    },
    {
      label: "ข้อมูลระบบ",
      icon: <FaCog />,
      subMenu: [
        { label: "ตั้งค่าระบบ", path: "/settings", permission: "ตั้งค่าระบบ" }, // <--- แก้ไขชื่อสิทธิ์
        { label: "ตั้งค่าราคา", path: "/system/prices", permission: "ตั้งค่าราคา" }, // <--- แก้ไขชื่อสิทธิ์
        { label: "ตั้งค่าเกี่ยวกับรถ", path: "/system/cars", permission: "ตั้งค่ารถ" }, // <--- แก้ไขชื่อสิทธิ์
        { label: "ตั้งค่าลานจอดรถ", path: "/system/parking", permission: "ตั้งค่าที่จอด" },
        { label: "จัดการพนักงาน", path: "/system/employees", permission: "ตั้งค่าพนักงาน" }, // <--- แก้ไขชื่อสิทธิ์
        { label: "ตั้งค่าแผนก", path: "/system/departments", permission: "ตั้งค่าแผนก" }, // <--- แก้ไขชื่อสิทธิ์
      ],
    },
  ];

  // ฟังก์ชันเช็คว่า user มี permission หรือไม่ (ใช้โค้ดเดิม)
  const hasPermission = (item) => {
    // ถ้าไม่มี permission หรือมี subMenu โดยที่ subMenu มีบางอันที่มี permission ก็จะแสดง
    if (!item.permission && !item.subMenu) return true; 
    
    // ตรวจสอบ permission ตรงๆ
    if (item.permission && permissions.includes(item.permission)) return true;
    
    // ถ้ามี subMenu ให้วนเช็คว่ามี subMenu ตัวใดตัวหนึ่งที่มีสิทธิ์หรือไม่
    if (item.subMenu) return item.subMenu.some(hasPermission); 
    
    return false;
  };

  const renderMenu = (items, level = 0) =>
    items
      .filter(hasPermission)
      .map((item, index) => (
        <div key={index}>
          {item.path ? (
            <Link
              to={item.path}
              className={`flex items-center px-3 py-2 rounded-lg hover:bg-orange-50 ${
                level > 0 ? "ml-4" : ""
              }`}
            >
              {item.icon && <span className="mr-3">{item.icon}</span>}
              {item.label}
            </Link>
          ) : (
            <div
              onClick={() => toggleMenu(item.label)}
              className={`flex items-center cursor-pointer px-3 py-2 rounded-lg hover:bg-orange-50 ${
                level > 0 ? "ml-4" : ""
              }`}
            >
              {item.icon && <span className="mr-3">{item.icon}</span>}
              {item.label}
              {/* ใช้ SVG หรือไอคอน Arrow ที่ชัดเจนกว่า '▾' และ '▸' ถ้าใช้ Tailwind CSS */}
              {item.subMenu && <span className="ml-auto transform transition-transform duration-200">{openMenu[item.label] ? "▾" : "▸"}</span>}
            </div>
          )}
          {item.subMenu && openMenu[item.label] && (
            <div className="ml-4 border-l border-gray-200 pl-3 mt-1 space-y-1">
              {renderMenu(item.subMenu, level + 1)}
            </div>
          )}
        </div>
      ));

  return (
    <aside className="w-64 bg-white border-r min-h-screen flex flex-col">
      <div className="px-4 py-6 border-b border-gray-200">
        {userName ? (
          <>
            <h1 className="text-xl font-bold text-[#ea7f33]">{userName}</h1>
            <p className="text-sm text-gray-600">ตำแหน่ง: {userRole}</p>
          </>
        ) : (
          <h1 className="text-xl font-bold text-[#ea7f33]">Car Parking ระบบจัดการ</h1>
        )}
      </div>
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">{renderMenu(menuItems)}</nav>
    </aside>
  );
}