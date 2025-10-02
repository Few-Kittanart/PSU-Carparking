// models/customer.model.js
const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema({
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
  cars: [{ type: mongoose.Schema.Types.ObjectId, ref: "Car" }],
}, { timestamps: true }); // <-- เพิ่ม timestamps

module.exports = mongoose.model("Customer", customerSchema);
