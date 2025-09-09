const mongoose = require('mongoose');

const additionalSchema = new mongoose.Schema({
  additional_id: Number,
  additional_name: String,
  additional_price: Number,
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' } // FK ไป customer
});

module.exports = mongoose.model('Additional', additionaleSchema);
