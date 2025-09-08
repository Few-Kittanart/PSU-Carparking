const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  service_id: Number,
  service_name: String,
  service_price: Number,
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' } // FK ไป customer
});

module.exports = mongoose.model('Service', serviceSchema);
