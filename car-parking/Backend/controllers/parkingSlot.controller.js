// controllers/parkingSlot.controller.js
const ParkingSlot = require("../models/parkingSlot.model");

exports.getParkingSlots = async (req, res) => {
  try {
    const slots = await ParkingSlot.find();
    res.json(slots);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.getAllParkingSlots = async (req, res) => {
  try {
    const slots = await ParkingSlot.find();
    res.json(slots); // ต้องเป็น array ของ slots
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// สร้างใหม่
exports.createParkingSlot = async (req, res) => {
  try {
    const { zone, number } = req.body;
    const slot = new ParkingSlot({ zone, number });
    await slot.save();
    res.status(201).json(slot);
  } catch (err) {
    if (err.code === 11000) {
      res.status(400).json({ message: "ช่องจอดซ้ำ" });
    } else {
      res.status(500).json({ message: err.message });
    }
  }
};

// ลบ
exports.deleteParkingSlot = async (req, res) => {
  try {
    const { id } = req.params;
    await ParkingSlot.findByIdAndDelete(id);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// อัปเดตสถานะ occupied
exports.updateParkingSlot = async (req, res) => {
  try {
    const { id } = req.params;
    const { isOccupied } = req.body;
    const slot = await ParkingSlot.findByIdAndUpdate(
      id,
      { isOccupied },
      { new: true }
    );
    res.json(slot);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
