const Additional = require('../models/additional.model');

// Create Additional
exports.createAdditional = async (req, res) => {
  try {
    const additional = new Additional({
      additional_name: req.body.additional_name,
      additional_price: req.body.additional_price
    });
    await additional.save();
    res.status(201).json(additional);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get All Additionals
exports.getAdditionals = async (req, res) => {
  try {
    const additionals = await Additional.find();
    res.json(additionals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Additional by ID
exports.getAdditionalById = async (req, res) => {
  try {
    const additional = await Additional.findById(req.params.id);
    if (!additional) return res.status(404).json({ message: 'Additional not found' });
    res.json(additional);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Additional
exports.updateAdditional = async (req, res) => {
  try {
    const additional = await Additional.findByIdAndUpdate(
      req.params.id,
      {
        additional_name: req.body.additional_name,
        additional_price: req.body.additional_price
      },
      { new: true }
    );
    if (!additional) return res.status(404).json({ message: 'Additional not found' });
    res.json(additional);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete Additional
exports.deleteAdditional = async (req, res) => {
  try {
    const additional = await Additional.findByIdAndDelete(req.params.id);
    if (!additional) return res.status(404).json({ message: 'Additional not found' });
    res.json({ message: 'Additional deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
