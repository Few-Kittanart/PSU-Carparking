const Transaction = require('../models/transaction.model');

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
    const page = parseInt(req.query.page) || 1; // หน้าที่อยากดู (default = 1)
    const limit = parseInt(req.query.limit) || 10; // จำนวนต่อหน้า (default = 10)
    const skip = (page - 1) * limit;

    const transactions = await Transaction.find()
      .populate('customer')
      .populate('car')
      .populate('serviceHistory')
      .skip(skip)
      .limit(limit);
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

