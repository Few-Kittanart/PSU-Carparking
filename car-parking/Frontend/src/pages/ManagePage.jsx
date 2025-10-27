// src/pages/ManagePage.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import PrintIcon from "@mui/icons-material/Print"; 

import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "../lib/pdfFonts"; 

import { useSettings } from "../context/SettingContext"; 

pdfMake.fonts = pdfFonts;

export default function ManagePage() {
  const [unpaidServices, setUnpaidServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("allServices");
  const navigate = useNavigate();

  const { settings } = useSettings(); 
  const [serviceNameMap, setServiceNameMap] = useState({}); 

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        // API 1: ดึงรายการที่ยังไม่จ่าย
        const unpaidRes = await fetch(
          "http://localhost:5000/api/customers/unpaid-services",
          { headers }
        );
        if (!unpaidRes.ok) throw new Error("Failed to fetch unpaid data");
        const unpaidData = await unpaidRes.json();
        setUnpaidServices(unpaidData);

        // API 2: ดึงชื่อบริการ (จาก /api/prices)
        const pricesRes = await fetch("http://localhost:5000/api/prices", {
          headers,
        });
        if (pricesRes.ok) {
          const pricesData = await pricesRes.json();
          const map = {};
          pricesData.additionalServices.forEach((s) => {
            map[s.id] = s.name;
          });
          setServiceNameMap(map);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  // (โค้ด handlePrint ... เหมือนเดิมทุกประการ)
  const handlePrint = (service) => {
    if (!settings) {
      alert("ข้อมูล Setting (โลโก้/ชื่อบริษัท) ยังโหลดไม่เสร็จ โปรดรอสักครู่");
      return;
    }

    // --- สร้างรายการบริการ (Services List) ---
    const serviceItems = [];

    if (service.parking_slot) {
      serviceItems.push([
        { text: "ค่าบริการจอดรถ", style: "tableBody" },
        { text: `(ช่อง ${service.parking_slot})`, style: "tableBody" },
        { text: "-", style: "tableBody", alignment: "right" },
      ]);
    }

    service.services.forEach((serviceId) => {
      serviceItems.push([
        { text: "บริการเพิ่มเติม", style: "tableBody" },
        {
          text: `(${serviceNameMap[serviceId] || "ID: " + serviceId})`,
          style: "tableBody",
        },
        { text: "-", style: "tableBody", alignment: "right" },
      ]);
    });

    // --- โครงสร้างเอกสาร (Doc Definition) ของ pdfmake ---
    const docDefinition = {
      defaultStyle: {
        font: "Sarabun", 
        fontSize: 12,
      },
      content: [
        {
          columns: [
            settings.logo?.main
              ? {
                  image: settings.logo.main, 
                  width: 100,
                }
              : { text: "" },
            {
              text: [
                {
                  text: `${settings.companyName || "ชื่อบริษัท"}\n`,
                  style: "header",
                },
                {
                  text: `${settings.address?.number || ""} ${
                    settings.address?.street || ""
                  }\n`,
                  style: "subheader",
                },
                {
                  text: `${settings.address?.tambon || ""} ${
                    settings.address?.amphoe || ""
                  }\n`,
                  style: "subheader",
                },
                {
                  text: `${settings.address?.province || ""} ${
                    settings.address?.zipcode || ""
                  }\n`,
                  style: "subheader",
                },
                {
                  text: `โทร: ${settings.phoneNumber || "-"} `,
                  style: "subheader",
                },
                {
                  text: `เลขผู้เสียภาษี: ${settings.taxId || "-"}`,
                  style: "subheader",
                },
              ],
              alignment: "right",
            },
          ],
        },
        { canvas: [{ type: "line", x1: 0, y1: 10, x2: 515, y2: 10 }] },
        {
          text: "ใบแจ้งค่าบริการ (ชั่วคราว)",
          style: "title",
          alignment: "center",
          margin: [0, 15, 0, 10],
        },
        {
          text: [
            { text: "ลูกค้า: ", bold: true },
            `${service.customer_name}\n`,
            { text: "เบอร์โทร: ", bold: true },
            `${service.phone_number}\n`,
            { text: "ทะเบียนรถ: ", bold: true },
            `${service.car_registration}\n`,
            { text: "เวลาเข้า: ", bold: true },
            `${dayjs(service.entry_time).format("DD/MM/YYYY HH:mm น.")}`,
          ],
          margin: [0, 0, 0, 10],
        },
        {
          table: {
            headerRows: 1,
            widths: ["30%", "40%", "30%"], 
            body: [
              [
                { text: "รายการ", style: "tableHeader", alignment: "left" },
                { text: "รายละเอียด", style: "tableHeader", alignment: "left" },
                { text: "ราคารวม", style: "tableHeader", alignment: "right" },
              ],
              ...serviceItems,
            ],
          },
          layout: "lightHorizontalLines", 
        },
        {
          canvas: [
            {
              type: "line",
              x1: 0,
              y1: 5,
              x2: 515,
              y2: 5,
              lineWidth: 0.5,
              lineColor: "#cccccc",
            },
          ],
          margin: [0, 10, 0, 0],
        },
        {
          table: {
            widths: ["*", "auto"],
            body: [
              [
                {
                  text: "ยอดรวมทั้งสิ้น",
                  style: "totalText",
                  alignment: "right",
                },
                {
                  text: `${service.total_price.toFixed(2)} บาท`,
                  style: "totalAmount",
                  alignment: "right",
                },
              ],
              [
                { text: "สถานะ", style: "totalText", alignment: "right" },
                {
                  text: "ยังไม่ชำระ",
                  style: "totalAmount",
                  color: "red",
                  alignment: "right",
                },
              ],
            ],
          },
          layout: "noBorders",
          margin: [0, 10, 0, 0],
        },
      ],
      styles: {
        header: {
          fontSize: 16,
          bold: true,
        },
        subheader: {
          fontSize: 10,
          color: "gray",
        },
        title: {
          fontSize: 18,
          bold: true,
        },
        tableHeader: {
          bold: true,
          fontSize: 13,
          color: "black",
        },
        tableBody: {
          fontSize: 12,
        },
        totalText: {
          fontSize: 12,
          bold: true,
          margin: [0, 2, 0, 2],
        },
        totalAmount: {
          fontSize: 14,
          bold: true,
          margin: [0, 2, 0, 2],
        },
      },
    };

    pdfMake.createPdf(docDefinition).open();
  };


  if (loading)
    return (
      <div className="p-6 text-center text-lg font-semibold">
        กำลังโหลดข้อมูล...
      </div>
    );

  if (error)
    return (
      <div className="p-6 text-center text-lg font-semibold text-red-500">
        เกิดข้อผิดพลาด: {error}
      </div>
    );

  // Filter tabs
  const parkingOnly = unpaidServices.filter(
    (s) => s.parking_slot && s.services.length === 0
  );
  const additionalOnly = unpaidServices.filter(
    (s) => !s.parking_slot && s.services.length > 0
  );
  const parkingAndAdditional = unpaidServices.filter(
    (s) => s.parking_slot && s.services.length > 0
  );

  const renderTable = (data) => (
    <TableContainer component={Paper} className="shadow-lg">
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            {/* --- 1. เปลี่ยนหัวตาราง --- */}
            <TableCell className="font-bold text-lg text-gray-700" align="center">
              ลำดับ
            </TableCell>
            <TableCell className="font-bold text-lg text-gray-700">
              ชื่อ-นามสกุล
            </TableCell>
            <TableCell className="font-bold text-lg text-gray-700">
              เบอร์โทรศัพท์
            </TableCell>
            <TableCell className="font-bold text-lg text-gray-700">
              ทะเบียนรถ
            </TableCell>
            <TableCell className="font-bold text-lg text-gray-700">
              เวลาเข้า
            </TableCell>
            <TableCell className="font-bold text-lg text-gray-700 text-center">
              ประเภทบริการ
            </TableCell>
            <TableCell className="font-bold text-lg text-gray-700">
              ยอดรวม
            </TableCell>
            <TableCell className="font-bold text-lg text-gray-700">
              ดำเนินการ
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.length > 0 ? (
            // 'index' ถูกส่งมาจาก .map() อยู่แล้ว
            data.map((service, index) => {
              const hasParking = !!service.parking_slot;
              const hasServices = service.services.length > 0;
              let serviceType, bgColor;

              if (hasParking && hasServices) {
                serviceType = `${service.parking_slot} + บริการเพิ่มเติม`;
                bgColor = "bg-purple-500";
              } else if (hasParking) {
                serviceType = service.parking_slot;
                bgColor = "bg-orange-400";
              } else if (hasServices) {
                serviceType = "บริการเพิ่มเติม";
                bgColor = "bg-green-500";
              } else {
                serviceType = "ไม่ระบุ";
                bgColor = "bg-gray-400";
              }

              return (
                <TableRow key={service.service_id}>
                  {/* --- 2. เปลี่ยนข้อมูลในเซลล์ --- */}
                  <TableCell align="center">{index + 1}</TableCell>
                  <TableCell>{service.customer_name}</TableCell>
                  <TableCell>{service.phone_number}</TableCell>
                  <TableCell>{service.car_registration}</TableCell>
                  <TableCell>
                    {dayjs(service.entry_time).format("DD/MM/YYYY HH:mm")}
                  </TableCell>
                  <TableCell>
                    <div
                      className={`text-center py-2 px-3 rounded-full text-white font-semibold ${bgColor}`}
                    >
                      {serviceType}
                    </div>
                  </TableCell>
                  <TableCell>{service.total_price.toFixed(2)} บาท</TableCell>
                  <TableCell>
                    <Tooltip title="ดูรายละเอียด">
                      <IconButton
                        onClick={() => {
                          navigate(
                            `/manage/detail/${service.customer_id}/${service.car_id}/${service.service_id}`
                          );
                        }}
                      >
                        <SearchIcon />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="พิมพ์สลิป">
                      <IconButton onClick={() => handlePrint(service)}>
                        <PrintIcon color="primary" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              {/* (ปรับ colSpan ให้ตรงกับจำนวนคอลัมน์ใหม่) */}
              <TableCell colSpan={8} align="center">
                ไม่มีรายการประเภทนี้ในขณะนี้
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <div className="p-6 sm:p-10 space-y-8">
      <h2 className="text-3xl font-bold text-[#ea7f33]">จัดการบริการ</h2>

      <div className="flex flex-wrap gap-4 text-sm font-medium ">
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded-full bg-orange-400"></span>
          <span>เช่าที่จอด</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded-full bg-green-500"></span>
          <span>บริการเพิ่มเติม</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded-full bg-purple-500"></span>
          <span>ทั้งสองอย่าง</span>
        </div>
      </div>

      <div className="flex gap-4 border-b border-gray-300">
        <button
          onClick={() => setActiveTab("allServices")}
          className={`py-3 px-6 font-semibold transition-colors ${
            activeTab === "allServices"
              ? "text-[#ea7f33] border-b-2 border-[#ea7f33]"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          ทั้งหมด
        </button>
        <button
          onClick={() => setActiveTab("parkingAndAdditional")}
          className={`py-3 px-6 font-semibold transition-colors ${
            activeTab === "parkingAndAdditional"
              ? "text-[#ea7f33] border-b-2 border-[#ea7f33]"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          เช่าที่จอด + บริการเพิ่มเติม
        </button>
        <button
          onClick={() => setActiveTab("parkingOnly")}
          className={`py-3 px-6 font-semibold transition-colors ${
            activeTab === "parkingOnly"
              ? "text-[#ea7f33] border-b-2 border-[#ea7f33]"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          เฉพาะเช่าที่จอด
        </button>
        <button
          onClick={() => setActiveTab("additionalOnly")}
          className={`py-3 px-6 font-semibold transition-colors ${
            activeTab === "additionalOnly"
              ? "text-[#ea7f33] border-b-2 border-[#ea7f33]"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          เฉพาะบริการเพิ่มเติม
        </button>
      </div>

      {activeTab === "allServices" && renderTable(unpaidServices)}
      {activeTab === "parkingAndAdditional" &&
        renderTable(parkingAndAdditional)}
      {activeTab === "parkingOnly" && renderTable(parkingOnly)}
      {activeTab === "additionalOnly" && renderTable(additionalOnly)}
    </div>
  );
}