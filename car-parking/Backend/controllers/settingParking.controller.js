const SettingParking = require('../models/settingParking.model');

// ➕ Create
exports.createSettingParking = async (req, res) => {
  try {
    const settingParking = new SettingParking(req.body);
    await settingParking.save();
    res.status(201).json(settingParking);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// 📄 Get All
exports.getAllSettingParking = async (req, res) => {
  try {
    const settings = await SettingParking.find();
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🔍 Get By ID
exports.getSettingParkingById = async (req, res) => {
  try {
    const settingParking = await SettingParking.findById(req.params.id);
    if (!settingParking) return res.status(404).json({ error: 'SettingParking not found' });
    res.json(settingParking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✏️ Update
exports.updateSettingParking = async (req, res) => {
  try {
    const settingParking = await SettingParking.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!settingParking) return res.status(404).json({ error: 'SettingParking not found' });
    res.json(settingParking);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// 🗑 Delete
exports.deleteSettingParking = async (req, res) => {
  try {
    const settingParking = await SettingParking.findByIdAndDelete(req.params.id);
    if (!settingParking) return res.status(404).json({ error: 'SettingParking not found' });
    res.json({ message: 'SettingParking deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
