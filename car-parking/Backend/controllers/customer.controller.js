const Customer = require("../models/customer.model");
const Car = require("../models/car.model");
const ServiceHistory = require("../models/serviceHistory.model");
const ParkingSlot = require("../models/parkingSlot.model"); 
const Transaction = require("../models/transaction.model");
const Zone = require("../models/zone.model");

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
      populate: { path: "service_history" },
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
    const customer = await Customer.findById(req.params.id).populate({
      path: "cars",
      populate: { path: "service_history" },
    });

    if (!customer) return res.status(404).json({ error: "Customer not found" });
    res.json(customer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// แก้ไขลูกค้า
exports.updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!customer) return res.status(404).json({ error: "Customer not found" });
    res.json(customer);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ลบลูกค้า
exports.deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) return res.status(404).json({ error: "Customer not found" });
    res.json({ message: "Customer deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getUnpaidServices = async (req, res) => {
  try {
    const customers = await Customer.find().populate({
      path: "cars",
      populate: {
        path: "service_history",
        match: { is_paid: false },
      },
    });

    const unpaid = [];
    
    // ใช้ for...of เพื่อให้สามารถใช้ await ข้างในได้
    for (const customer of customers) {
      for (const car of customer.cars) {
        for (const service of car.service_history) {
          
          let parkingSlotName = null;
          // ค้นหาชื่อช่องจอดและโซน ถ้ามี
          if (service.parking_slot) {
            try {
              // ค้นหา slot โดยใช้ ID และ populate ชื่อ zone
              const slot = await ParkingSlot.findById(
                service.parking_slot
              ).populate("zone", "name");

              if (slot && slot.zone) {
                // ประกอบร่างเป็นชื่อสวยงาม เช่น "A-1"
                parkingSlotName = `${slot.zone.name}-${slot.number}`;
              } else {
                parkingSlotName = "N/A"; // ถ้าหาไม่เจอ
              }
            } catch (e) {
              console.error("Could not find parking slot:", service.parking_slot);
              parkingSlotName = "N/A";
            }
          }

          unpaid.push({
            customer_id: customer._id,
            customer_name: customer.customer_name,
            phone_number: customer.phone_number,
            car_id: car._id,
            car_registration: car.car_registration,
            service_id: service._id,
            entry_time: service.entry_time,
            parking_slot: parkingSlotName, // ✨ ส่งชื่อที่ประกอบแล้วไปแทน ID
            services: service.services,
            total_price: service.total_price,
          });
        }
      }
    }

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
    const { paymentMethod } = req.body; // ✨ รับค่า paymentMethod จาก body

    // 1. ดึงและอัปเดต Service History
    const service = await ServiceHistory.findById(serviceId);
    if (!service) return res.status(404).json({ error: "Service not found" });
    service.is_paid = true;
    await service.save();

    // 2. อัปเดต Parking Slot (ถ้ามี)
    if (service.parking_slot) {
      await ParkingSlot.findByIdAndUpdate(service.parking_slot, {
        isOccupied: false,
      });
    }

    // ✨ 3. อัปเดต Transaction ด้วยวิธีการชำระเงิน
    if (paymentMethod) {
      await Transaction.findOneAndUpdate(
        { serviceHistory: serviceId }, // ค้นหา Transaction จาก serviceId
        { payment_method: paymentMethod } // อัปเดต field payment_method
      );
    }

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
      populate: { path: "service_history" },
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
