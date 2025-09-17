const express = require('express');
const router = express.Router();
const settingParkingController = require('../controllers/settingParking.controller');

router.post('/', settingParkingController.createSettingParking);
router.get('/', settingParkingController.getAllSettingParking);
router.get('/:id', settingParkingController.getSettingParkingById);
router.put('/:id', settingParkingController.updateSettingParking);
router.delete('/:id', settingParkingController.deleteSettingParking);

module.exports = router;
