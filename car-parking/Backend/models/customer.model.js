const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const customerSchema = new mongoose.Schema({
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

// ให้ customer_id รันอัตโนมัติ
customerSchema.plugin(AutoIncrement, { inc_field: 'customer_id' });

module.exports = mongoose.model('Customer', customerSchema);
