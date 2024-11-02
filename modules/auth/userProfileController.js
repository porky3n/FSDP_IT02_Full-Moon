// userProfileController.js
const pool = require("../../dbConfig");

// Function to get user profile data
exports.getProfile = async (req, res) => {
  const accountId = req.session.accountId;

  if (!accountId) {
    return res.status(401).json({ message: "Unauthorized access" });
  }

  try {
    const [rows] = await pool.query(
      `
      SELECT a.Email, p.FirstName, p.LastName, p.ProfilePictureURL as ProfilePicture
      FROM Account a
      JOIN Parent p ON a.AccountID = p.AccountID
      WHERE a.AccountID = ? AND a.AccountType = 'P'
      `,
      [accountId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("Error fetching profile data:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Function to update profile picture
exports.updateProfilePicture = async (req, res) => {
  const accountId = req.session.accountId;
  const profilePicture = req.file?.filename; // Assuming you're using multer for file uploads

  if (!accountId) {
    return res.status(401).json({ message: "Unauthorized access" });
  }

  if (!profilePicture) {
    return res.status(400).json({ message: "No profile picture provided" });
  }

  try {
    await pool.query(
      `
      UPDATE Parent
      SET ProfilePictureURL = ?
      WHERE AccountID = ?
      `,
      [profilePicture, accountId]
    );

    res.json({
      message: "Profile picture updated successfully",
      profilePicture,
    });
  } catch (error) {
    console.error("Error updating profile picture:", error);
    res.status(500).json({
      message: "Failed to update profile picture",
      error: error.message,
    });
  }
};
