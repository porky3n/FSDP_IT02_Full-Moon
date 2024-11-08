const express = require("express");
const router = express.Router();
const profileController = require("./profileController");
//const { verifyToken } = require("./authController"); // Middleware to verify JWT tokens

// Route to get user profile data
router.get("/", profileController.getProfile);

// Route to update user profile data
router.put("/", profileController.updateProfile);

module.exports = router;
