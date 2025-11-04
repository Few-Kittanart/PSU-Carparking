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

} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { Add, Edit, Delete } from "@mui/icons-material";
import axios from "axios";

const API_URL = "http://localhost:5000/api/users";
const DEPT_API_URL = "http://localhost:5000/api/departments";

export default function ManageEmployees() {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState({
    username: "",
    password: "",
    first_name: "",
    last_name: "",
    phone_number_user: "",
    role: "user",
    department: "",
  });

  // ------------------------- API Calls -------------------------

  // ดึงข้อมูลพนักงานทั้งหมด
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

  // ดึงข้อมูลแผนกทั้งหมด
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

  // ------------------------- Handlers -------------------------

  // เปิด dialog (เพิ่ม/แก้ไข)
  const handleOpenDialog = (user = null) => {
    setEditingUser(user);
    if (user) {
      setForm({
        username: user.username,
        password: "",
        first_name: user.first_name,
        last_name: user.last_name,
        phone_number_user: user.phone_number_user,
        role: user.role,
        department: user.department || "",
      });
    } else {
      setForm({
        username: "",
        password: "",
        first_name: "",
        last_name: "",
        phone_number_user: "",
        role: "user",
        department: "",
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingUser(null);
    setForm({
      username: "",
      password: "",
      first_name: "",
      last_name: "",
      phone_number_user: "",
      role: "user",
      department: "",
    });
  };

  // ส่งฟอร์ม (เพิ่ม/แก้ไข)
  const handleSubmit = async () => {
    const token = localStorage.getItem("token");
    const dataToSend = { ...form };

    if (editingUser && dataToSend.password === "") {
      delete dataToSend.password;
    }

    try {
      if (editingUser) {
        // แก้ไขพนักงาน
        await axios.put(`${API_URL}/${editingUser._id}`, dataToSend, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        // เพิ่มพนักงานใหม่
        await axios.post(API_URL, dataToSend, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      fetchEmployees();
      handleCloseDialog();
    } catch (error) {
      alert("Error saving employee: " + (error.response?.data?.message || error.message));
      console.error("Error saving employee:", error.response?.data || error);
    }
  };

  // ลบพนักงาน
  const handleDelete = async (id) => {
    if (!window.confirm("คุณต้องการลบพนักงานนี้หรือไม่?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchEmployees();
    } catch (error) {
      alert("Error deleting employee: " + (error.response?.data?.message || error.message));
      console.error("Error deleting employee:", error.response?.data || error);
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

      {/* Dialog เพิ่ม/แก้ไข */}
      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle>{editingUser ? "แก้ไขพนักงาน" : "เพิ่มพนักงาน"}</DialogTitle>
        <DialogContent>
          
          {/* ข้อมูล Username */}
          <TextField
            margin="dense"
            label="Username"
            fullWidth
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}

          />
          
          {/* ข้อมูล Password */}
          <TextField
            margin="dense"
            label={editingUser ? "Password (เว้นว่างหากไม่ต้องการเปลี่ยน)" : "Password"}
            type="password"
            fullWidth
            required={!editingUser}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          
          {/* ข้อมูล ชื่อ */}
          <TextField
            margin="dense"
            label="ชื่อ"
            fullWidth
            value={form.first_name}
            onChange={(e) => setForm({ ...form, first_name: e.target.value })}
          />
          
          {/* ข้อมูล นามสกุล */}
          <TextField
            margin="dense"
            label="นามสกุล"
            fullWidth
            value={form.last_name}
            onChange={(e) => setForm({ ...form, last_name: e.target.value })}
          />
          
          {/* ข้อมูล เบอร์โทร */}
          <TextField
            margin="dense"
            label="เบอร์โทร"
            fullWidth
            value={form.phone_number_user}
            onChange={(e) => setForm({ ...form, phone_number_user: e.target.value })}
          />
          
          {/* สิทธิ์ (Role) - Dropdown */}
          <TextField
            select
            margin="dense"
            label="สิทธิ์"
            fullWidth
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            <MenuItem value="superadmin">Super Admin</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
            <MenuItem value="user">User</MenuItem>
          </TextField>
          
          {/* แผนก (Department) - Dropdown */}
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
            {/* วนลูปแสดงแผนกที่ดึงมา */}
            {departments.map((dept) => (
              <MenuItem key={dept._id} value={dept.department_name}>
                {dept.department_name}
              </MenuItem>
            ))}
          </TextField>

          {/* ส่วน Permissions ถูกลบออกแล้ว */}
          
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