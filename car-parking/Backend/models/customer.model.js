const mongoose = require('mongoose');

// กำหนด schema สำหรับประวัติการใช้บริการ
const serviceHistorySchema = new mongoose.Schema({
  services: { type: [Number], default: [] },
  entry_time: { type: String },
  exit_time: { type: String },
  parking_slot: { type: String },
  parking_price: { type: Number, default: 0 },
  day_park: { type: String },
  additional_price: { type: Number, default: 0 },
  total_price: { type: Number, default: 0 },
  is_paid: { type: Boolean, default: false },
});

// กำหนด schema สำหรับข้อมูลรถแต่ละคัน
const carSchema = new mongoose.Schema({
  car_registration: { type: String, required: true },
  car_registration_province: { type: String, required: true },
  brand_car: { type: String },
  type_car: { type: String },
  color: { type: String },
  service_history: [serviceHistorySchema],
});

// กำหนด schema หลักสำหรับลูกค้า
const customerSchema = new mongoose.Schema({
  customer_id: { type: Number, unique: true, required: true },
  customer_name: { type: String, required: true },
  phone_number: { type: String, required: true },
  house_number: { type: String },
  village: { type: String },
  road: { type: String },
  canton: { type: String },
  district: { type: String },
  province: { type: String },
  zip_code: { type: String },
  country: { type: String },
  cars: [carSchema],
});

const Customer = mongoose.model("Customer", customerSchema);
module.exports = Customer;