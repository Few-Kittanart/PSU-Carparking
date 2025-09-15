// models/Car.js
const mongoose = require("mongoose");
const serviceHistorySchema = require('./serviceHistory.model').schema;

// กำหนด schema สำหรับข้อมูลรถแต่ละคัน
const carSchema = new mongoose.Schema({
  car_registration: { type: String, required: true },
  car_registration_province: { type: String, required: true },
  brand_car: { type: String },
  type_car: { type: String },
  color: { type: String },
  service_history: [serviceHistorySchema],
});

module.exports = mongoose.model("Car", carSchema);
