const mongoose = require('mongoose');

const additionalServiceSchema = new mongoose.Schema({
    id: { type: Number, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
});

const priceSchema = new mongoose.Schema({
    dailyRate: { type: Number, default: 0 },
    hourlyRate: { type: Number, default: 0 },
    additionalServices: [additionalServiceSchema],
});

module.exports = mongoose.model('Price', priceSchema);