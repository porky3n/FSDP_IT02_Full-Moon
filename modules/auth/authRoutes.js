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

router.get('/logout', (req, res) => {
    req.session.destroy(err => {
      if (err) {
        return res.status(500).send('Failed to log out');
      }
      res.redirect('/'); // Redirect to home page or login page after logout
    });
  });

module.exports = router;

