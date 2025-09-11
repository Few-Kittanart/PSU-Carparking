import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaCar, FaTools, FaChartLine, FaFileAlt, FaCog } from "react-icons/fa";

export default function Sidebar() {
  const [openMenu, setOpenMenu] = useState({});
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    const userString = localStorage.getItem("user");
    if (userString) {
      try {
        const user = JSON.parse(userString);
        setUserName(`${user.first_name} ${user.last_name}`);
        // แปลงตัวอักษรตัวแรกให้เป็นพิมพ์ใหญ่
        setUserRole(user.role.charAt(0).toUpperCase() + user.role.slice(1));
      } catch (error) {
        console.error("Failed to parse user data from localStorage", error);
      }
    }
  }, []);

  const toggleMenu = (key) => {
    setOpenMenu((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const menuItems = [
    { label: "การใช้บริการ", icon: <FaCar />, path: "/service" },
    {
      label: "การจัดการ",
      icon: <FaTools />,
      subMenu: [
        { label: "จัดการบริการ", path: "/manage" },
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
        { label: "รายงานการบริการ", path: "/report" },
        { label: "รายงานรายได้", path: "/report/income" },
      ],
    },
    {
      label: "ข้อมูลระบบ",
      icon: <FaCog />,
      path: "/settings",
    },
  ];

  const renderMenu = (items, level) =>
    items.map((item, index) => (
      <div key={index}>
        {item.path ? (
          <Link to={item.path} className="flex items-center px-3 py-2 rounded-lg transition-colors hover:bg-orange-50">
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
        {userName ? (
          <>
            <h1 className="text-xl sm:text-2xl font-bold text-[#ea7f33] mb-1">
              {userName}
            </h1>
            <p className="text-sm font-medium text-gray-600">
              ตำแหน่ง: {userRole}
            </p>
          </>
        ) : (
          <h1 className="text-xl sm:text-2xl font-bold text-[#ea7f33]">
            Car Parking ระบบจัดการ
          </h1>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {renderMenu(menuItems, 0)}
      </nav>
    </aside>
  );
}