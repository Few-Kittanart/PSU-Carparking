const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// Create
router.post('/', verifyToken, userController.createUser);

// Read
router.get('/', verifyToken, userController.getAllUsers);
router.get('/:id', verifyToken, userController.getUserById);

// ✅ Update permissions (ใหม่)
router.put('/:id/permissions', verifyToken, userController.updateUserPermissions);

// Update user
router.put('/:id', verifyToken, userController.updateUser);

// Delete
router.delete('/:id', verifyToken, userController.deleteUser);

module.exports = router;
