const User = require('../models/user.model');
const bcrypt = require('bcryptjs');

exports.createUser = async (req, res) => {
  try {
    const { username, password, first_name, last_name, phone_number_user, role, department } = req.body;

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
    res.json({ message: 'User created successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
