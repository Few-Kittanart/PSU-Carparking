const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now }, // วันที่ทำรายการ

  // อ้างอิงลูกค้า
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },

  // อ้างอิงที่จอดรถ
  carpark: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ParkingRent', // สมมติว่า model ของที่จอดคือ ParkingRent
    required: false // เผื่อบางครั้งไม่ได้จอด
  },

  // บริการเพิ่มเติม (หลายอันได้)
  additional: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Additional'
    }
  ],

  // รวมยอดเงินทั้งหมด
  total_amount: { type: Number, default: 0 }
});

module.exports = mongoose.model('Transaction', transactionSchema);
