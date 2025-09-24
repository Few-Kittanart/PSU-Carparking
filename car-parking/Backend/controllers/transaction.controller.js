const Transaction = require('../models/transaction.model');
const ServiceHistory = require('../models/serviceHistory.model');

// สร้าง transaction
exports.createTransaction = async (req, res) => {
  try {
    const transaction = new Transaction(req.body);
    await transaction.save();
    res.status(201).json(transaction);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ดึง transaction ทั้งหมด
exports.getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate('customer')
      .populate('car')
      .populate('serviceHistory');
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// transaction.controller.js
exports.getTransactionById = async (req, res) => {
  console.log("Fetching transaction ID:", req.params.id);
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate('customer')
      .populate('car')
      .populate('serviceHistory');
    if (!transaction) return res.status(404).json({ error: 'Transaction not found' });
    res.json(transaction);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};


// แก้ไข transaction
exports.updateTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!transaction) return res.status(404).json({ error: 'Transaction not found' });
    res.json(transaction);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ลบ transaction
exports.deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findByIdAndDelete(req.params.id);
    if (!transaction) return res.status(404).json({ error: 'Transaction not found' });
    res.json({ message: 'Transaction deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.payTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) return res.status(404).json({ error: 'Transaction not found' });

    // อัพเดต serviceHistory.is_paid เป็น true
    const serviceHistory = await ServiceHistory.findById(transaction.serviceHistory);
    if (!serviceHistory) return res.status(404).json({ error: 'ServiceHistory not found' });

    serviceHistory.is_paid = true;
    await serviceHistory.save();

    res.json({
      message: 'ชำระเงินเรียบร้อยแล้ว',
      transaction
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
