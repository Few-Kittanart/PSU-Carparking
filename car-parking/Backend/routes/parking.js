const express = require("express");
const router = express.Router();
const { parkingList } = require("../data/mockData");

// ดึงรายการทั้งหมด
router.get("/", (req, res) => {
  res.json(parkingList);
});

// ดึงรายละเอียดตาม ID
router.get("/:id", (req, res) => {
  const { id } = req.params;
  const item = parkingList.find((p) => p.id === id);
  if (!item) return res.status(404).json({ message: "Not found" });
  res.json(item);
});

module.exports = router;
