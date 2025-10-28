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
    // 2. ค้นหาและอัปเดต ServiceHistory ด้วยข้อมูลใหม่จาก req.body
    // (ข้อมูลใหม่นี้ถูกส่งมาจาก DetailPage.jsx)
    const service = await ServiceHistory.findByIdAndUpdate(req.params.id, req.body, { new: true });
    
    if (!service) return res.status(404).json({ error: 'Service history not found' });

    // --- 🌟 3. ส่วนที่เพิ่มเข้ามา ---
    // (หลังจากอัปเดต ServiceHistory แล้ว)
    // ให้ไปค้นหา Transaction ที่เกี่ยวข้อง (โดยใช้ serviceId) 
    // แล้วอัปเดต total_price ใน Transaction ให้ตรงกันด้วย
    await Transaction.findOneAndUpdate(
      { serviceHistory: req.params.id }, // ค้นหา Transaction ที่มี serviceId นี้
      { total_price: service.total_price } // อัปเดต total_price ให้ตรงกับ service ที่เพิ่งแก้
    );
    
    // 4. ส่งข้อมูลที่อัปเดตแล้วกลับไป (เหมือนเดิม)
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
