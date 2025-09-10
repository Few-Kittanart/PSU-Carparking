const mongoose = require('mongoose');

const parkingRentSchema = new mongoose.Schema({
  parking_rent_id: Number,
  parking_zone: String, // เช่น A, B, C
  parking_slot: String, // เช่น A1, A2, B1
  enter_date: String,
  enter_time: String,
  out_date: String,
  out_time: String,
  note: String,
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' } // FK ไป customer
});

module.exports = mongoose.model('ParkingRent', parkingRentSchema);
