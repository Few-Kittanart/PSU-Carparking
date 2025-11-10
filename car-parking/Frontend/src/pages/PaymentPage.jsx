import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import {
  Button,
  CircularProgress,
  Paper,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  FormLabel,
  Box,
  Stack,
  Divider,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useSettings } from "../context/SettingContext";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "../lib/pdfFonts";

pdfMake.fonts = pdfFonts;


export default function PaymentPage() {
  const { customerId, carId, serviceId } = useParams();
  const navigate = useNavigate();

  const [serviceDetail, setServiceDetail] = useState(null);
  const [serviceList, setServiceList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("cash");

  const { settings, loading: settingsLoading } = useSettings();

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        const [detailRes, serviceListRes] = await Promise.all([
          fetch(
            `http://localhost:5000/api/customers/${customerId}/cars/${carId}/services/${serviceId}`,
            { headers }
          ),
          fetch("http://localhost:5000/api/prices", { headers })
        ]);

        if (!detailRes.ok) throw new Error("ไม่พบข้อมูลบริการ");
        const data = await detailRes.json();
        setServiceDetail(data);

        if (serviceListRes.ok) {
          const serviceListData = await serviceListRes.json();
          setServiceList(serviceListData.additionalServices || []);
        }

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, [customerId, carId, serviceId]);

  const handleGenerateReceipt = (paidServiceHistory, methodUsed) => {
    if (!settings) {
      console.error("Settings not loaded yet for receipt generation.");
      return;
    }

    const serviceItems = [];
    if (paidServiceHistory.parking_slot) {
      serviceItems.push([
        { text: "ค่าบริการจอดรถ", style: "tableBody" },
        { text: `(ช่อง ${paidServiceHistory.parking_slot})`, style: "tableBody" }, // อาจจะต้องแปล ID ช่องจอดถ้าต้องการ
        { text: `${(paidServiceHistory.parking_price || 0).toFixed(2)}`, style: "tableBody", alignment: "right" },
      ]);
    }
    paidServiceHistory.services.forEach((serviceId) => {
      const serviceInfo = serviceList.find(s => s.id === serviceId);
      serviceItems.push([
        { text: "บริการเพิ่มเติม", style: "tableBody" },
        {
          text: `(${serviceInfo?.name || "ID: " + serviceId})`,
          style: "tableBody",
        },
        { text: `${(serviceInfo?.price || 0).toFixed(2)}`, style: "tableBody", alignment: "right" }, // แสดงราคาย่อย
      ]);
    });
     if (paidServiceHistory.parking_slot && paidServiceHistory.services.length > 0) {
        serviceItems.push(['\u00A0', '\u00A0', '\u00A0']); // แถวว่าง
    }

    const docDefinition = {
      defaultStyle: { font: "Sarabun", fontSize: 12 },
      content: [
        // --- ส่วนหัว (โลโก้ + บริษัท) ---
        {
          columns: [
            settings.logo?.main ? { image: settings.logo.main, width: 100 } : { text: "" },
            {
              text: [
                { text: `${settings.companyName || "ชื่อบริษัท"}\n`, style: "header" },
                { text: `${settings.address?.number || ""} ${settings.address?.street || ""}\n`, style: "subheader" },
                { text: `${settings.address?.tambon || ""} ${settings.address?.amphoe || ""}\n`, style: "subheader" },
                { text: `${settings.address?.province || ""} ${settings.address?.zipcode || ""}\n`, style: "subheader" },
                { text: `โทร: ${settings.phoneNumber || "-"} `, style: "subheader" },
                { text: `เลขผู้เสียภาษี: ${settings.taxId || "-"}`, style: "subheader" },
              ],
              alignment: "right",
            },
          ],
        },
        { canvas: [{ type: "line", x1: 0, y1: 10, x2: 515, y2: 10 }] },
        // --- หัวเรื่อง: ใบเสร็จ ---
        { text: "ใบเสร็จรับเงิน", style: "title", alignment: "center", margin: [0, 15, 0, 10] },
        // --- ข้อมูลลูกค้า ---
        {
          columns: [
            {
               width: '*',
               text: [
                { text: "ลูกค้า: ", bold: true }, `${customer.customer_name}\n`,
                { text: "เบอร์โทร: ", bold: true }, `${customer.phone_number}\n`,
                { text: "ทะเบียนรถ: ", bold: true }, `${car.car_registration}`,
              ]
            },
            {
              width: 'auto',
              alignment: 'right',
              text: [
                  // เพิ่มวันที่ชำระเงิน
                  { text: "วันที่ชำระเงิน: ", bold: true }, `${dayjs().format("DD/MM/YYYY HH:mm น.")}\n`,
                  { text: "เวลาเข้า: ", bold: true }, `${dayjs(paidServiceHistory.entry_time).format("DD/MM/YYYY HH:mm น.")}\n`,
                  { text: "เวลาออก: ", bold: true }, `${dayjs(paidServiceHistory.exit_time || new Date()).format("DD/MM/YYYY HH:mm น.")}`, // ใช้เวลาปัจจุบันถ้า exit_time ไม่มี
              ]
            }
          ],
          margin: [0, 0, 0, 10],
        },
        // --- ตารางรายการ ---
        {
          table: {
            headerRows: 1,
            widths: ["30%", "40%", "30%"],
            body: [
              [
                { text: "รายการ", style: "tableHeader", alignment: "left" },
                { text: "รายละเอียด", style: "tableHeader", alignment: "left" },
                { text: "ราคา (บาท)", style: "tableHeader", alignment: "right" },
              ],
              ...serviceItems, // ใช้ serviceItems ที่สร้างไว้
            ],
          },
          layout: "lightHorizontalLines",
        },
        { canvas: [{ type: "line", x1: 0, y1: 5, x2: 515, y2: 5, lineWidth: 0.5, lineColor: '#cccccc' }], margin: [0, 10, 0, 0] },
        // --- สรุปยอด ---
        {
          table: {
            widths: ["*", "auto"],
            body: [
              // ยอดรวม
              [
                { text: "ยอดรวมทั้งสิ้น", style: "totalText", alignment: "right" },
                { text: `${(paidServiceHistory.total_price || 0).toFixed(2)} บาท`, style: "totalAmount", alignment: "right" },
              ],
              // วิธีชำระเงิน
              [
                { text: "วิธีชำระเงิน", style: "totalText", alignment: "right" },
                { text: methodUsed === 'cash' ? 'เงินสด' : 'สแกนจ่าย', style: "totalAmount", alignment: "right" },
              ],
              // สถานะ
              [
                { text: "สถานะ", style: "totalText", alignment: "right" },
                { text: "ชำระแล้ว", style: "totalAmount", color: "green", alignment: "right" },
              ],
            ],
          },
          layout: "noBorders",
          margin: [0, 10, 0, 0],
        },
      ],
      styles: {
        header: { fontSize: 16, bold: true },
        subheader: { fontSize: 10, color: "gray" },
        title: { fontSize: 18, bold: true },
        tableHeader: { bold: true, fontSize: 13, color: "black" },
        tableBody: { fontSize: 12 },
        totalText: { fontSize: 12, bold: true, margin: [0, 2, 0, 2] },
        totalAmount: { fontSize: 14, bold: true, margin: [0, 2, 0, 2] },
      },
    };
    pdfMake.createPdf(docDefinition).open();
  };

  const handlePay = async () => {
    try {
      const token = localStorage.getItem("token");
      const payload = { paymentMethod: paymentMethod };

      const res = await fetch(
        `http://localhost:5000/api/customers/${customerId}/cars/${carId}/services/${serviceId}/pay`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
         const errorData = await res.json();
         throw new Error(errorData.error || "ชำระเงินไม่สำเร็จ");
      }

      const updatedServiceData = await res.json();

      handleGenerateReceipt(updatedServiceData.service, paymentMethod);

      alert("ชำระเงินเรียบร้อยแล้ว!");

      setTimeout(() => {
        navigate("/manage");
      }, 1500);

    } catch (err) {
      alert("เกิดข้อผิดพลาด: " + err.message);
    }
  };


  if (loading || settingsLoading)
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}><CircularProgress /></Box>
    );

  if (error)
    return (
      <Typography color="error" sx={{ p: 6, textAlign: 'center' }}>เกิดข้อผิดพลาด: {error}</Typography>
    );

  if (!serviceDetail) return <Typography sx={{ p: 6, textAlign: 'center' }}>ไม่พบข้อมูลบริการ</Typography>;

  const { customer, car, serviceHistory } = serviceDetail;
  const getServiceNames = (serviceIds) => serviceIds.map((id) => serviceList.find((s) => s.id === id)?.name).filter(Boolean);

  let qrCodeToShow = null;
  if (settings?.bank1?.show && settings.bank1.showQrCode && settings.bank1.qrCodeImage) {
      qrCodeToShow = settings.bank1.qrCodeImage;
  } else if (settings?.bank2?.show && settings.bank2.qrCodeImage) {
      qrCodeToShow = settings.bank2.qrCodeImage;
  }


  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: "bold", color: "#ea7f33" }}>
          หน้าชำระเงิน
        </Typography>
        <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>
          กลับ
        </Button>
      </Stack>

      <Stack spacing={4}>
        {/* Paper ข้อมูลลูกค้า */}
        <Paper className="p-6 rounded-lg" elevation={3}>
          <Typography variant="h6" className="mb-2 text-[#ea7f33]">
            ข้อมูลลูกค้า
          </Typography>
          <Typography> <strong>ชื่อ-นามสกุล:</strong> {customer.customer_name} </Typography>
          <Typography> <strong>เบอร์โทรศัพท์:</strong> {customer.phone_number} </Typography>
          <Typography> <strong>รถ:</strong> {car.brand_car} / {car.car_registration} </Typography>
        </Paper>

        {/* Paper บริการที่ต้องชำระ */}
        {serviceHistory ? (
          <Paper className="p-6 rounded-lg" elevation={3}>
            <Typography variant="h6" className="mb-2 text-[#ea7f33]">
              บริการที่ต้องชำระ
            </Typography>

            {/* ส่วนแสดงรายละเอียดบริการ */}
            {serviceHistory.parking_slot && (
              <>
                <Typography> <strong>ช่องจอด:</strong> {serviceHistory.parking_slot} </Typography>
                <Typography> <strong>วันเวลาเข้า:</strong>{" "} {dayjs(serviceHistory.entry_time).format("DD/MM/YYYY HH:mm")} </Typography>
                {serviceHistory.exit_time && ( <Typography> <strong>วันเวลาออก:</strong>{" "} {dayjs(serviceHistory.exit_time).format("DD/MM/YYYY HH:mm")} </Typography> )}
                <Typography> <strong>ราคาค่าจอด:</strong>{" "} {serviceHistory.parking_price?.toFixed(2) || "0.00"} บาท </Typography>
              </>
            )}
            {serviceHistory.services?.length > 0 && (
              <>
                <Typography className="mt-2 font-semibold"> บริการเพิ่มเติม: </Typography>
                <ul className="list-disc pl-5"> {getServiceNames(serviceHistory.services).map((name, i) => ( <li key={i}>{name}</li> ))} </ul>
                <Typography> <strong>ราคาบริการเสริม:</strong>{" "} {serviceHistory.additional_price?.toFixed(2) || "0.00"} บาท </Typography>
              </>
            )}
            {/* สิ้นสุดส่วนแสดงรายละเอียด */}

            <Divider sx={{ my: 2 }} />

            <Typography className="mt-4 text-2xl font-bold text-[#ea7f33]">
              ยอดรวม: {serviceHistory.total_price?.toFixed(2) || "0.00"} บาท
            </Typography>

            {/* ส่วนเลือกวิธีชำระเงิน */}
            <FormControl component="fieldset" sx={{ mt: 3 }}>
              <FormLabel component="legend">เลือกวิธีชำระเงิน</FormLabel>
              <RadioGroup row value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} >
                <FormControlLabel value="cash" control={<Radio />} label="เงินสด" />
                <FormControlLabel value="qr" control={<Radio />} label="สแกนจ่าย" />
              </RadioGroup>
            </FormControl>

            {/* ส่วนแสดง QR Code */}
            {paymentMethod === 'qr' && (
              <Box sx={{ mt: 2, p: 2, border: '1px dashed grey', borderRadius: 2, textAlign: 'center' }}>
                {qrCodeToShow ? (
                  <>
                    <Typography sx={{ mb: 1 }}>สแกน QR Code เพื่อชำระเงิน:</Typography>
                    <img src={qrCodeToShow} alt="Payment QR Code" style={{ maxWidth: '200px', maxHeight: '200px', margin: 'auto', display: 'block', borderRadius: '4px' }} />
                    {settings?.bank1?.show && settings.bank1.showQrCode && settings.bank1.qrCodeImage === qrCodeToShow && (
                       <Typography variant="caption" display="block" sx={{mt: 1, color: 'text.secondary'}}> {settings.bank1.accountName} ({settings.bank1.bankName}) - {settings.bank1.accountNumber} </Typography>
                    )}
                     {settings?.bank2?.show && settings.bank2.qrCodeImage === qrCodeToShow && (
                       <Typography variant="caption" display="block" sx={{mt: 1, color: 'text.secondary'}}> {settings.bank2.accountName} ({settings.bank2.bankName}) - {settings.bank2.accountNumber} </Typography>
                    )}
                  </>
                ) : ( <Typography color="error"> ยังไม่ได้ตั้งค่ารูป QR Code หรือไม่ได้เปิดใช้งานในหน้าตั้งค่า </Typography> )}
              </Box>
            )}

            {/* ปุ่มยืนยันการชำระเงิน */}
            <Button
              variant="contained"
              startIcon={<CheckCircleIcon />}
              onClick={handlePay}
              disabled={serviceHistory.is_paid}
              sx={{ mt: 3, bgcolor: "#4CAF50", "&:hover": { bgcolor: "#45a049" }, px: 6, py: 1.5, display: "block" }}
            >
              {serviceHistory.is_paid ? "ชำระเงินแล้ว" : "ยืนยันการชำระเงิน"}
            </Button>
          </Paper>
        ) : (
          <div className="p-6 text-center text-lg font-semibold text-gray-700">
            เกิดข้อผิดพลาด: ไม่พบข้อมูล Service History
          </div>
        )}
      </Stack>
    </Box>
  );
}