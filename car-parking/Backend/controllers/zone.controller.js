const Zone = require("../models/zone.model");

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

    // เช็คว่ามี zone ชื่อเดียวกันอยู่แล้วหรือไม่
    const existing = await Zone.findOne({ name });
    if (existing) {
      return res.status(400).json({ message: `Zone "${name}" มีอยู่แล้ว` });
    }

    const newZone = new Zone({ name, totalSlots });
    await newZone.save();
    res.status(201).json(newZone);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ✅ แก้ไข Zone
exports.updateZone = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, totalSlots } = req.body;

    // เช็คชื่อซ้ำ (ยกเว้นตัวเอง)
    const existing = await Zone.findOne({ name, _id: { $ne: id } });
    if (existing) {
      return res.status(400).json({ message: `Zone "${name}" มีอยู่แล้ว` });
    }

    const updated = await Zone.findByIdAndUpdate(
      id,
      { name, totalSlots },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Zone not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
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
