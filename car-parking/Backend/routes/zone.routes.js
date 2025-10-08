const express = require("express");
const router = express.Router();
const zoneCtrl = require("../controllers/zone.controller");

router.get("/", zoneCtrl.getZones);
router.post("/", zoneCtrl.createZone);
router.put("/:id", zoneCtrl.updateZone);
router.patch("/:id/toggle", zoneCtrl.toggleZone);
router.delete("/:id", zoneCtrl.deleteZone);

module.exports = router;
