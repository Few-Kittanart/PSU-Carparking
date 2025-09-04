const Customer = require('../models/customer.model');

// Create
exports.createCustomer = async (req, res) => {
  try {
    const newCustomer = new Customer(req.body);
    await newCustomer.save();
    res.json({ message: 'Customer created successfully', data: newCustomer });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Read All
exports.getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find();
    res.json(customers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Read by ID
exports.getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    res.json(customer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update
exports.updateCustomer = async (req, res) => {
  try {
    const updatedCustomer = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedCustomer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete
exports.deleteCustomer = async (req, res) => {
  try {
    await Customer.findByIdAndDelete(req.params.id);
    res.json({ message: 'Customer deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
