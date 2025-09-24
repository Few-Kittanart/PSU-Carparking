const Customer = require('../models/customer.model');
const Car = require('../models/car.model');
const ServiceHistory = require('../models/serviceHistory.model');

// สร้างลูกค้าใหม่
exports.createCustomer = async (req, res) => {
  try {
    const customer = new Customer(req.body);
    await customer.save();
    res.status(201).json(customer);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ดึงลูกค้าทั้งหมด
exports.getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.find().populate({
      path: "cars",
      populate: { path: "service_history" }
    });
    res.json(customers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ดึงลูกค้าตาม ID
exports.getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id).populate('cars');
    
    if (!customer) return res.status(404).json({ error: 'Customer not found' });
    res.json(customer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// แก้ไขลูกค้า
exports.updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!customer) return res.status(404).json({ error: 'Customer not found' });
    res.json(customer);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ลบลูกค้า
exports.deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) return res.status(404).json({ error: 'Customer not found' });
    res.json({ message: 'Customer deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getUnpaidServices = async (req, res) => {
  try {
    // ดึงลูกค้า + รถ + service history
    const customers = await Customer.find()
      .populate({
        path: 'cars',
        populate: {
          path: 'service_history',
          match: { is_paid: false }
        }
      });

    // filter เอาเฉพาะ service ที่ unpaid
    const unpaid = [];
    console.log(JSON.stringify(customers, null, 2));
    customers.forEach((customer) => {
      customer.cars.forEach((car) => {
        car.service_history.forEach((service) => {
          unpaid.push({
            customer_id: customer._id,
            customer_name: customer.customer_name,
            phone_number: customer.phone_number,
            car_id: car._id, 
            car_registration: car.car_registration,
            brand_car: car.brand_car,
            service_id: service._id,
            entry_time: service.entry_time,
            parking_slot: service.parking_slot,
            services: service.services,
            total_price: service.total_price,
          });
        });
      });
    });

    res.json(unpaid);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

exports.getServiceDetail = async (req, res) => {
  try {
    const { customerId, carId, serviceId } = req.params;

    const customer = await Customer.findById(customerId).populate({
      path: "cars",
      match: { _id: carId },
      populate: { path: "service_history" },
    });

    if (!customer) return res.status(404).json({ error: "Customer not found" });

    const car = customer.cars[0];
    if (!car) return res.status(404).json({ error: "Car not found" });

    const service = car.service_history.find(
      (s) => s._id.toString() === serviceId
    );
    if (!service) return res.status(404).json({ error: "Service not found" });

    res.json({ customer, car, serviceHistory: service });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

exports.payService = async (req, res) => {
  try {
    const { serviceId } = req.params;

    // ดึง service history ตาม id
    const service = await ServiceHistory.findById(serviceId);
    if (!service) return res.status(404).json({ error: "Service not found" });

    // อัปเดตสถานะชำระเงิน
    service.is_paid = true;
    await service.save();

    res.json({
      message: "ชำระเงินเรียบร้อยแล้ว",
      service,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

exports.getCustomerWithServiceHistory = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id).populate({
      path: "cars",
      populate: { path: "service_history" }
    });

    if (!customer) return res.status(404).json({ error: "Customer not found" });

    // รวม service history ทั้งหมดจากรถทุกคัน
    const serviceHistories = [];
    customer.cars.forEach((car) => {
      car.service_history.forEach((service) => {
        serviceHistories.push({
          serviceId: service._id,
          carId: car._id,
          carRegistration: car.car_registration,
          brandCar: car.brand_car,
          entry_time: service.entry_time,
          exit_time: service.exit_time,
          parking_slot: service.parking_slot,
          services: service.services,
          total_price: service.total_price,
          is_paid: service.is_paid,
        });
      });
    });

    res.json({ customer, serviceHistories });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
