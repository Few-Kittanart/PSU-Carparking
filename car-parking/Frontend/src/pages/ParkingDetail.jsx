import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  TextField,
  Button,
  Paper,
  Grid,
} from "@mui/material";

export default function ParkingDetail() {
  const { id } = useParams();
  const [detail, setDetail] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`http://localhost:3000/api/parking/${id}`)
      .then((res) => res.json())
      .then((data) => setDetail(data));
  }, [id]);

  if (!detail) return <div>Loading...</div>;

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold text-[#ea7f33]">รายละเอียดการบริการ {detail.id}</h2>
      <Paper className="p-4 space-y-4">
        <Grid container spacing={2}>
          <Grid item xs={6}><TextField fullWidth label="รหัสลูกค้า" value={detail.customerId} InputProps={{ readOnly: true }} /></Grid>
          <Grid item xs={6}><TextField fullWidth label="ชื่อลูกค้า" value={detail.customerName} InputProps={{ readOnly: true }} /></Grid>
          <Grid item xs={6}><TextField fullWidth label="เบอร์โทรศัพท์" value={detail.phone} InputProps={{ readOnly: true }} /></Grid>
          <Grid item xs={6}><TextField fullWidth label="ทะเบียนรถ" value={detail.plate} InputProps={{ readOnly: true }} /></Grid>
          <Grid item xs={6}><TextField fullWidth label="จังหวัด" value={detail.province} InputProps={{ readOnly: true }} /></Grid>
          <Grid item xs={6}><TextField fullWidth label="ยี่ห้อ" value={detail.brand} InputProps={{ readOnly: true }} /></Grid>
          <Grid item xs={6}><TextField fullWidth label="สี" value={detail.color} InputProps={{ readOnly: true }} /></Grid>
          <Grid item xs={6}><TextField fullWidth label="รุ่น/ประเภท" value={detail.model} InputProps={{ readOnly: true }} /></Grid>
          <Grid item xs={6}><TextField fullWidth label="ลานจอดที่" value={detail.parkingLot} InputProps={{ readOnly: true }} /></Grid>
          <Grid item xs={6}><TextField fullWidth label="ช่องจอดที่" value={detail.parkingSlot} InputProps={{ readOnly: true }} /></Grid>
          <Grid item xs={6}><TextField fullWidth label="วันที่เข้า" value={detail.dateIn} InputProps={{ readOnly: true }} /></Grid>
          <Grid item xs={6}><TextField fullWidth label="วันที่ออก" value={detail.dateOut} InputProps={{ readOnly: true }} /></Grid>
          <Grid item xs={12}><TextField fullWidth label="หมายเหตุ" value={detail.note} InputProps={{ readOnly: true }} /></Grid>
        </Grid>

        <div className="flex gap-4 mt-4">
          <Button variant="contained" color="success" onClick={() => alert("ไปหน้าชำระเงิน")}>ชำระเงิน</Button>
          <Button variant="outlined" onClick={() => navigate(-1)}>กลับ</Button>
        </div>
      </Paper>
    </div>
  );
}
