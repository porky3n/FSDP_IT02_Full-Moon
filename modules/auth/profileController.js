const pool = require("../../dbConfig");

// Function to get user profile data
exports.getProfile = async (req, res) => {
  const accountId = req.session.accountId; // Retrieve account ID from session

  if (!accountId) {
    return res.status(401).json({ message: "Unauthorized access" });
  }

  try {
    const [rows] = await pool.query(
      `
      SELECT p.FirstName, p.LastName, p.DateOfBirth, p.ContactNumber, 
             a.Email, p.Dietary
      FROM Parent p
      JOIN Account a ON p.AccountID = a.AccountID
      WHERE p.AccountID = ?
    `,
      [accountId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("Error fetching profile data:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Function to update user profile data
exports.updateProfile = async (req, res) => {
  const accountId = req.session.accountId;
  const { firstName, lastName, email, contactNumber, dietary } = req.body;

  if (!accountId) {
    return res.status(401).json({ message: "Unauthorized access" });
  }

  try {
    // Start a transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Update Parent table
      await connection.query(
        `
          UPDATE Parent 
          SET FirstName = ?,
              LastName = ?,
              ContactNumber = ?,
              Dietary = ?
          WHERE AccountID = ?
          `,
        [firstName, lastName, contactNumber, dietary, accountId]
      );

      // Update Account table
      await connection.query(
        `
          UPDATE Account 
          SET Email = ?
          WHERE AccountID = ?
          `,
        [email, accountId]
      );

      // Commit the transaction
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
      // If error, rollback the transaction
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
