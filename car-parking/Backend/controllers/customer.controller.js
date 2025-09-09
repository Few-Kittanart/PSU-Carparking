// customer.controller.js
const Customer = require("../models/customer.model");
const Counter = require("../models/counter.model");

// สร้างลูกค้าใหม่
exports.createCustomer = async (req, res) => {
  try {
    const counter = await Counter.findByIdAndUpdate(
      { _id: "customer_id" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    const newCustomer = new Customer({
      customer_id: counter.seq,
      customer_name: req.body.customer_name,
      phone_number: req.body.phone_number,
      house_number: req.body.house_number,
      village: req.body.village,
      road: req.body.road,
      canton: req.body.canton,
      district: req.body.district,
      province: req.body.province,
      zip_code: req.body.zip_code,
      country: req.body.country,
      car_registration: req.body.car_registration,
      car_registration_province: req.body.car_registration_province,
      brand_car: req.body.brand_car,
      type_car: req.body.type_car,
      color: req.body.color,
      services: req.body.services,
      entry_time: req.body.entry_time,
      exit_time: req.body.exit_time,
      parking_slot: req.body.parking_slot, // <-- เพิ่มบรรทัดนี้
    });

    const saved = await newCustomer.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ดึงลูกค้าทั้งหมด
exports.getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find();
    res.json(customers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ดึงลูกค้าตาม id
exports.getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findOne({ customer_id: req.params.id });
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    res.json(customer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// อัปเดตลูกค้า
exports.updateCustomer = async (req, res) => {
  try {
    const updated = await Customer.findOneAndUpdate(
      { customer_id: req.params.id },
      req.body,
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Customer not found" });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ลบลูกค้า
exports.deleteCustomer = async (req, res) => {
  try {
    const deleted = await Customer.findOneAndDelete({ customer_id: req.params.id });
    if (!deleted) return res.status(404).json({ message: "Customer not found" });
    res.json({ message: "Customer deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};