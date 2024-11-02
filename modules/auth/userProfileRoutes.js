// userProfileRoutes.js
const express = require("express");
const router = express.Router();
const multer = require("multer"); // For handling file uploads
const userProfileController = require("./userProfileController");

// Configure multer for profile picture uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/profile-pictures");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

// Route to get user profile data
router.get("/profile", userProfileController.getProfile);

// Route to update profile picture
router.post(
  "/profile/picture",
  upload.single("profilePicture"),
  userProfileController.updateProfilePicture
);

module.exports = router;
