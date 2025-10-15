const Zone = require("../models/zone.model");
const ParkingSlot = require("../models/parkingSlot.model");


// ✅ ดึง Zone ทั้งหมด
exports.getZones = async (req, res) => {
  try {
    const zones = await Zone.find();
    res.json(zones);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createZone = async (req, res) => {
  try {
    const { name, totalSlots } = req.body;

    // 🔹 เช็คชื่อ Zone ซ้ำ
    const existing = await Zone.findOne({ name });
    if (existing) {
      return res.status(400).json({ message: `Zone "${name}" มีอยู่แล้ว` });
    }

    // 🔹 สร้าง Zone
    const newZone = new Zone({ name, totalSlots });
    await newZone.save();

    // 🔹 สร้าง ParkingSlot ตามจำนวน totalSlots
    const slots = [];
    for (let i = 1; i <= totalSlots; i++) {
      slots.push({ zone: newZone._id, number: i });
    }
    await ParkingSlot.insertMany(slots);

    res.status(201).json({
      message: `Zone "${name}" ถูกสร้างพร้อมช่องจอด ${totalSlots} ช่อง`,
      zone: newZone,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};


// ✅ แก้ไข Zone
exports.updateZone = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, totalSlots } = req.body;

    const zone = await Zone.findById(id);
    if (!zone) return res.status(404).json({ message: "Zone not found" });

    // อัปเดตชื่อและจำนวนช่อง
    zone.name = name ?? zone.name;
    const oldTotal = zone.totalSlots;
    zone.totalSlots = totalSlots ?? zone.totalSlots;
    await zone.save();

    // ✅ ถ้า totalSlots เพิ่มขึ้น → สร้างช่องเพิ่ม
    if (totalSlots > oldTotal) {
      const newSlots = [];
      for (let i = oldTotal + 1; i <= totalSlots; i++) {
        newSlots.push({ zone: zone._id, number: i });
      }
      await ParkingSlot.insertMany(newSlots);
    }

    // ✅ ถ้า totalSlots ลดลง → ลบช่องที่เกิน
    if (totalSlots < oldTotal) {
      await ParkingSlot.deleteMany({
        zone: zone._id,
        number: { $gt: totalSlots }
      });
    }

    res.json({ message: "Zone updated successfully", zone });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};


// ✅ เปิด/ปิด Zone
exports.toggleZone = async (req, res) => {
  try {
    const { id } = req.params;
    const zone = await Zone.findById(id);
    if (!zone) return res.status(404).json({ message: "Zone not found" });

    zone.isActive = !zone.isActive;
    await zone.save();
    res.json(zone);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ✅ ลบ Zone
exports.deleteZone = async (req, res) => {
  try {
    const { id } = req.params;
    await Zone.findByIdAndDelete(id);
    res.json({ message: "Zone deleted" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
