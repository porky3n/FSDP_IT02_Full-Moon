// /modules/auth/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('./authController');

// POST /auth/signup - Handle signup requests
router.post('/signup', authController.signup);

// POST /auth/login - Handle login requests
router.post('/login', authController.login);

// POST /auth/admin-login - Handle the admin login route
router.post('/admin-login', authController.adminLogin);

// GET /auth/get-users - Get users data
router.get('/get-users', authController.getUsers);

// Handle parent deletion
router.delete('/delete-parent', authController.deleteParent);

// Handle child deletion
router.delete('/delete-child/:id', authController.deleteChild);

// Handle parent update
router.put('/update-parent/:id', authController.updateParent);

// Handle child update
router.put('/update-child/:id', authController.updateChild);

// Get parent by ID
router.get('/get-parent/:id', authController.getParentById);

// Get child by ID
router.get('/get-child/:id', authController.getChildById);

// GET /auth/check-session - Check session and return user details
router.get('/check-session', authController.checkSession);

// GET - Check session and log out
router.get('/logout', authController.logout);

module.exports = router;

