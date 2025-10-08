const express = require("express");
const router = express.Router();
const parkingSlotController = require("../controllers/parkingSlot.controller");

router.get("/", parkingSlotController.getAllParkingSlots);
router.post("/", parkingSlotController.createParkingSlot);
router.put("/:id", parkingSlotController.updateParkingSlot);
router.delete("/:id", parkingSlotController.deleteParkingSlot);

module.exports = router;
