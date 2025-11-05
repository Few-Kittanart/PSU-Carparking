const ParkingSlot = require("../models/parkingSlot.model");
const Zone = require("../models/zone.model");

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
    const { zoneId } = req.query; // ดึง zoneId จาก query parameter
    const filter = zoneId ? { zone: zoneId } : {}; // สร้าง object สำหรับกรอง ถ้ามี zoneId ให้กรองตาม zone

    // ใช้ filter ในการค้นหาข้อมูล
    const slots = await ParkingSlot.find(filter).populate("zone", "name totalSlots isActive");
    res.json(slots);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// สร้างใหม่
exports.createParkingSlot = async (req, res) => {
  try {
    const { zone, number } = req.body;

    const zoneExists = await Zone.findById(zone);
    if (!zoneExists) {
      return res.status(400).json({ message: "Zone not found" });
    }

    const slot = new ParkingSlot({ zone, number });
    await slot.save();
    res.status(201).json(slot);
  } catch (err) {
    if (err.code === 11000) {
      res.status(400).json({ message: "ช่องจอดซ้ำใน Zone นี้" });
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

exports.updateParkingSlot = async (req, res) => {
  try {
    const { id } = req.params;

    const slot = await ParkingSlot.findByIdAndUpdate(
      id,
      req.body,
      { new: true }
    );
    
    if (!slot) return res.status(404).json({ message: "Slot not found" });

    res.json(slot);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
