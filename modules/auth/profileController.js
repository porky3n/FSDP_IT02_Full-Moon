const pool = require("../../dbConfig");
const fs = require("fs");

exports.getProfile = async (req, res) => {
  const accountId = req.session.accountId;

  if (!accountId) {
    return res.status(401).json({ message: "Unauthorized access" });
  }

  try {
    const [rows] = await pool.query(
      `
      SELECT p.FirstName, p.LastName, p.DateOfBirth, p.ContactNumber,
             a.Email, p.Dietary, p.ProfilePicture, p.AccountID
      FROM Parent p
      JOIN Account a ON p.AccountID = a.AccountID
      WHERE p.AccountID = ?
      `,
      [accountId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Profile not found" });
    }

    // Convert ProfilePicture buffer to base64 if it exists
    const profile = rows[0];
    if (profile.ProfilePicture) {
      profile.ProfilePicture = `data:image/jpeg;base64,${profile.ProfilePicture.toString(
        "base64"
      )}`;
    }

    res.json(profile);
  } catch (error) {
    console.error("Error fetching profile data:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  const accountId = req.session.accountId;
  const { firstName, lastName, email, contactNumber, dietary } = req.body;

  if (!accountId) {
    return res.status(401).json({ message: "Unauthorized access" });
  }

  try {
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Update Parent table
      const updateFields = {};

      if (firstName !== undefined) updateFields.FirstName = firstName;
      if (lastName !== undefined) updateFields.LastName = lastName;
      if (contactNumber !== undefined)
        updateFields.ContactNumber = contactNumber;
      if (dietary !== undefined) updateFields.Dietary = dietary;

      // Only proceed with update if there are fields to update
      if (Object.keys(updateFields).length > 0) {
        await connection.query("UPDATE Parent SET ? WHERE AccountID = ?", [
          updateFields,
          accountId,
        ]);
      }

      // Update email if provided
      if (email !== undefined) {
        await connection.query(
          "UPDATE Account SET Email = ? WHERE AccountID = ?",
          [email, accountId]
        );
      }

      await connection.commit();
      connection.release();

      res.json({
        message: "Profile updated successfully",
        data: {
          firstName,
          lastName,
          email,
          contactNumber,
          dietary,
        },
      });
    } catch (err) {
      await connection.rollback();
      connection.release();
      throw err;
    }
  } catch (error) {
    console.error("Error updating profile data:", error);
    res.status(500).json({
      message: "Database update failed",
      error: error.message,
    });
  }
};

// Add a separate endpoint for profile picture updates
exports.updateProfilePicture = async (req, res) => {
  const accountId = req.session.accountId;

  if (!accountId || !req.body.profilePicture) {
    return res.status(400).json({ message: "Missing required data" });
  }

  try {
    // Extract base64 data
    const base64Data = req.body.profilePicture.split(";base64,").pop();
    const profilePictureBuffer = Buffer.from(base64Data, "base64");

    await pool.query(
      "UPDATE Parent SET ProfilePicture = ? WHERE AccountID = ?",
      [profilePictureBuffer, accountId]
    );

    res.json({
      message: "Profile picture updated successfully",
      data: { profilePicture: req.body.profilePicture },
    });
  } catch (error) {
    console.error("Error updating profile picture:", error);
    res.status(500).json({
      message: "Failed to update profile picture",
      error: error.message,
    });
  }
};

exports.getProfilesByAccountId = async (req, res) => {
  const accountId = req.params.id;

  try {
    // Query to get the parent profile by account ID
    const [parentResult] = await pool.query(
      `
      SELECT ParentID AS ProfileID, FirstName, LastName, DateOfBirth, ContactNumber,
             Gender, Dietary, ProfilePicture
      FROM Parent
      WHERE AccountID = ?
      `,
      [accountId]
    );

    // If no parent profile is found, return a 404 error
    if (parentResult.length === 0) {
      return res.status(404).json({ error: "Parent profile not found" });
    }

    // Get the parent profile object
    const parentProfile = parentResult[0];

    // Convert ProfilePicture buffer to base64 if it exists
    if (parentProfile.ProfilePicture) {
      parentProfile.ProfilePicture = `data:image/jpeg;base64,${parentProfile.ProfilePicture.toString(
        "base64"
      )}`;
    }

    // Query to get child profiles linked to the parent
    const [childResults] = await pool.query(
      `
      SELECT ChildID AS ProfileID, FirstName, LastName, DateOfBirth, Gender,
             EmergencyContactNumber, School, Dietary, ProfilePicture
      FROM Child
      WHERE ParentID = ?
      `,
      [parentProfile.ProfileID]
    );

    // Convert ProfilePicture buffer to base64 for each child profile if it exists
    const childProfiles = childResults.map(child => {
      if (child.ProfilePicture) {
        child.ProfilePicture = `data:image/jpeg;base64,${child.ProfilePicture.toString("base64")}`;
      }
      return child;
    });

    // Respond with the parent and child profiles
    res.json({
      parentProfile,
      childProfiles,
    });
  } catch (error) {
    console.error("Error fetching profiles:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};