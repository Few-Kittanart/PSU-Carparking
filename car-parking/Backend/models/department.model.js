const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  department_id: { type: Number, unique: true, required: true },
  department_name: { type: String, required: true }
});

module.exports = mongoose.model('Department', departmentSchema);
