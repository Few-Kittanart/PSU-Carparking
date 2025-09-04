const User = require('../models/user.model');
const bcrypt = require('bcryptjs');

// Create User
exports.createUser = async (req, res) => {
  try {
    const { username, password, first_name, last_name, phone_number_user, role, department } = req.body;

    // เข้ารหัส password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newUser = new User({
      username,
      password: hashedPassword,
      first_name,
      last_name,
      phone_number_user,
      role,
      department
    });

    await newUser.save();
    res.status(201).json({ message: 'User created successfully', user: newUser });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Read All Users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password'); // ไม่ส่ง password กลับ
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Read User by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update User by ID
exports.updateUser = async (req, res) => {
  try {
    const { username, password, first_name, last_name, phone_number_user, role, department } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // อัปเดต fields
    if (username) user.username = username;
    if (password) user.password = await bcrypt.hash(password, 10);
    if (first_name) user.first_name = first_name;
    if (last_name) user.last_name = last_name;
    if (phone_number_user) user.phone_number_user = phone_number_user;
    if (role) user.role = role;
    if (department) user.department = department;

    await user.save();
    res.json({ message: 'User updated successfully', user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete User by ID
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
