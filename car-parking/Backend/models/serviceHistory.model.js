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

module.exports = mongoose.model('ServiceHistory', serviceHistorySchema);
