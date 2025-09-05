const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  customer_id: { type: Number, unique: true, required: true }, // รหัสลูกค้า
  customer_name: { type: String, required: true }, // ชื่อ-นามสกุล
  phone_number: { type: String, required: true }, // เบอร์โทรศัพท์
  house_number: { type: String }, // บ้านเลขที่
  village: { type: String }, // หมู่บ้าน
  road: { type: String }, // ถนน
  canton: { type: String }, // ตำบล
  district: { type: String }, // อำเภอ
  province: { type: String }, // จังหวัด
  zip_code: { type: String }, // รหัสไปรษณีย์
  country: { type: String }, // ประเทศ
  car_registration: { type: String }, // ทะเบียน
  car_registration_province: { type: String }, // จังหวัดของทะเบียน
  brand_car: { type: String }, // ยี่ห้อ
  type_car: { type: String }, // รุ่น/ประเภท
  color: { type: String } // สี
});

module.exports = mongoose.model('Customer', customerSchema);
