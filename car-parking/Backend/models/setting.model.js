// src/models/setting.model.js

const mongoose = require("mongoose");

const settingSchema = new mongoose.Schema(
  {
    systemName: { type: String, default: "" },
    description: { type: String, default: "" },
    companyName: { type: String, default: "" },
    website: { type: String, default: "" },
    phoneNumber: { type: String, default: "" },
    fax: { type: String, default: "" },
    email: { type: String, default: "" },
    systemUrl: { type: String, default: "" },
    taxId: { type: String, default: "" },
    address: {
      number: { type: String, default: "" },
      moo: { type: String, default: "" },
      street: { type: String, default: "" },
      tambon: { type: String, default: "" },
      amphoe: { type: String, default: "" },
      province: { type: String, default: "" },
      zipcode: { type: String, default: "" },
      country: { type: String, default: "" },
    },
    bank1: {
      show: { type: Boolean, default: false },
      accountName: { type: String, default: "" },
      bankName: { type: String, default: "" },
      accountNumber: { type: String, default: "" },
      showQrCode: { type: Boolean, default: false },
      qrCodeImage: { type: String, default: null },
    },
    bank2: {
      show: { type: Boolean, default: false },
      accountName: { type: String, default: "" },
      bankName: { type: String, default: "" },
      accountNumber: { type: String, default: "" },
      showQrCode: { type: Boolean, default: false },
      qrCodeImage: { type: String, default: null },
    },
    promptPay: {
      show: { type: Boolean, default: false },
      accountName: { type: String, default: "" },
      promptPayNumber: { type: String, default: "" },
    },
    creditCard: {
      show: { type: Boolean, default: false },
      invoiceNumber: { type: String, default: "" },
    },
    sponsor: {
      name: { type: String, default: "" },
      website: { type: String, default: "" },
    },
    api: {
      clientId: { type: String, default: "" },
      redirectUri: { type: String, default: "" },
      clientSecret: { type: String, default: "" },
      useDeveloperToken: { type: Boolean, default: false },
      lineNotifyToken: { type: String, default: "" },
    },
    logo: {
      main: { type: String, default: null }, // เก็บเป็น Base64 หรือ URL
      sub: { type: String, default: null }, // เก็บเป็น Base64 หรือ URL
    },
  },
  { timestamps: true }
);

// ✅ แก้ไข: Export Mongoose Model โดยใช้ mongoose.model
module.exports = mongoose.model("Setting", settingSchema);