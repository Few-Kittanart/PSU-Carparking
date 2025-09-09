const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

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
  car_registration: { type: String },
  car_registration_province: { type: String },
  brand_car: { type: String },
  type_car: { type: String },
  color: { type: String },
  services: { type: [Number], default: [] },
  entry_time: { type: String },
  exit_time: { type: String }, // <-- เพิ่มบรรทัดนี้
  parking_slot: { type: String },
});

module.exports = mongoose.model('Customer', customerSchema);
