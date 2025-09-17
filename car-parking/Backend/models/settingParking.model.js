const mongoose = require('mongoose');

const settingParkingSchema = new mongoose.Schema({
  parking_slot: { type: String, required: true, unique: true }, // เช่น A-20
  parking_zone: { type: String, required: true }                // เช่น โซนA
});

module.exports = mongoose.model('SettingParking', settingParkingSchema);
