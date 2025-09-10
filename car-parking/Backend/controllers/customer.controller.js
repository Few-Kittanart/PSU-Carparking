// customer.controller.js
const Customer = require("../models/customer.model");
const Counter = require("../models/counter.model");

exports.createOrUpdateCustomer = async (req, res) => {
  try {
    const { 
      customer_name, 
      phone_number,
      house_number,
      village,
      road,
      canton,
      district,
      province,
      zip_code,
      country,
      car
    } = req.body;

    let customer = await Customer.findOne({ customer_name, phone_number });
    
    const serviceData = {
        services: car.services,
        entry_time: car.entry_time,
        exit_time: car.exit_time,
        parking_slot: car.parking_slot,
        total_price: car.total_price,
    };

    const carData = {
        car_registration: car.car_registration,
        car_registration_province: car.car_registration_province,
        brand_car: car.brand_car,
        type_car: car.type_car,
        color: car.color,
        service_history: [serviceData]
    };

    if (customer) {
      const existingCar = customer.cars.find(c => c.car_registration === car.car_registration);
      if (existingCar) {
        existingCar.service_history.push(serviceData);
      } else {
        customer.cars.push(carData);
      }
      
      const updatedCustomer = await customer.save();
      res.status(200).json(updatedCustomer);
    } else {
      const counter = await Counter.findByIdAndUpdate(
        { _id: "customer_id" },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );

      const newCustomer = new Customer({
        customer_id: counter.seq,
        customer_name,
        phone_number,
        house_number,
        village,
        road,
        canton,
        district,
        province,
        zip_code,
        country,
        cars: [carData],
      });

      const savedCustomer = await newCustomer.save();
      res.status(201).json(savedCustomer);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find().lean();
    res.json(customers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findOne({ customer_id: req.params.id }).lean();
    if (!customer) return res.status(404).json({ message: "Customer not found" });
    res.json(customer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

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

exports.payService = async (req, res) => {
  try {
    const customer = await Customer.findOne({ customer_id: req.params.id });

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    for (const car of customer.cars) {
      const latestUnpaidService = car.service_history.find(
        (service) => service.is_paid === false
      );

      if (latestUnpaidService) {
        latestUnpaidService.is_paid = true;
        break;
      }
    }

    await customer.save();
    res.status(200).json({ message: "Payment successful", customer });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};