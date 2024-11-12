const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer();
const userProfileController = require("./userProfileController");

// Route to get user profile
router.get("/profile", userProfileController.getProfile);

// Route to update child information
router.put("/child/:id", userProfileController.updateChild);

// Route to update profile picture (using multer for file upload)
router.post(
  "/profile-picture",
  upload.single("profilePicture"),
  userProfileController.updateProfilePicture
);

// Route for logout
router.post("/logout", userProfileController.logout);

module.exports = router;
