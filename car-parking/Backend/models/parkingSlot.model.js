//// parkingSlot.model.js
const mongoose = require("mongoose");

const parkingSlotSchema = new mongoose.Schema(
  {
    zone: { type: mongoose.Schema.Types.ObjectId, ref: "Zone", required: true },
    number: { type: Number, required: true },        // หมายเลขช่องใน Zone
    isOccupied: { type: Boolean, default: false },   // จอดอยู่หรือไม่
  },
  { timestamps: true }
);

// ป้องกันซ้ำใน Zone เดียวกัน
parkingSlotSchema.index({ zone: 1, number: 1 }, { unique: true });

module.exports = mongoose.model("ParkingSlot", parkingSlotSchema);
