const Price = require('../models/price.model');

exports.getPrices = async (req, res) => {
    try {
        const prices = await Price.findOne({});
        if (!prices) {
            return res.status(200).json({
                dailyRate: 0,
                hourlyRate: 0,
                additionalServices: []
            });
        }
        res.status(200).json(prices);
    } catch (err) {
        res.status(500).json({ message: "Internal Server Error" });
    }
};

exports.updatePrices = async (req, res) => {
    try {
        const { dailyRate, hourlyRate, additionalServices } = req.body;
        
        let prices = await Price.findOne({});
        if (!prices) {
            prices = new Price({ dailyRate, hourlyRate, additionalServices });
        } else {
            prices.dailyRate = dailyRate;
            prices.hourlyRate = hourlyRate;
            prices.additionalServices = additionalServices;
        }

        const savedPrices = await prices.save();
        res.status(200).json(savedPrices);
    } catch (err) {
        res.status(500).json({ message: "Internal Server Error" });
    }
};