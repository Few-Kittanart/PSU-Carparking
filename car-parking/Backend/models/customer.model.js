const mongoose = require("mongoose");

// กำหนด schema หลักสำหรับลูกค้า
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
});

const Customer = mongoose.model("Customer", customerSchema);
module.exports = Customer;
