const express = require("express");
const router = express.Router();
const profileController = require("./profileController");

// Route to get user profile data
router.get("/", profileController.getProfile);

// Route to update user profile data
router.put("/", profileController.updateProfile);

// Route to update profile picture
router.put("/picture", profileController.updateProfilePicture);

module.exports = router;
