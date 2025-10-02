// department.model.js
const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  department_name: { type: String, required: true },
  permissions: {  // <--- เพิ่มส่วนนี้
    type: [String],             
    default: []
  }
});

module.exports = mongoose.model('Department', departmentSchema);