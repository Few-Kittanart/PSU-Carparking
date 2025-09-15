const ServiceHistory = require('../models/serviceHistory.model');

// สร้าง service history ใหม่
exports.createServiceHistory = async (req, res) => {
  try {
    const service = new ServiceHistory(req.body);
    await service.save();
    res.status(201).json(service);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ดึง service history ทั้งหมด
exports.getAllServiceHistories = async (req, res) => {
  try {
    const services = await ServiceHistory.find();
    res.json(services);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ดึง service history ตาม ID
exports.getServiceHistoryById = async (req, res) => {
  try {
    const service = await ServiceHistory.findById(req.params.id);
    if (!service) return res.status(404).json({ error: 'Service history not found' });
    res.json(service);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// แก้ไข service history
exports.updateServiceHistory = async (req, res) => {
  try {
    const service = await ServiceHistory.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!service) return res.status(404).json({ error: 'Service history not found' });
    res.json(service);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ลบ service history
exports.deleteServiceHistory = async (req, res) => {
  try {
    const service = await ServiceHistory.findByIdAndDelete(req.params.id);
    if (!service) return res.status(404).json({ error: 'Service history not found' });
    res.json({ message: 'Service history deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
