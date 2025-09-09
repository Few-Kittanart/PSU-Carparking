// routes/additionalRoutes.js
const express = require('express');
const router = express.Router();
const additionalController = require('../controllers/additional.controller');

// Create
router.post('/', additionalController.createAdditional);

// Read All
router.get('/', additionalController.getAdditionals);

// Read One
router.get('/:id', additionalController.getAdditionalById);

// Update
router.put('/:id', additionalController.updateAdditional);

// Delete
router.delete('/:id', additionalController.deleteAdditional);

module.exports = router;
