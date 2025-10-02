// models/CarSetting.model.js

const mongoose = require('mongoose');

// --- Sub-Schemas (ใช้สำหรับโครงสร้างข้อมูลย่อย) ---

// 1. Schema สำหรับ ยี่ห้อรถ (Brand)
const BrandSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true }
}, { _id: true }); 

// 2. Schema สำหรับ รุ่นรถ (Model)
const ModelSchema = new mongoose.Schema({
    name: { type: String, required: true },
    brandId: { type: mongoose.Schema.Types.ObjectId, required: true } // ID ของ Brand ที่ฝังอยู่ใน Array 'brands'
}, { _id: true });

// 3. Schema สำหรับ ประเภทรถ (Type)
const TypeSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true }
}, { _id: true });

// 4. Schema สำหรับ สีรถ (Color)
const ColorSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    hex_code: { type: String } 
}, { _id: true });


// --- Main Schema: CarSetting ---
const CarSettingSchema = new mongoose.Schema({
    brands: [BrandSchema],
    models: [ModelSchema],
    types: [TypeSchema],
    colors: [ColorSchema],
}, { timestamps: true });


const CarSetting = mongoose.model('CarSetting', CarSettingSchema);

// ตรวจสอบและสร้างเอกสารเริ่มต้น (Master Document) หากยังไม่มี
CarSetting.findOne().then(doc => {
    if (!doc) {
        console.log('CarSetting master document not found. Creating a new one.');
        const initialDoc = new CarSetting({
            brands: [],
            models: [],
            types: [],
            colors: []
        });
        initialDoc.save();
    }
});

module.exports = CarSetting;