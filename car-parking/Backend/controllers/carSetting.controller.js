const CarSetting = require('../models/carSetting.model.js');
const mongoose = require('mongoose');

exports.getCarSettings = async (req, res) => {
    try {
        const settings = await CarSetting.findOne(); 
        if (!settings) {
            return res.json({ brands: [], models: [], types: [], colors: [] });
        }
        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.addBrand = async (req, res) => {
    const { name } = req.body;
    try {
        const newId = new mongoose.Types.ObjectId();
        const result = await CarSetting.findOneAndUpdate(
            {}, 
            { $push: { brands: { name, _id: newId } } },
            { new: true, upsert: true }
        );
        res.status(201).json(result.brands.find(b => b._id.equals(newId))); 
    } catch (error) {
        res.status(400).json({ message: 'Error adding brand. Name might be duplicated or database error.', error: error.message });
    }
};

exports.deleteBrand = async (req, res) => {
    const { id } = req.params; // brandId
    try {
        await CarSetting.findOneAndUpdate(
            {}, 
            { $pull: { 
                brands: { _id: id },
                models: { brandId: id }
            } }
        );
        res.status(200).json({ message: 'Brand and associated models deleted successfully.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.addModel = async (req, res) => {
    const { name, brandId } = req.body;
    try {
        const newId = new mongoose.Types.ObjectId();
        const result = await CarSetting.findOneAndUpdate(
            {}, 
            { $push: { models: { name, brandId, _id: newId } } },
            { new: true }
        );
        res.status(201).json(result.models.find(m => m._id.equals(newId)));
    } catch (error) {
        res.status(400).json({ message: 'Error adding model.', error: error.message });
    }
};

exports.deleteModel = async (req, res) => {
    const { id } = req.params;
    try {
        await CarSetting.findOneAndUpdate(
            {}, 
            { $pull: { models: { _id: id } } }
        );
        res.status(200).json({ message: 'Model deleted successfully.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.addType = async (req, res) => {
    const { name } = req.body;
    try {
        const newId = new mongoose.Types.ObjectId();
        const result = await CarSetting.findOneAndUpdate(
            {}, 
            { $push: { types: { name, _id: newId } } },
            { new: true }
        );
        res.status(201).json(result.types.find(t => t._id.equals(newId)));
    } catch (error) {
        res.status(400).json({ message: 'Error adding type.', error: error.message });
    }
};

exports.deleteType = async (req, res) => {
    const { id } = req.params;
    try {
        await CarSetting.findOneAndUpdate(
            {}, 
            { $pull: { types: { _id: id } } }
        );
        res.status(200).json({ message: 'Type deleted successfully.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.addColor = async (req, res) => {
    const { name, hex_code } = req.body;
    try {
        const newId = new mongoose.Types.ObjectId();
        const result = await CarSetting.findOneAndUpdate(
            {}, 
            { $push: { colors: { name, hex_code, _id: newId } } },
            { new: true }
        );
        res.status(201).json(result.colors.find(c => c._id.equals(newId)));
    } catch (error) {
        res.status(400).json({ message: 'Error adding color.', error: error.message });
    }
};

exports.deleteColor = async (req, res) => {
    const { id } = req.params;
    try {
        await CarSetting.findOneAndUpdate(
            {}, 
            { $pull: { colors: { _id: id } } }
        );
        res.status(200).json({ message: 'Color deleted successfully.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};