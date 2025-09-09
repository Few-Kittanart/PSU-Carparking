// controllers/parkingRentController.js
const ParkingRent = require('../models/ParkingRent');

// ดึงเช่าที่จอดทั้งหมด พร้อม populate customer และ service
exports.getParkingRents = async (req, res) => {
  try {
    const rents = await ParkingRent.find()
      .populate({ path: 'customer', select: 'customer_name phone_number car_registration province brand_car' })
      .populate({ path: 'service', select: 'service_name service_price' });
    res.json(rents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ดึงเช่าที่จอดแถวเดียวตาม parking_rent_id
exports.getParkingRentById = async (req, res) => {
  try {
    const rent = await ParkingRent.findOne({ parking_rent_id: req.params.id })
      .populate({ path: 'customer', select: 'customer_name phone_number car_registration province brand_car' })
      .populate({ path: 'service', select: 'service_name service_price' });
    if (!rent) return res.status(404).json({ message: 'ไม่พบข้อมูลเช่าที่จอด' });
    res.json(rent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// เพิ่มเช่าที่จอดใหม่
exports.createParkingRent = async (req, res) => {
  try {
    const rent = new ParkingRent(req.body);
    await rent.save();
    res.status(201).json(rent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// แก้ไขเช่าที่จอด
exports.updateParkingRent = async (req, res) => {
  try {
    const rent = await ParkingRent.findOneAndUpdate(
      { parking_rent_id: req.params.id },
      req.body,
      { new: true }
    );
    if (!rent) return res.status(404).json({ message: 'ไม่พบข้อมูลเช่าที่จอด' });
    res.json(rent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ลบเช่าที่จอด
exports.deleteParkingRent = async (req, res) => {
  try {
    const rent = await ParkingRent.findOneAndDelete({ parking_rent_id: req.params.id });
    if (!rent) return res.status(404).json({ message: 'ไม่พบข้อมูลเช่าที่จอด' });
    res.json({ message: 'ลบข้อมูลเช่าที่จอดเรียบร้อยแล้ว' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
