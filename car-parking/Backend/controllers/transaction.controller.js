const Transaction = require('../models/transaction.model');

// Create Transaction
exports.createTransaction = async (req, res) => {
  try {
    const transaction = new Transaction({
      date: req.body.date || Date.now(),
      customer: req.body.customer, // ObjectId ของ Customer
      carpark: req.body.carpark || null, // ObjectId ของ ParkingRent
      additional: req.body.additional || [], // Array ของ ObjectId Additional
      total_amount: req.body.total_amount || 0
    });

    await transaction.save();
    res.status(201).json(transaction);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get All Transactions with populated data
exports.getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate({ path: 'customer', select: 'customer_name phone_number house_number village road canton district province zip_code country car_registration car_registration_province brand_car type_car color' })
      .populate({ path: 'parkingRent', select: 'parking_zone parking_slot enter_date enter_time out_date out_time note' })
      .populate({ path: 'additional', select: 'additional_name additional_price' });

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Transaction by ID
exports.getTransactionById = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate({ path: 'customer', select: 'customer_name phone_number house_number village road canton district province zip_code country car_registration car_registration_province brand_car type_car color' })
      .populate({ path: 'parkingRent', select: 'parking_zone parking_slot enter_date enter_time out_date out_time note' })
      .populate({ path: 'additional', select: 'additional_name additional_price' });

    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
    res.json(transaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Transaction
exports.updateTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      {
        date: req.body.date,
        customer: req.body.customer,
        carpark: req.body.carpark || null,
        additional: req.body.additional || [],
        total_amount: req.body.total_amount
      },
      { new: true }
    );

    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
    res.json(transaction);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete Transaction
exports.deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findByIdAndDelete(req.params.id);
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
