// /modules/auth/authRoutes.js
const express = require('express');
const passport = require('./passportConfig'); // Import Google OAuth setup
const router = express.Router();
const authController = require('./authController');
const jwt = require("jsonwebtoken");

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

// Google OAuth routes
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/auth/login" }),
  (req, res) => {
    const accountId = req.user.AccountID;

    if (accountId) {
      req.session.accountId = accountId; // Save accountId to session
      req.session.firstName = req.user.firstName; // Save user's first name to session for easy access
      res.redirect(`/index.html`);
    } else {
      res.redirect("/auth/login");
    }
  }
);



// Logout Google session
router.get('/logout', authController.logout);


module.exports = router;

