const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// Create
router.post('/', verifyToken, userController.createUser);

// Read
router.get('/', verifyToken, userController.getAllUsers);
router.get('/:id', verifyToken, userController.getUserById);

// Update
router.put('/:id', verifyToken, userController.updateUser);

// Delete
router.delete('/:id', verifyToken, userController.deleteUser);

module.exports = router;
