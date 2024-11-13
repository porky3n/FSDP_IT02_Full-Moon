const pool = require("../../dbConfig");

exports.getProfile = async (req, res) => {
  try {
    // Check both session methods for authentication
    const accountId = req.session?.accountId;
    const userEmail = req.session?.user?.email;

    if (!accountId && !userEmail) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    let query;
    let params;

    if (accountId) {
      query = `
        SELECT 
          a.Email,
          p.FirstName,
          p.LastName,
          p.DateOfBirth,
          p.ContactNumber,
          p.Membership,
          p.Dietary,
          p.ProfilePicture
        FROM Account a
        LEFT JOIN Parent p ON a.AccountID = p.AccountID
        WHERE a.AccountID = ?
      `;
      params = [accountId];
    } else {
      query = `
        SELECT 
          a.Email,
          p.FirstName,
          p.LastName,
          p.DateOfBirth,
          p.ContactNumber,
          p.Membership,
          p.Dietary,
          p.ProfilePicture
        FROM Account a
        LEFT JOIN Parent p ON a.AccountID = p.AccountID
        WHERE a.Email = ?
      `;
      params = [userEmail];
    }

    const [accountResults] = await pool.query(query, params);

    if (!accountResults || accountResults.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    // Format the date to be more readable
    const formatDate = (dateStr) => {
      if (!dateStr) return "";
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    };

    // Format membership status
    const formatMembership = (membershipStatus) => {
      if (!membershipStatus) return "Not a Member";
      return membershipStatus === "Non-Member" ? "Not a Member" : "Member";
    };

    const profileData = {
      Email: accountResults[0].Email || "",
      FirstName: accountResults[0].FirstName || "",
      LastName: accountResults[0].LastName || "",
      DateOfBirth: formatDate(accountResults[0].DateOfBirth),
      ContactNumber: accountResults[0].ContactNumber || "",
      Membership: formatMembership(accountResults[0].Membership),
      Dietary: accountResults[0].Dietary || "",
      ProfilePicture: accountResults[0].ProfilePicture
        ? `data:image/jpeg;base64,${accountResults[0].ProfilePicture.toString(
            "base64"
          )}`
        : "/images/profilePicture.png",
    };

    res.status(200).json(profileData);
  } catch (error) {
    console.error("Error in getProfile:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving profile data",
      error: error.message,
    });
  }
};

exports.updateChild = async (req, res) => {
  const accountId = req.session.accountId;
  if (!accountId) {
    return res.status(401).json({ message: "Unauthorized access" });
  }

  try {
    const childId = req.params.id;

    // Verify this child belongs to the logged-in parent
    const [authorized] = await pool.query(
      `SELECT 1 FROM Child c
       JOIN Parent p ON c.ParentID = p.ParentID
       WHERE p.AccountID = ? AND c.ChildID = ?`,
      [accountId, childId]
    );

    if (authorized.length === 0) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this child" });
    }

    const {
      firstName,
      lastName,
      dob,
      gender,
      school,
      emergencyContactNumber,
      dietary,
      profilePicture,
    } = req.body;

    // Convert base64 string to Buffer if profilePicture exists and has changed
    let profilePictureBuffer = null;
    if (profilePicture && profilePicture.includes("base64")) {
      profilePictureBuffer = Buffer.from(
        profilePicture.split(",")[1],
        "base64"
      );
    }

    // Only update profile picture if a new one was provided
    const updateQuery = profilePictureBuffer
      ? `UPDATE Child SET
          FirstName = ?,
          LastName = ?,
          DateOfBirth = ?,
          Gender = ?,
          School = ?,
          EmergencyContactNumber = ?,
          Dietary = ?,
          ProfilePicture = ?
        WHERE ChildID = ?`
      : `UPDATE Child SET
          FirstName = ?,
          LastName = ?,
          DateOfBirth = ?,
          Gender = ?,
          School = ?,
          EmergencyContactNumber = ?,
          Dietary = ?
        WHERE ChildID = ?`;

    const queryParams = profilePictureBuffer
      ? [
          firstName,
          lastName,
          dob,
          gender,
          school,
          emergencyContactNumber,
          dietary,
          profilePictureBuffer,
          childId,
        ]
      : [
          firstName,
          lastName,
          dob,
          gender,
          school,
          emergencyContactNumber,
          dietary,
          childId,
        ];

    await pool.query(updateQuery, queryParams);

    // Fetch and return the updated child data
    const [updatedChild] = await pool.query(
      `SELECT * FROM Child WHERE ChildID = ?`,
      [childId]
    );

    if (updatedChild.length > 0) {
      const processedChild = {
        ...updatedChild[0],
        ProfilePicture: updatedChild[0].ProfilePicture
          ? updatedChild[0].ProfilePicture.toString("base64")
          : null,
        DateOfBirth: formatDate(updatedChild[0].DateOfBirth),
      };
      res.json({
        message: "Child updated successfully",
        child: processedChild,
      });
    } else {
      res.json({ message: "Child updated successfully" });
    }
  } catch (error) {
    console.error("Error updating child:", error);
    res.status(500).json({
      message: "Error updating child",
      error: error.message,
    });
  }
};

exports.updateProfilePicture = async (req, res) => {
  try {
    const userEmail = req.session?.user?.email;

    if (!userEmail) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    const profilePicture = req.file?.buffer;

    if (!profilePicture) {
      return res.status(400).json({ message: "No profile picture provided" });
    }

    await pool.query(
      `
      UPDATE Parent p
      JOIN Account a ON p.AccountID = a.AccountID
      SET p.ProfilePicture = ?
      WHERE a.Email = ?
      `,
      [profilePicture, userEmail]
    );

    res.json({
      success: true,
      message: "Profile picture updated successfully",
      profilePicture: `data:image/jpeg;base64,${profilePicture.toString(
        "base64"
      )}`,
    });
  } catch (error) {
    console.error("Error updating profile picture:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update profile picture",
      error: error.message,
    });
  }
};
exports.logout = async (req, res) => {
  try {
    // Destroy the session
    req.session.destroy((err) => {
      if (err) {
        console.error("Session destruction error:", err);
        return res.status(500).json({
          success: false,
          message: "Error during logout",
          error: err.message,
        });
      }

      // Clear the session cookie
      res.clearCookie("connect.sid", {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
      });

      res.status(200).json({
        success: true,
        message: "Logged out successfully",
      });
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      message: "Error during logout",
      error: error.message,
    });
  }
};
