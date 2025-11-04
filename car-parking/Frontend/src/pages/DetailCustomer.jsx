import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  IconButton,
  Button,
  Paper,
  Typography,
  Box,
  Grid,
  Stack,
  TextField,
  CircularProgress,
  Alert,
  Snackbar,
  Divider,
  Autocomplete, // ◀️ (1) Import Autocomplete
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import InfoIcon from "@mui/icons-material/Info";
import PrintIcon from "@mui/icons-material/Print";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import axios from "axios";

// ◀️ (2) Import ข้อมูลที่อยู่ (เหมือน ServicePage)
import provincesData from "../mockupdataadress/provinces.json";
import districtsData from "../mockupdataadress/districts.json";
import subDistrictsData from "../mockupdataadress/sub_districts.json";

// (Component ย่อยสำหรับแสดง Key-Value)
const DetailItem = ({ label, value }) => (
  <Grid item xs={12} sm={6}>
    <Typography color="text.secondary" variant="body2">
      {label}
    </Typography>
    <Typography
      variant="body1"
      sx={{ fontWeight: 500, wordBreak: "break-word" }}
    >
      {value || "-"}
    </Typography>
  </Grid>
);

export default function DetailCustomer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [serviceHistories, setServiceHistories] = useState([]);

  // (State สำหรับโหมดแก้ไข)
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [saveLoading, setSaveLoading] = useState(false);
  const [alert, setAlert] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // ◀️ (3) เพิ่ม State สำหรับ List ที่อยู่ (เหมือน ServicePage)
  const [provinceList, setProvinceList] = useState([]);
  const [amphoeList, setAmphoeList] = useState([]);
  const [districtList, setDistrictList] = useState([]); // (ตำบล)

  // (useEffect ดึงข้อมูลลูกค้า)
  useEffect(() => {
    // ◀️ (4) สร้าง List จังหวัดหลักทันทีที่โหลด
    const provincesWithAmphoe = provincesData.map((p) => ({
      ...p,
      amphure: districtsData
        .filter((d) => d.province_id === p.id)
        .map((d) => ({
          ...d,
          tambon: subDistrictsData.filter((s) => s.district_id === d.id),
        })),
    }));
    setProvinceList(provincesWithAmphoe);

    const fetchCustomer = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const res = await fetch(
          `http://localhost:5000/api/customers/${id}/service-history`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!res.ok) {
          throw new Error("ไม่พบข้อมูลลูกค้า");
        }

        const data = await res.json();
        setCustomer(data.customer);
        setServiceHistories(data.serviceHistories || []);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomer();
  }, [id]);

  // ◀️ (5) เพิ่ม useEffects สำหรับจัดการ Dropdown (เหมือน ServicePage)
  // (เมื่อเลือกจังหวัด -> อัปเดตอำเภอ)
  useEffect(() => {
    if (formData.province) {
      setAmphoeList(formData.province.amphure);
    } else {
      setAmphoeList([]);
    }
    setDistrictList([]);
  }, [formData.province]);

  // (เมื่อเลือกอำเภอ -> อัปเดตตำบล)
  useEffect(() => {
    if (formData.amphoe) {
      setDistrictList(formData.amphoe.tambon);
    } else {
      setDistrictList([]);
    }
  }, [formData.amphoe]);

  // (เมื่อเลือกตำบล -> อัปเดต Zipcode)
  useEffect(() => {
    if (formData.district) {
      setFormData((old) => ({ ...old, zip_code: formData.district.zip_code }));
    }
  }, [formData.district]);

  // ◀️ (6) แก้ไข handleEditToggle ให้ "ค้นหา" Object ที่อยู่
  const handleEditToggle = () => {
    if (!isEditing) {
      // (ถ้ากด "แก้ไข") ค้นหา Object จังหวัด/อำเภอ/ตำบล จากชื่อ (Text)
      const foundProvince =
        provinceList.find((p) => p.name_th === customer.province) || null;

      const amList = foundProvince ? foundProvince.amphure : [];
      setAmphoeList(amList); // (ตั้งค่า List อำเภอให้พร้อม)

      const foundAmphoe =
        amList.find((a) => a.name_th === customer.district) || null; // (customer.district คือ อำเภอ)

      const distList = foundAmphoe ? foundAmphoe.tambon : [];
      setDistrictList(distList); // (ตั้งค่า List ตำบลให้พร้อม)

      const foundDistrict =
        distList.find((t) => t.name_th === customer.canton) || null; // (customer.canton คือ ตำบล)

      // (ตั้งค่า formData เริ่มต้น)
      setFormData({
        customer_name: customer.customer_name,
        phone_number: customer.phone_number,
        house_number: customer.house_number || "",
        village: customer.village || "",
        road: customer.road || "",
        zip_code: customer.zip_code || "",
        country: customer.country || "ประเทศไทย",
        // (ตั้งค่าเป็น Object ที่ค้นเจอ)
        province: foundProvince,
        amphoe: foundAmphoe,
        district: foundDistrict, // (นี่คือตำบล)
      });
    }
    setIsEditing(!isEditing); // สลับโหมด
  };

  // (ฟังก์ชันอัปเดต formData เมื่อพิมพ์)
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ◀️ (7) แก้ไข handleSave ให้ "ดึงชื่อ" จาก Object
  const handleSave = async () => {
    setSaveLoading(true);
    setAlert({ open: false, message: "", severity: "success" });
    try {
      // (แปลง Object กลับเป็น Text ก่อนส่ง)
      const payload = {
        ...formData,
        province: formData.province ? formData.province.name_th : "",
        district: formData.amphoe ? formData.amphoe.name_th : "", // (DB district = UI amphoe)
        canton: formData.district ? formData.district.name_th : "", // (DB canton = UI district/tambon)
      };

      const token = localStorage.getItem("token");
      const res = await axios.put(
        `http://localhost:5000/api/customers/${id}`,
        payload, // (ส่ง Payload ที่แปลงแล้ว)
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setCustomer(res.data); // อัปเดต state หลัก
      setIsEditing(false); // ปิดโหมดแก้ไข
      setAlert({
        open: true,
        message: "บันทึกข้อมูลลูกค้าสำเร็จ",
        severity: "success",
      });
    } catch (err) {
      console.error(err);
      setAlert({
        open: true,
        message:
          "บันทึกไม่สำเร็จ: " + (err.response?.data?.error || err.message),
        severity: "error",
      });
    } finally {
      setSaveLoading(false);
    }
  };

  // --- (Loading / Error UI ... เหมือนเดิม) ---
  if (loading) {
    return (
      <div className="p-6 text-center text-lg font-semibold">กำลังโหลด...</div>
    );
  }
  if (error) {
    return (
      <div className="p-6 text-center text-lg font-semibold text-red-500">
        เกิดข้อผิดพลาด: {error}
      </div>
    );
  }
  if (!customer) {
    return (
      <div className="p-6 text-center text-lg font-semibold">
        ไม่พบข้อมูลลูกค้า
      </div>
    );
  }

  // --- (JSX) ---
  return (
    <div className="p-6 space-y-6">
      {/* (Snackbar สำหรับ Alert) */}
      <Snackbar
        open={alert.open}
        autoHideDuration={6000}
        onClose={() => setAlert({ ...alert, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setAlert({ ...alert, open: false })}
          severity={alert.severity}
          sx={{ width: "100%" }}
        >
          {alert.message}
        </Alert>
      </Snackbar>

      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 4 }}
      >
        <Typography variant="h4" sx={{ fontWeight: "bold", color: "#ea7f33" }}>
          รายละเอียดลูกค้า
        </Typography>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
        >
          กลับ
        </Button>
      </Stack>

      {/* ◀️ (แก้ไข) การ์ด "ข้อมูลทั่วไป" */}
      <Paper elevation={2} sx={{ p: { xs: 2, md: 4 }, borderRadius: 3 }}>
        {/* --- ส่วนหัวของการ์ด (มีปุ่มแก้ไข) --- */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 2 }}
        >
          <Typography
            variant="h6"
            sx={{ fontWeight: "bold", color: "#ea7f33" }}
          >
            ข้อมูลทั่วไป
          </Typography>

          {isEditing ? (
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                color="error"
                startIcon={<CancelIcon />}
                onClick={handleEditToggle}
                disabled={saveLoading}
              >
                ยกเลิก
              </Button>
              <Button
                variant="contained"
                color="success"
                startIcon={
                  saveLoading ? <CircularProgress size={20} /> : <SaveIcon />
                }
                onClick={handleSave}
                disabled={saveLoading}
              >
                บันทึก
              </Button>
            </Stack>
          ) : (
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={handleEditToggle}
            >
              แก้ไข
            </Button>
          )}
        </Stack>
        <Divider sx={{ mb: 3 }} />

        {/* --- ส่วนเนื้อหา (สลับระหว่าง View / Edit) --- */}
        {isEditing ? (
          // (โหมดแก้ไข: ◀️ จัด Layout ใหม่เป็น 2 -> 3 -> 3 -> 2)
          <Grid container spacing={2}>
            {/* --- แถว 1 (2 คอลัมน์) --- */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="ชื่อ-นามสกุล"
                name="customer_name"
                value={formData.customer_name}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="เบอร์โทรศัพท์"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
              />
            </Grid>

            {/* --- แถว 2 (3 คอลัมน์ Text) --- */}
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="บ้านเลขที่"
                name="house_number"
                value={formData.house_number}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="หมู่บ้าน"
                name="village"
                value={formData.village}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="ถนน"
                name="road"
                value={formData.road}
                onChange={handleChange}
              />
            </Grid>

            {/* --- แถว 3 (3 คอลัมน์ Autocomplete) --- */}
            <Grid item xs={12} md={4}>
              <Autocomplete
                options={provinceList}
                getOptionLabel={(option) => option.name_th || ""}
                value={formData.province}
                onChange={(e, newValue) => {
                  setFormData((old) => ({
                    ...old,
                    province: newValue,
                    amphoe: null,
                    district: null,
                    zip_code: "",
                  }));
                }}
                renderInput={(params) => (
                  <TextField {...params} label="จังหวัด" />
                )}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Autocomplete
                options={amphoeList}
                getOptionLabel={(option) => option.name_th || ""}
                value={formData.amphoe}
                onChange={(e, newValue) => {
                  setFormData((old) => ({
                    ...old,
                    amphoe: newValue,
                    district: null,
                    zip_code: "",
                  }));
                }}
                renderInput={(params) => (
                  <TextField {...params} label="อำเภอ" />
                )}
                disabled={!formData.province}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Autocomplete
                options={districtList}
                getOptionLabel={(option) => option.name_th || ""}
                value={formData.district} // (นี่คือตำบล)
                onChange={(e, newValue) =>
                  setFormData((old) => ({ ...old, district: newValue }))
                }
                renderInput={(params) => <TextField {...params} label="ตำบล" />}
                disabled={!formData.amphoe}
              />
            </Grid>

            {/* --- แถว 4 (2 คอลัมน์) --- */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="รหัสไปรษณีย์"
                name="zip_code"
                value={formData.zip_code}
                InputProps={{ readOnly: true }}
                sx={{ bgcolor: "#f7f7f7" }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="ประเทศ"
                name="country"
                value={formData.country}
                onChange={handleChange}
              />
            </Grid>
          </Grid>
        ) : (
          // (โหมดแสดงผล: ◀️ เหมือนเดิม)
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-gray-700 ">
            <p>
              <strong>ชื่อ-นามสกุล:</strong> {customer.customer_name}
            </p>
            <p>
              <strong>เบอร์โทรศัพท์:</strong> {customer.phone_number}
            </p>
            <p className="md:col-span-2">
              <strong>ที่อยู่:</strong>
              {customer.house_number?.trim()}
              {customer.village && ` หมู่ ${customer.village.trim()}`}
              {customer.road && ` ถนน ${customer.road.trim()}`}
              {customer.canton && ` ตำบล ${customer.canton.trim()}`}
              {customer.district && ` อำเภอ ${customer.district.trim()}`}
              {customer.province && ` จังหวัด ${customer.province.trim()}`}
              {customer.zip_code && ` ${customer.zip_code.trim()}`}
            </p>
          </div>
        )}
      </Paper>

      {/* (การ์ดประวัติการใช้บริการ ... เหมือนเดิม ไม่ต้องแก้ไข) */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h3 className="text-xl font-semibold mb-4 text-[#ea7f33]">
          ประวัติการใช้บริการ
        </h3>
        {/* ... (เนื้อหาตารางเหมือนเดิม) ... */}
        {customer.cars && customer.cars.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              {/* (thead ... เหมือนเดิม) */}
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                    ลำดับ
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    ทะเบียนรถ
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    วันที่เข้าใช้บริการ
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    การบริการ
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    จำนวนเงิน
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    สถานะ
                  </th>
                </tr>
              </thead>
              {/* (tbody ... เหมือนเดิม) */}
              <tbody className="bg-white divide-y divide-gray-200">
                {customer.cars.map((car) =>
                  (car.service_history || []).map((s, index) => {
                    let serviceType = "";
                    if (s.parking_slot && s.services?.length > 0)
                      serviceType = "เช่าที่จอด + บริการเพิ่มเติม";
                    else if (s.parking_slot) serviceType = "เช่าที่จอด";
                    else if (s.services?.length > 0)
                      serviceType = "บริการเพิ่มเติม";

                    return (
                      <tr key={s._id}>
                        <td className="px-4 py-2 text-center">{index + 1}</td>
                        <td className="px-4 py-2">{car.car_registration}</td>
                        <td>
                          {s.entry_time
                            ? new Date(s.entry_time).toLocaleDateString()
                            : "-"}
                        </td>

                        <td className="px-4 py-2">{serviceType}</td>
                        <td className="px-4 py-2">
                          {s.total_price?.toFixed(2) || 0} บาท
                        </td>
                        <td className="px-4 py-2">
                          <span
                            className={`px-2 py-1 rounded text-white font-semibold ${
                              s.is_paid ? "bg-green-500" : "bg-red-500"
                            }`}
                          >
                            {s.is_paid ? "ชำระแล้ว" : "ยังไม่ชำระ"}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">ยังไม่มีประวัติการใช้บริการ</p>
        )}
      </div>
    </div>
  );
}
