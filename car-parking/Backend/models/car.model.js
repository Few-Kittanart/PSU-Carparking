// models/car.model.js
const mongoose = require("mongoose");

const carSchema = new mongoose.Schema({
  car_registration: { type: String, required: true },
  car_registration_province: { type: String, required: true },
  brand_car: { type: String },
  model_car: { type: String },
  type_car: { type: String },
  color: { type: String },
  service_history: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ServiceHistory' }],
}, { timestamps: true }); // <-- เพิ่ม timestamps

module.exports = mongoose.model("Car", carSchema);
