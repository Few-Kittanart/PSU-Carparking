//// zone.model.js
const mongoose = require("mongoose");

const zoneSchema = new mongoose.Schema({
  name: { type: String, required: true },
  totalSlots: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model("Zone", zoneSchema);
