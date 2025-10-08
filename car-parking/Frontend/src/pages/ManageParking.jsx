import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions,
  Table, TableHead, TableRow, TableCell, TableBody, Switch, Select, MenuItem
} from "@mui/material";

const API = "http://localhost:5000/api";

export default function ManageParkingFull() {
  const [zones, setZones] = useState([]);
  const [slots, setSlots] = useState([]);
  const [selectedZone, setSelectedZone] = useState("");
  
  // Dialog zone
  const [zoneOpen, setZoneOpen] = useState(false);
  const [editingZone, setEditingZone] = useState(null);
  const [zoneForm, setZoneForm] = useState({ name: "", totalSlots: 0 });

  // Dialog slot
  const [slotOpen, setSlotOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [slotForm, setSlotForm] = useState({ number: 0 });

  // ------------------- Load Data -------------------
  useEffect(() => { fetchZones(); }, []);
  useEffect(() => { if (selectedZone) fetchSlots(selectedZone); }, [selectedZone]);

  const fetchZones = async () => {
    try {
      const res = await axios.get(`${API}/zones`);
      setZones(res.data);
      if (!selectedZone && res.data.length) setSelectedZone(res.data[0]._id);
    } catch (err) { console.error(err); }
  };

  const fetchSlots = async (zoneId) => {
    try {
      const res = await axios.get(`${API}/parkingSlots?zone=${zoneId}`);
      setSlots(res.data);
    } catch (err) { console.error(err); }
  };

  // ------------------- Zone Handlers -------------------
  const handleZoneOpen = (zone=null) => {
    setEditingZone(zone);
    setZoneForm(zone || { name: "", totalSlots: 0 });
    setZoneOpen(true);
  };
  const handleZoneSave = async () => {
    try {
      if (editingZone) {
        await axios.put(`${API}/zones/${editingZone._id}`, zoneForm);
      } else {
        await axios.post(`${API}/zones`, zoneForm);
      }
      fetchZones();
      setZoneOpen(false);
    } catch(err) { alert(err.response?.data?.message || err.message); }
  };
  const handleZoneToggle = async (id) => { await axios.patch(`${API}/zones/${id}/toggle`); fetchZones(); };
  const handleZoneDelete = async (id) => { if(window.confirm("ลบ Zone?")) { await axios.delete(`${API}/zones/${id}`); fetchZones(); }};

  // ------------------- Slot Handlers -------------------
  const handleSlotOpen = (slot=null) => {
    setEditingSlot(slot);
    setSlotForm(slot || { number: 0 });
    setSlotOpen(true);
  };
  const handleSlotSave = async () => {
    try {
      if (!selectedZone) return alert("เลือก Zone ก่อน");
      if (editingSlot) {
        await axios.put(`${API}/parkingSlots/${editingSlot._id}`, slotForm);
      } else {
        await axios.post(`${API}/parkingSlots`, { ...slotForm, zone: selectedZone });
      }
      fetchSlots(selectedZone);
      setSlotOpen(false);
    } catch(err) { alert(err.response?.data?.message || err.message); }
  };
  const handleSlotToggle = async (slot) => {
    await axios.put(`${API}/parkingSlots/${slot._id}`, { isOccupied: !slot.isOccupied });
    fetchSlots(selectedZone);
  };
  const handleSlotDelete = async (id) => { if(window.confirm("ลบ Slot?")) { await axios.delete(`${API}/parkingSlots/${id}`); fetchSlots(selectedZone); }};

  return (
    <div style={{ padding: 20 }}>
      <h2>🅾️ Zone Management</h2>
      <Button variant="contained" color="primary" onClick={() => handleZoneOpen()}>➕ เพิ่ม Zone</Button>
      <Table style={{ marginTop: 20 }}>
        <TableHead>
          <TableRow>
            <TableCell>ชื่อ Zone</TableCell>
            <TableCell>จำนวนช่อง</TableCell>
            <TableCell>สถานะ</TableCell>
            <TableCell>จัดการ</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {zones.map(z => (
            <TableRow key={z._id}>
              <TableCell>{z.name}</TableCell>
              <TableCell>{z.totalSlots}</TableCell>
              <TableCell>
                <Switch checked={z.isActive} onChange={() => handleZoneToggle(z._id)}/>
                {z.isActive ? "เปิด" : "ปิด"}
              </TableCell>
              <TableCell>
                <Button onClick={() => handleZoneOpen(z)}>แก้ไข</Button>
                <Button color="error" onClick={() => handleZoneDelete(z._id)}>ลบ</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <h2 style={{ marginTop: 40 }}>🅿️ Parking Slot Management</h2>
      <Select value={selectedZone} onChange={e => setSelectedZone(e.target.value)}>
        {zones.map(z => <MenuItem key={z._id} value={z._id}>{z.name}</MenuItem>)}
      </Select>
      <Button style={{ marginLeft: 10 }} variant="contained" color="primary" onClick={() => handleSlotOpen()}>➕ เพิ่ม Slot</Button>

      <Table style={{ marginTop: 20 }}>
        <TableHead>
          <TableRow>
            <TableCell>Number</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>จัดการ</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {slots.map(s => (
            <TableRow key={s._id}>
              <TableCell>{s.number}</TableCell>
              <TableCell>
                <Switch checked={s.isOccupied} onChange={() => handleSlotToggle(s)}/>
                {s.isOccupied ? "Occupied" : "Free"}
              </TableCell>
              <TableCell>
                <Button onClick={() => handleSlotOpen(s)}>แก้ไข</Button>
                <Button color="error" onClick={() => handleSlotDelete(s._id)}>ลบ</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Dialogs */}
      <Dialog open={zoneOpen} onClose={() => setZoneOpen(false)}>
        <DialogTitle>{editingZone ? "แก้ไข Zone" : "เพิ่ม Zone"}</DialogTitle>
        <DialogContent>
          <TextField label="ชื่อ Zone" name="name" value={zoneForm.name} onChange={e => setZoneForm({...zoneForm, name: e.target.value})} fullWidth/>
          <TextField label="จำนวนช่อง" name="totalSlots" type="number" value={zoneForm.totalSlots} onChange={e => setZoneForm({...zoneForm, totalSlots: e.target.value})} fullWidth/>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setZoneOpen(false)}>ยกเลิก</Button>
          <Button variant="contained" onClick={handleZoneSave}>บันทึก</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={slotOpen} onClose={() => setSlotOpen(false)}>
        <DialogTitle>{editingSlot ? "แก้ไข Slot" : "เพิ่ม Slot"}</DialogTitle>
        <DialogContent>
          <TextField label="Number" type="number" value={slotForm.number} onChange={e => setSlotForm({...slotForm, number: e.target.value})} fullWidth/>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSlotOpen(false)}>ยกเลิก</Button>
          <Button variant="contained" onClick={handleSlotSave}>บันทึก</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
