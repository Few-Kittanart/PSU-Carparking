const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { verifyToken } = require('../middleware/auth.middleware');

router.post('/', verifyToken, userController.createUser);

module.exports = router;
