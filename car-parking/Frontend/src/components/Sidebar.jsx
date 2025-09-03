import React, { useState } from "react";
import { FaCar, FaTools, FaChartLine, FaFileAlt, FaCog, FaUser, FaCarSide } from "react-icons/fa";

export default function Sidebar() {
  const [openMenu, setOpenMenu] = useState({});

  const toggleMenu = (key) => {
    setOpenMenu((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const menuItems = [
    { label: "การใช้บริการ", icon: <FaCar />, path: "/service" },
    {
      label: "การจัดการ",
      icon: <FaTools />,
      subMenu: [
        {
          label: "การจัดการรถ",
          subMenu: [
            { label: "เช่าที่จอด", path: "/manage/parking" },
            { label: "บริการเพิ่มเติม", path: "/manage/additional" },
            { label: "เช่าที่จอด + บริการเพิ่มเติม", path: "/manage/parking-additional" },
          ],
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
        { label: "รายการรถใช้บริการ", path: "/report/service-list" },
        { label: "รายได้", path: "/report/income" },
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
      <div key={index} className={`ml-${level * 4} mt-1`}>
        <div
          onClick={() => item.subMenu && toggleMenu(item.label)}
          className="flex items-center cursor-pointer p-2 hover:bg-gray-200 rounded-md"
        >
          <span className="mr-2">{item.icon}</span>
          <span className="font-medium">{item.label}</span>
          {item.subMenu && (
            <span className="ml-auto">{openMenu[item.label] ? "▾" : "▸"}</span>
          )}
        </div>
        {item.subMenu && openMenu[item.label] && (
          <div className="ml-4">{renderMenu(item.subMenu, level + 1)}</div>
        )}
      </div>
    ));

  return (
    <aside className="w-64 bg-white border-r border-gray-200 p-4 min-h-screen">
      {renderMenu(menuItems)}
    </aside>
  );
}
