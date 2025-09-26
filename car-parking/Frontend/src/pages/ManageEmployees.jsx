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
  FormGroup,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { Add, Edit, Delete } from "@mui/icons-material";
import axios from "axios";

const API_URL = "http://localhost:5000/api/users"; // แก้ตาม backend

// เตรียม permissions ทั้งหมดที่สามารถเลือกได้
const ALL_PERMISSIONS = [
  "service",
  "manage.services",
  "crm.customer",
  "crm.car",
  "manage.payment",
  "dashboard",
  "report.services",
  "report.income",
  "system.settings",
  "system.prices",
  "system.cars",
  "system.parking",
  "system.employees",
  "system.departments",
];

export default function ManageEmployees() {
  const [employees, setEmployees] = useState([]);
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
    permissions: [],
  });

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

  useEffect(() => {
    fetchEmployees();
  }, []);

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
        permissions: user.permissions || [],
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
        permissions: [],
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingUser(null);
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem("token");
      if (editingUser) {
        await axios.put(`${API_URL}/${editingUser._id}`, form, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post(API_URL, form, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      handleCloseDialog();
      fetchEmployees();
    } catch (error) {
      console.error("Submit error:", error.response?.data || error);
      alert(error.response?.data?.message || "เกิดข้อผิดพลาด");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("ยืนยันการลบพนักงานนี้?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchEmployees();
    } catch (error) {
      console.error("Delete error:", error.response?.data || error);
    }
  };

  const togglePermission = (perm) => {
    setForm((prev) => {
      const newPermissions = prev.permissions.includes(perm)
        ? prev.permissions.filter((p) => p !== perm)
        : [...prev.permissions, perm];
      return { ...prev, permissions: newPermissions };
    });
  };

  const columns = [
    { field: "username", headerName: "Username", flex: 1 },
    { field: "first_name", headerName: "ชื่อ", flex: 1 },
    { field: "last_name", headerName: "นามสกุล", flex: 1 },
    { field: "phone_number_user", headerName: "เบอร์โทร", flex: 1 },
    { field: "role", headerName: "สิทธิ์", flex: 1 },
    { field: "department", headerName: "แผนก", flex: 1 },
    {
      field: "actions",
      headerName: "จัดการ",
      flex: 1,
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
        />
      </Box>

      {/* Dialog เพิ่ม/แก้ไข */}
      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="md">
        <DialogTitle>{editingUser ? "แก้ไขพนักงาน" : "เพิ่มพนักงาน"}</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Username"
            fullWidth
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
          />
          {!editingUser && (
            <TextField
              margin="dense"
              label="Password"
              type="password"
              fullWidth
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          )}
          <TextField
            margin="dense"
            label="ชื่อ"
            fullWidth
            value={form.first_name}
            onChange={(e) => setForm({ ...form, first_name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="นามสกุล"
            fullWidth
            value={form.last_name}
            onChange={(e) => setForm({ ...form, last_name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="เบอร์โทร"
            fullWidth
            value={form.phone_number_user}
            onChange={(e) => setForm({ ...form, phone_number_user: e.target.value })}
          />
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
          <TextField
            margin="dense"
            label="แผนก"
            fullWidth
            value={form.department}
            onChange={(e) => setForm({ ...form, department: e.target.value })}
          />

          {/* Permissions */}
          <Typography mt={2} variant="subtitle1">
            สิทธิ์การเข้าถึง
          </Typography>
          <FormGroup row>
            {ALL_PERMISSIONS.map((perm) => (
              <FormControlLabel
                key={perm}
                control={
                  <Checkbox
                    checked={form.permissions.includes(perm)}
                    onChange={() => togglePermission(perm)}
                  />
                }
                label={perm}
              />
            ))}
          </FormGroup>
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
