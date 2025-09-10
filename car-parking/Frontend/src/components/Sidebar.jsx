import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaCar, FaTools, FaChartLine, FaFileAlt, FaCog } from "react-icons/fa";

export default function Sidebar() {
  const [openMenu, setOpenMenu] = useState({});

  const toggleMenu = (key) => {
    setOpenMenu((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // ✅ แก้ไขเมนูให้ตรงกับหน้าเว็บที่สร้างไว้
  const menuItems = [
    { label: "การใช้บริการ", icon: <FaCar />, path: "/service" },
    {
      label: "การจัดการ",
      icon: <FaTools />,
      subMenu: [
        {
          label: "จัดการบริการ", // ✅ แก้ไขชื่อเมนู
          path: "/manage",
        },
        {
          label: "ลูกค้าสัมพันธ์",
          subMenu: [
            { label: "ลูกค้า", path: "/crm/customer" },
            { label: "รถลูกค้า", path: "/crm/car" },
          ],
        },
      ],
    },
    { label: "แดชบอร์ด", icon: <FaChartLine />, path: "/dashboard" },
    {
      label: "รายงาน",
      icon: <FaFileAlt />,
      subMenu: [
        {
          label: "รายงานการบริการ",
          path: "/report",
        },
        {
          label: "รายงานรายได้", // ✅ เพิ่มเมนูนี้
          path: "/report/income", // ✅ เพิ่ม path ให้ตรงกับ IncomeReportPage
        },
      ],
    },
    {
      label: "ข้อมูลระบบ",
      icon: <FaCog />,
      subMenu: [
        { label: "ตั้งค่าระบบ", path: "/system/settings" },
        { label: "ตั้งค่าราคา", path: "/system/prices" },
        { label: "ตั้งค่าเกี่ยวกับรถ", path: "/system/cars" },
        { label: "ตั้งค่าลานจอดรถ", path: "/system/parking-lots" },
        { label: "ตั้งค่าผู้ใช้", path: "/system/users" },
        { label: "ตั้งค่าแผนก", path: "/system/departments" },
      ],
    },
  ];

  const renderMenu = (items, level = 0) =>
    items.map((item, index) => (
      <div key={index} className="mt-1">
        {item.path ? (
          <Link
            to={item.path}
            className="flex items-center cursor-pointer px-3 py-2 rounded-lg transition-colors hover:bg-orange-100"
          >
            <span className="mr-3 text-gray-600">{item.icon}</span>
            <span
              className={`font-medium text-gray-700 text-sm ${
                level > 0 ? "ml-2" : ""
              }`}
            >
              {item.label}
            </span>
          </Link>
        ) : (
          <div
            onClick={() => item.subMenu && toggleMenu(item.label)}
            className="flex items-center cursor-pointer px-3 py-2 rounded-lg transition-colors hover:bg-orange-50"
          >
            <span className="mr-3 text-gray-600">{item.icon}</span>
            <span
              className={`font-medium text-gray-700 text-sm ${
                level > 0 ? "ml-2" : ""
              }`}
            >
              {item.label}
            </span>
            {item.subMenu && (
              <span className="ml-auto text-gray-500 text-xs">
                {openMenu[item.label] ? "▾" : "▸"}
              </span>
            )}
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
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col">
      {/* Header */}
      <div className="px-4 py-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-orange-500 tracking-tight">
          Car Parking
        </h1>
        <p className="text-xs text-gray-500">ระบบจัดการ</p>
      </div>

      {/* Menu */}
      <nav className="flex-1 overflow-y-auto px-2 py-4">
        {renderMenu(menuItems)}
      </nav>
    </aside>
  );
}
