const pool = require("../../dbConfig");

exports.getChildren = async (req, res) => {
  const accountId = req.session.accountId;
  if (!accountId) {
    return res.status(401).json({ message: "Unauthorized access" });
  }

  try {
    const [children] = await pool.query(
      `SELECT 
        c.ChildID,
        c.FirstName,
        c.LastName,
        c.DateOfBirth,
        c.Gender,
        c.School,
        c.EmergencyContactNumber,
        c.Dietary,
        c.ProfilePictureURL
      FROM Child c
      JOIN Parent p ON c.ParentID = p.ParentID
      WHERE p.AccountID = ?`,
      [accountId]
    );

    res.json(children);
  } catch (error) {
    console.error("Error fetching children:", error);
    res.status(500).json({
      message: "Error fetching children",
      error: error.message,
    });
  }
};

// Add endpoint to get a single child
exports.getChild = async (req, res) => {
  const accountId = req.session.accountId;
  if (!accountId) {
    return res.status(401).json({ message: "Unauthorized access" });
  }

  try {
    const childId = req.params.id;

    const [children] = await pool.query(
      `SELECT 
        c.ChildID,
        c.FirstName,
        c.LastName,
        c.DateOfBirth,
        c.Gender,
        c.School,
        c.EmergencyContactNumber,
        c.Dietary,
        c.ProfilePictureURL
      FROM Child c
      JOIN Parent p ON c.ParentID = p.ParentID
      WHERE p.AccountID = ? AND c.ChildID = ?`,
      [accountId, childId]
    );

    if (children.length === 0) {
      return res.status(404).json({ message: "Child not found" });
    }

    res.json(children[0]);
  } catch (error) {
    console.error("Error fetching child:", error);
    res.status(500).json({
      message: "Error fetching child",
      error: error.message,
    });
  }
};

exports.addChild = async (req, res) => {
  const accountId = req.session.accountId;
  if (!accountId) {
    return res.status(401).json({ message: "Unauthorized access" });
  }

  try {
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

    // Get parent ID from account ID
    const [parentResult] = await pool.query(
      "SELECT ParentID FROM Parent WHERE AccountID = ?",
      [accountId]
    );

    if (parentResult.length === 0) {
      return res.status(404).json({ message: "Parent record not found" });
    }

    const [result] = await pool.query(
      `INSERT INTO Child (
        FirstName,
        LastName,
        DateOfBirth,
        Gender,
        School,
        EmergencyContactNumber,
        Dietary,
        ProfilePictureURL,
        ParentID
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        firstName,
        lastName,
        dob,
        gender,
        school,
        emergencyContactNumber,
        dietary,
        profilePicture,
        parentResult[0].ParentID,
      ]
    );

    res.status(201).json({
      message: "Child added successfully",
      childId: result.insertId,
    });
  } catch (error) {
    console.error("Error adding child:", error);
    res.status(500).json({
      message: "Error adding child",
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

    await pool.query(
      `UPDATE Child SET
        FirstName = ?,
        LastName = ?,
        DateOfBirth = ?,
        Gender = ?,
        School = ?,
        EmergencyContactNumber = ?,
        Dietary = ?,
        ProfilePictureURL = ?
      WHERE ChildID = ?`,
      [
        firstName,
        lastName,
        dob,
        gender,
        school,
        emergencyContactNumber,
        dietary,
        profilePicture,
        childId,
      ]
    );

    res.json({ message: "Child updated successfully" });
  } catch (error) {
    console.error("Error updating child:", error);
    res.status(500).json({
      message: "Error updating child",
      error: error.message,
    });
  }
};

exports.deleteChild = async (req, res) => {
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
        .json({ message: "Not authorized to delete this child" });
    }

    await pool.query("DELETE FROM Child WHERE ChildID = ?", [childId]);
    res.json({ message: "Child deleted successfully" });
  } catch (error) {
    console.error("Error deleting child:", error);
    res.status(500).json({
      message: "Error deleting child",
      error: error.message,
    });
  }
};
