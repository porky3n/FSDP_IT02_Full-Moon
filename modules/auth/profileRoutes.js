const express = require("express");
const router = express.Router();
const profileController = require("./profileController");

// Route to get user profile data
router.get("/", profileController.getProfile);

// Route to update user profile data
router.put("/", profileController.updateProfile);

// Route to update profile picture
router.put("/picture", profileController.updateProfilePicture);

// Route to get parent and child profiles by account ID
router.get("/:id", profileController.getProfilesByAccountId);

module.exports = router;
