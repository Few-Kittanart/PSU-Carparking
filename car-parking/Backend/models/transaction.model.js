const mongoose = require('mongoose');


const transactionSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now }, // วันที่ทำรายการ
  customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
  car: { type: mongoose.Schema.Types.ObjectId, ref: "Car", required: true },
  serviceHistory: { type: mongoose.Schema.Types.ObjectId, ref: "ServiceHistory", required: true },
  total_price: { type: Number, required: true },
  created_at: { type: Date, default: Date.now },
   payment_method: { 
    type: String, 
    enum: ['cash', 'qr'],
    default: 'cash'       
  }
});

module.exports = mongoose.model('Transaction', transactionSchema);
