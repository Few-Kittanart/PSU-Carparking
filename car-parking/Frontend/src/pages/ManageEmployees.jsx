// ManageEmployees.jsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  MenuItem,
  Typography,
  IconButton,
  Grid, // ◀️ (1) Import Grid
  Alert, // ◀️ (1) Import Alert
  Snackbar, // ◀️ (1) Import Snackbar
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { Add, Edit, Delete } from "@mui/icons-material";
import axios from "axios";

const API_URL = "http://localhost:5000/api/users";
const DEPT_API_URL = "http://localhost:5000/api/departments";

// ◀️ (2) ฟังก์ชันสำหรับรีเซ็ตฟอร์ม
const getInitialFormState = () => ({
  username: "",
  password: "",
  confirm_password: "", // ◀️ เพิ่ม
  first_name: "",
  last_name: "",
  phone_number_user: "",
  role: "user",
  department: "",
});

export default function ManageEmployees() {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  
  // ◀️ (3) แก้ไข State ของฟอร์ม
  const [form, setForm] = useState(getInitialFormState());
  const [errors, setErrors] = useState({}); // ◀️ State สำหรับเก็บ Error
  const [alert, setAlert] = useState({ open: false, message: "", severity: "success" });

  // ------------------------- API Calls -------------------------

  // (โค้ดที่เติมให้ครบ)
  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEmployees(res.data);
    } catch (error) {
      console.error("Fetch employees error:", error.response?.data || error);
    }
  };

  // (โค้ดที่เติมให้ครบ)
  const fetchDepartments = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(DEPT_API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDepartments(res.data);
    } catch (error) {
      console.error("Fetch departments error:", error.response?.data || error);
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchDepartments(); 
  }, []);

  // ------------------------- Validation -------------------------

  // ◀️ (4) ฟังก์ชันตรวจสอบฟอร์ม
  const validateForm = () => {
    const newErrors = {};
    
    // (กฎ Validation)
    if (!form.username) newErrors.username = "กรุณากรอก Username";
    if (!form.first_name) newErrors.first_name = "กรุณากรอกชื่อ";
    if (!form.last_name) newErrors.last_name = "กรุณากรอกนามสกุล";
    if (!form.role) newErrors.role = "กรุณาเลือกสิทธิ์";

    // (กฎ Password)
    if (!editingUser && !form.password) {
      // (ถ้าสร้างใหม่ Password ห้ามว่าง)
      newErrors.password = "กรุณากรอกรหัสผ่าน";
    }
    if (form.password) {
      // (ถ้ามีการกรอกรหัสผ่าน)
      if (form.password.length < 6) {
        newErrors.password = "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร";
      }
      if (form.password !== form.confirm_password) {
        newErrors.confirm_password = "รหัสผ่านไม่ตรงกัน";
      }
    }
    
    setErrors(newErrors);
    // (ถ้า object (newErrors) ไม่มี key เลย = ผ่าน)
    return Object.keys(newErrors).length === 0;
  };

  // ------------------------- Handlers -------------------------

  const handleOpenDialog = (user = null) => {
    setEditingUser(user);
    if (user) {
      setForm({
        username: user.username,
        password: "", // (รีเซ็ต Password เสมอ)
        confirm_password: "", // (รีเซ็ต Password เสมอ)
        first_name: user.first_name,
        last_name: user.last_name,
        phone_number_user: user.phone_number_user,
        role: user.role,
        department: user.department || "",
      });
    } else {
      setForm(getInitialFormState());
    }
    setErrors({}); // (ล้าง Error เก่า)
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingUser(null);
  };

  // ◀️ (5) แก้ไข handleSubmit ให้มีการ Validate
  const handleSubmit = async () => {
    // (1. ตรวจสอบก่อน)
    if (!validateForm()) {
      return; // (ถ้าไม่ผ่าน ให้ออกจากฟังก์ชันทันที)
    }
    
    // (2. ถ้าผ่าน ค่อยส่ง)
    const token = localStorage.getItem("token");
    const dataToSend = { ...form };
    
    // (ลบ confirm_password ออก ไม่ต้องส่งไป Backend)
    delete dataToSend.confirm_password; 

    // (ลบ password ออกจาก payload หากเป็นโหมดแก้ไขและผู้ใช้ไม่ได้กรอก password ใหม่)
    if (editingUser && dataToSend.password === "") {
      delete dataToSend.password;
    }

    try {
      if (editingUser) {
        // แก้ไขพนักงาน
        await axios.put(`${API_URL}/${editingUser._id}`, dataToSend, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAlert({ open: true, message: "แก้ไขพนักงานสำเร็จ", severity: "success" });
      } else {
        // เพิ่มพนักงานใหม่
        await axios.post(API_URL, dataToSend, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAlert({ open: true, message: "เพิ่มพนักงานสำเร็จ", severity: "success" });
      }
      fetchEmployees();
      handleCloseDialog();
    } catch (error) {
      const errMsg = error.response?.data?.message || error.message;
      setAlert({ open: true, message: "เกิดข้อผิดพลาด: " + errMsg, severity: "error" });
      console.error("Error saving employee:", error.response?.data || error);
    }
  };

  // (ลบพนักงาน ... เหมือนเดิม)
  const handleDelete = async (id) => {
    if (!window.confirm("คุณต้องการลบพนักงานนี้หรือไม่?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAlert({ open: true, message: "ลบพนักงานสำเร็จ", severity: "success" });
      fetchEmployees();
    } catch (error) {
      const errMsg = error.response?.data?.message || error.message;
      setAlert({ open: true, message: "เกิดข้อผิดพลาด: " + errMsg, severity: "error" });
    }
  };


  // ------------------------- DataGrid Columns -------------------------

  const columns = [
    { field: "username", headerName: "Username", width: 150 },
    { field: "first_name", headerName: "ชื่อ", width: 150 },
    { field: "last_name", headerName: "นามสกุล", width: 150 },
    { field: "phone_number_user", headerName: "เบอร์โทร", width: 150 },
    { field: "role", headerName: "สิทธิ์", width: 120 },
    { field: "department", headerName: "แผนก", width: 150 },
    {
      field: "actions",
      headerName: "การจัดการ",
      width: 150,
      renderCell: (params) => (
        <>
          <IconButton color="primary" onClick={() => handleOpenDialog(params.row)}>
            <Edit />
          </IconButton>
          <IconButton color="error" onClick={() => handleDelete(params.row._id)}>
            <Delete />
          </IconButton>
        </>
      ),
    },
  ];

  // ------------------------- Render -------------------------

  return (
    <Box p={3}>
      {/* ◀️ (6) เพิ่ม Snackbar สำหรับ Alert */}
      <Snackbar
        open={alert.open}
        autoHideDuration={6000}
        onClose={() => setAlert({ ...alert, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setAlert({ ...alert, open: false })} severity={alert.severity} sx={{ width: '100%' }}>
          {alert.message}
        </Alert>
      </Snackbar>

      <Typography variant="h4" gutterBottom>
        จัดการพนักงาน
      </Typography>

      <Button
        variant="contained"
        startIcon={<Add />}
        onClick={() => handleOpenDialog()}
        sx={{ mb: 2 }}
      >
        เพิ่มพนักงาน
      </Button>

      <Box style={{ height: 500, width: "100%" }}>
        <DataGrid
          rows={employees}
          columns={columns}
          getRowId={(row) => row._id}
          pageSize={7}
          rowsPerPageOptions={[7]}
          disableSelectionOnClick
        />
      </Box>

      {/* ◀️ (7) แก้ไข Dialog ทั้งหมด */}
      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="md">
        <DialogTitle>{editingUser ? "แก้ไขพนักงาน" : "เพิ่มพนักงาน"}</DialogTitle>
        <DialogContent>
          
          <Grid container spacing={2} sx={{ mt: 1 }}>
            
            {/* --- แถว 1 --- */}
            <Grid item xs={12} md={6}>
              <TextField
                margin="dense"
                label="Username"
                fullWidth
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                disabled={!!editingUser} // (ห้ามแก้ไข Username ทีหลัง)
                required
                error={!!errors.username} // (แสดง Error)
                helperText={errors.username} // (ข้อความ Error)
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                select
                margin="dense"
                label="สิทธิ์"
                fullWidth
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                error={!!errors.role}
                helperText={errors.role}
              >
                <MenuItem value="superadmin">Super Admin</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="user">User</MenuItem>
              </TextField>
            </Grid>

            {/* --- แถว 2 --- */}
            <Grid item xs={12} md={6}>
              <TextField
                margin="dense"
                label="ชื่อ"
                fullWidth
                value={form.first_name}
                onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                required
                error={!!errors.first_name}
                helperText={errors.first_name}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                margin="dense"
                label="นามสกุล"
                fullWidth
                value={form.last_name}
                onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                required
                error={!!errors.last_name}
                helperText={errors.last_name}
              />
            </Grid>

            {/* --- แถว 3 --- */}
            <Grid item xs={12} md={6}>
              <TextField
                margin="dense"
                label="เบอร์โทร (ไม่บังคับ)"
                fullWidth
                value={form.phone_number_user}
                onChange={(e) => setForm({ ...form, phone_number_user: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                select
                margin="dense"
                label="แผนก"
                fullWidth
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
              >
                <MenuItem value="">
                  <em>ไม่มีแผนก</em>
                </MenuItem> 
                {departments.map((dept) => (
                  <MenuItem key={dept._id} value={dept.department_name}>
                    {dept.department_name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* --- แถว 4 (Password) --- */}
            <Grid item xs={12} md={6}>
              <TextField
                margin="dense"
                label={editingUser ? "Password ใหม่ (เว้นว่างหากไม่เปลี่ยน)" : "Password"}
                type="password"
                fullWidth
                required={!editingUser} // (บังคับกรอกเฉพาะตอนสร้างใหม่)
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                error={!!errors.password}
                helperText={errors.password}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                margin="dense"
                label="ยืนยัน Password"
                type="password"
                fullWidth
                value={form.confirm_password}
                onChange={(e) => setForm({ ...form, confirm_password: e.target.value })}
                error={!!errors.confirm_password}
                helperText={errors.confirm_password}
                // (ปิดช่องนี้ ถ้ายังไม่กรอกช่อง Password)
                disabled={!form.password} 
              />
            </Grid>

          </Grid>
          
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>ยกเลิก</Button>
          <Button variant="contained" onClick={handleSubmit}>
            บันทึก
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}