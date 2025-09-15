const Car = require('../models/car.model');

// สร้างรถใหม่
exports.createCar = async (req, res) => {
  try {
    const car = new Car(req.body);
    await car.save();
    res.status(201).json(car);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ดึงรถทั้งหมด
exports.getAllCars = async (req, res) => {
  try {
    const cars = await Car.find().populate('service_history');
    res.json(cars);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ดึงรถตาม ID
exports.getCarById = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id).populate('service_history');
    if (!car) return res.status(404).json({ error: 'Car not found' });
    res.json(car);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// แก้ไขรถ
exports.updateCar = async (req, res) => {
  try {
    const car = await Car.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!car) return res.status(404).json({ error: 'Car not found' });
    res.json(car);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ลบรถ
exports.deleteCar = async (req, res) => {
  try {
    const car = await Car.findByIdAndDelete(req.params.id);
    if (!car) return res.status(404).json({ error: 'Car not found' });
    res.json({ message: 'Car deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
