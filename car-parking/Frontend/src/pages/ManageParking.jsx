import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Switch,
  Select,
  MenuItem,
  CircularProgress,
  Snackbar,
  Alert,
  Box,
  Typography,
  Stack,
  Divider,
} from "@mui/material";

const API = "http://localhost:5000/api";

export default function ManageParkingFull() {
  const [zones, setZones] = useState([]);
  const [slots, setSlots] = useState([]);
  const [selectedZone, setSelectedZone] = useState("");

  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Zone Dialog
  const [zoneOpen, setZoneOpen] = useState(false);
  const [editingZone, setEditingZone] = useState(null);
  const [zoneForm, setZoneForm] = useState({ name: "", totalSlots: 0 });

  // Slot Dialog
  const [slotOpen, setSlotOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [slotForm, setSlotForm] = useState({ number: 0 });

  // ---------------- Fetch Data ----------------
  useEffect(() => {
    fetchZones();
  }, []);

  useEffect(() => {
    if (selectedZone) fetchSlots(selectedZone);
  }, [selectedZone]);

  const fetchZones = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/zones`);
      setZones(res.data);
      if (!selectedZone && res.data.length) setSelectedZone(res.data[0]._id);
    } catch (err) {
      showSnackbar("ไม่สามารถโหลด Zone ได้", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchSlots = async (zoneId) => {
    try {
      const res = await axios.get(`${API}/parkingslots?zoneId=${zoneId}`);
      setSlots(res.data);
    } catch (err) {
      console.error("Error fetching parking slots:", err);
    }
  };

  // ---------------- Snackbar ----------------
  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  // ---------------- Zone Handlers ----------------
  const handleZoneOpen = (zone = null) => {
    setEditingZone(zone);
    setZoneForm(
      zone
        ? { name: zone.name, totalSlots: zone.totalSlots }
        : { name: "", totalSlots: 0 }
    );
    setZoneOpen(true);
  };

  const handleZoneSave = async () => {
    if (!zoneForm.name.trim())
      return showSnackbar("กรุณากรอกชื่อ Zone", "warning");

    try {
      if (editingZone) {
        await axios.put(`${API}/zones/${editingZone._id}`, zoneForm);
        showSnackbar("แก้ไข Zone สำเร็จ");

        if (selectedZone === editingZone._id) {
          await fetchSlots(editingZone._id);
        }
      } else {
        await axios.post(`${API}/zones`, zoneForm);
        showSnackbar("เพิ่ม Zone สำเร็จ");
      }

      setZoneOpen(false);
      await fetchZones();
    } catch (err) {
      showSnackbar(
        err.response?.data?.message || "บันทึก Zone ไม่สำเร็จ",
        "error"
      );
    }
  };

  const handleZoneToggle = async (id) => {
    try {
      await axios.patch(`${API}/zones/${id}/toggle`);
      fetchZones();
      showSnackbar("อัปเดตสถานะ Zone แล้ว");
    } catch {
      showSnackbar("ไม่สามารถเปลี่ยนสถานะ Zone ได้", "error");
    }
  };

  const handleZoneDelete = async (id) => {
    if (!window.confirm("คุณแน่ใจหรือไม่ที่จะลบ Zone นี้?")) return;
    try {
      await axios.delete(`${API}/zones/${id}`);
      showSnackbar("ลบ Zone สำเร็จ");
      fetchZones();
    } catch {
      showSnackbar("ลบ Zone ไม่สำเร็จ", "error");
    }
  };

  const handleZoneSelect = (zoneId) => {
    setSelectedZone(zoneId);
    fetchSlots(zoneId);
  };

  // ---------------- Slot Handlers ----------------
  const handleSlotOpen = (slot = null) => {
    setEditingSlot(slot);
    setSlotForm(slot ? { number: slot.number } : { number: 0 });
    setSlotOpen(true);
  };

  const handleSlotSave = async () => {
    if (!selectedZone) return showSnackbar("กรุณาเลือก Zone ก่อน", "warning");
    if (!slotForm.number)
      return showSnackbar("กรุณากรอกหมายเลขช่องจอด", "warning");

    try {
      if (editingSlot) {
        await axios.put(`${API}/parkingSlots/${editingSlot._id}`, slotForm);
        showSnackbar("แก้ไข Slot สำเร็จ");
      } else {
        await axios.post(`${API}/parkingSlots`, {
          ...slotForm,
          zone: selectedZone,
        });
        showSnackbar("เพิ่ม Slot สำเร็จ");
      }
      setSlotOpen(false);
      fetchSlots(selectedZone);
    } catch (err) {
      showSnackbar(
        err.response?.data?.message || "บันทึก Slot ไม่สำเร็จ",
        "error"
      );
    }
  };

  const handleSlotToggle = async (slot) => {
    try {
      await axios.put(`${API}/parkingSlots/${slot._id}`, {
        isOccupied: !slot.isOccupied,
      });
      fetchSlots(selectedZone);
    } catch {
      showSnackbar("ไม่สามารถเปลี่ยนสถานะ Slot ได้", "error");
    }
  };

  const handleSlotDelete = async (id) => {
    if (!window.confirm("ต้องการลบช่องจอดนี้หรือไม่?")) return;
    try {
      await axios.delete(`${API}/parkingSlots/${id}`);
      showSnackbar("ลบ Slot สำเร็จ");
      fetchSlots(selectedZone);
    } catch {
      showSnackbar("ลบ Slot ไม่สำเร็จ", "error");
    }
  };

  // ---------------- UI ----------------
  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>
        🅾️ จัดการโซน (Zone Management)
      </Typography>

      <Stack direction="row" spacing={2} mb={2}>
        <Button variant="contained" onClick={() => handleZoneOpen()}>
          ➕ เพิ่ม Zone
        </Button>
      </Stack>

      {loading ? (
        <CircularProgress />
      ) : (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>ชื่อ Zone</TableCell>
              <TableCell align="center">จำนวนช่อง</TableCell>
              <TableCell align="center">สถานะ</TableCell>
              <TableCell align="center">การจัดการ</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {zones.map((z) => (
              <TableRow key={z._id}>
                <TableCell>{z.name}</TableCell>
                <TableCell align="center">{z.totalSlots}</TableCell>
                <TableCell align="center">
                  <Switch
                    checked={z.isActive}
                    onChange={() => handleZoneToggle(z._id)}
                  />
                  {z.isActive ? "เปิด" : "ปิด"}
                </TableCell>
                <TableCell align="center">
                  <Button onClick={() => handleZoneOpen(z)}>แก้ไข</Button>
                  <Button color="error" onClick={() => handleZoneDelete(z._id)}>
                    ลบ
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Divider sx={{ my: 4 }} />

      <Typography variant="h5" gutterBottom>
        🅿️ จัดการช่องจอด (Parking Slots)
      </Typography>

      <Stack direction="row" spacing={2} mb={2}>
        <Select
          size="small"
          value={selectedZone}
          onChange={(e) => handleZoneSelect(e.target.value)}
          displayEmpty
        >
          <MenuItem value="">
            <em>เลือก Zone</em>
          </MenuItem>
          {zones.map((z) => (
            <MenuItem key={z._id} value={z._id}>
              {z.name}
            </MenuItem>
          ))}
        </Select>
        <Button variant="contained" onClick={() => handleSlotOpen()}>
          ➕ เพิ่ม Slot
        </Button>
      </Stack>

      {loading ? (
        <CircularProgress />
      ) : (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>หมายเลขช่อง</TableCell>
              <TableCell align="center">สถานะ</TableCell>
              <TableCell align="center">จัดการ</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {slots.map((s) => (
              <TableRow key={s._id}>
                <TableCell>{s.number}</TableCell>
                <TableCell align="center">
                  <Switch
                    checked={s.isOccupied}
                    onChange={() => handleSlotToggle(s)}
                  />
                  {s.isOccupied ? "ไม่ว่าง" : "ว่าง"}
                </TableCell>
                <TableCell align="center">
                  <Button onClick={() => handleSlotOpen(s)}>แก้ไข</Button>
                  <Button color="error" onClick={() => handleSlotDelete(s._id)}>
                    ลบ
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Zone Dialog */}
      <Dialog open={zoneOpen} onClose={() => setZoneOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{editingZone ? "แก้ไข Zone" : "เพิ่ม Zone"}</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            label="ชื่อ Zone"
            value={zoneForm.name}
            onChange={(e) => setZoneForm({ ...zoneForm, name: e.target.value })}
            fullWidth
          />
          <TextField
            label="จำนวนช่อง"
            type="number"
            value={zoneForm.totalSlots}
            onChange={(e) =>
              setZoneForm({ ...zoneForm, totalSlots: e.target.value })
            }
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setZoneOpen(false)}>ยกเลิก</Button>
          <Button variant="contained" onClick={handleZoneSave}>
            บันทึก
          </Button>
        </DialogActions>
      </Dialog>

      {/* Slot Dialog */}
      <Dialog open={slotOpen} onClose={() => setSlotOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{editingSlot ? "แก้ไข Slot" : "เพิ่ม Slot"}</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            label="หมายเลขช่อง"
            type="number"
            value={slotForm.number}
            onChange={(e) =>
              setSlotForm({ ...slotForm, number: e.target.value })
            }
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSlotOpen(false)}>ยกเลิก</Button>
          <Button variant="contained" onClick={handleSlotSave}>
            บันทึก
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={2500}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}
