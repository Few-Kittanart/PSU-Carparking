const mongoose = require("mongoose");

const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // เช่น 'customer_id'
  seq: { type: Number, default: 0 },
});

module.exports = mongoose.model("Counter", counterSchema);
