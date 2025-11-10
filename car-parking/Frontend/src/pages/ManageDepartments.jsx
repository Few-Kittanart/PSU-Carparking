import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
  IconButton,
  FormGroup,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { Add, Edit, Delete } from "@mui/icons-material";
import axios from "axios";

const ALL_PERMISSIONS = [
  "การใช้บริการ",
  "จัดการบริการ",
  "ลูกค้า",
  "รถลูกค้า",
  "แดชบอร์ด",
  "รายงานการบริการ",
  "รายงานรายได้",
  "ตั้งค่าระบบ",
  "ตั้งค่าราคา",
  "ตั้งค่ารถ",
  "ตั้งค่าที่จอด",
  "ตั้งค่าพนักงาน",
  "ตั้งค่าแผนก",
]; // <--- เพิ่มส่วนนี้

const API_URL = "http://localhost:5000/api/departments";

export default function ManageDepartments() {
  const [departments, setDepartments] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [form, setForm] = useState({
    department_name: "",
    permissions: [],
  });

  const fetchDepartments = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDepartments(res.data);
    } catch (error) {
      console.error("Fetch departments error:", error.response?.data || error);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  // เปิด dialog (เพิ่ม/แก้ไข)
  const handleOpenDialog = (dept = null) => {
    setEditingDept(dept);
    if (dept) {
      setForm({
        department_name: dept.department_name,
        permissions: dept.permissions || [],
      });
    } else {
      setForm({
        department_name: "",
        permissions: [],
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingDept(null);
  };

  // ✅ toggle permissions
  const togglePermission = (perm) => {
    setForm((prev) => {
      const newPermissions = prev.permissions.includes(perm)
        ? prev.permissions.filter((p) => p !== perm)
        : [...prev.permissions, perm];
      return { ...prev, permissions: newPermissions };
    });
  };

  // บันทึกข้อมูล
  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem("token");
      if (editingDept) {
        await axios.put(`${API_URL}/${editingDept._id}`, form, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post(API_URL, form, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      handleCloseDialog();
      fetchDepartments();
    } catch (error) {
      console.error("Submit error:", error.response?.data || error);
      alert(error.response?.data?.message || "เกิดข้อผิดพลาด");
    }
  };

  // ลบข้อมูล
  const handleDelete = async (id) => {
    if (!window.confirm("ยืนยันการลบแผนกนี้?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchDepartments();
    } catch (error) {
      console.error("Delete error:", error.response?.data || error);
    }
  };

  // columns ของ DataGrid
  const columns = [
    { field: "department_name", headerName: "ชื่อแผนก", flex: 1 },
    {
      field: "permissions",
      headerName: "สิทธิ์การเข้าถึง",
      flex: 2,
      renderCell: (params) => params.row.permissions?.join(", ") || "-",
    },
    {
      field: "actions",
      headerName: "จัดการ",
      flex: 1,
      renderCell: (params) => (
        <>
          <IconButton
            color="primary"
            onClick={() => handleOpenDialog(params.row)}
          >
            <Edit />
          </IconButton>
          <IconButton
            color="error"
            onClick={() => handleDelete(params.row._id)}
          >
            <Delete />
          </IconButton>
        </>
      ),
    },
  ];

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        ตั้งค่าแผนก
      </Typography>

      <Button
        variant="contained"
        startIcon={<Add />}
        onClick={() => handleOpenDialog()}
        sx={{ mb: 2 }}
      >
        เพิ่มแผนก
      </Button>

      <Box style={{ height: 500, width: "100%" }}>
        <DataGrid
          rows={departments}
          columns={columns}
          getRowId={(row) => row._id}
          pageSize={7}
        />
      </Box>

      {/* Dialog เพิ่ม/แก้ไข */}
      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="md">
        <DialogTitle>{editingDept ? "แก้ไขแผนก" : "เพิ่มแผนก"}</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="ชื่อแผนก"
            fullWidth
            value={form.department_name}
            onChange={(e) => setForm({ ...form, department_name: e.target.value })}
          />

          {/* Permissions Section */}
          <Typography mt={2} variant="subtitle1">
            สิทธิ์การเข้าถึง (สำหรับแผนก)
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
          {/* End Permissions Section */}

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
