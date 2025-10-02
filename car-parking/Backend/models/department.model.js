const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  department_name: { type: String, required: true },
  permissions: [{ type: String }] // ✅ เพิ่มฟิลด์เก็บสิทธิ์การเข้าถึง
});

module.exports = mongoose.model('Department', departmentSchema);
