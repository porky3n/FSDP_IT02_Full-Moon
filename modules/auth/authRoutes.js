// /modules/auth/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('./authController');

// POST /auth/signup - Handle signup requests
router.post('/signup', authController.signup);

// POST /auth/login - Handle login requests
router.post('/login', authController.login);

// POST /auth/admin-login Handle the admin login route
router.post('/admin-login', authController.adminLogin);

router.get('/get-users', authController.getUsers);

module.exports = router;
