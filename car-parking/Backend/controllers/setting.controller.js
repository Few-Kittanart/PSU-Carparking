// src/controllers/setting.controller.js

const Setting = require("../models/setting.model"); // ✅ ตรวจสอบว่าเส้นทางถูกต้อง

exports.getSettings = async (req, res) => {
  try {
    // ✅ เรียกใช้ findOne จาก Mongoose Model ที่ถูกต้อง
    const settings = await Setting.findOne();
    if (!settings) {
      return res.status(200).json({});
    }
    res.status(200).json(settings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.saveSettings = async (req, res) => {
  try {
    const settingsData = req.body;
    // ✅ เรียกใช้ findOneAndUpdate จาก Mongoose Model ที่ถูกต้อง
    const settings = await Setting.findOneAndUpdate({}, settingsData, {
      new: true,
      upsert: true,
    });
    res.status(200).json(settings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};