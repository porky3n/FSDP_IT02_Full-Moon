const pool = require("../../dbConfig");

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

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
        c.ProfilePicture
      FROM Child c
      JOIN Parent p ON c.ParentID = p.ParentID
      WHERE p.AccountID = ?`,
      [accountId]
    );

    // Convert BLOB to base64 string if ProfilePicture exists and format date
    const processedChildren = children.map((child) => ({
      ...child,
      ProfilePicture: child.ProfilePicture
        ? child.ProfilePicture.toString("base64")
        : null,
      DateOfBirth: formatDate(child.DateOfBirth),
    }));

    res.json(processedChildren);
  } catch (error) {
    console.error("Error fetching children:", error);
    res.status(500).json({
      message: "Error fetching children",
      error: error.message,
    });
  }
};

exports.getChild = async (req, res) => {
  console.log("Getting child with ID:", req.params.id);
  console.log("Session accountId:", req.session.accountId);

  const accountId = req.session.accountId;
  if (!accountId) {
    console.log("No accountId found in session");
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
        c.ProfilePicture
      FROM Child c
      JOIN Parent p ON c.ParentID = p.ParentID
      WHERE p.AccountID = ? AND c.ChildID = ?`,
      [accountId, childId]
    );

    if (children.length === 0) {
      return res.status(404).json({ message: "Child not found" });
    }

    const child = children[0];
    child.ProfilePicture = child.ProfilePicture
      ? child.ProfilePicture.toString("base64")
      : null;
    child.DateOfBirth = formatDate(child.DateOfBirth);

    res.json(child);
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

    // Convert base64 string to Buffer if profilePicture exists
    const profilePictureBuffer = profilePicture
      ? Buffer.from(profilePicture.split(",")[1], "base64")
      : null;

    const [result] = await pool.query(
      `INSERT INTO Child (
        FirstName,
        LastName,
        DateOfBirth,
        Gender,
        School,
        EmergencyContactNumber,
        Dietary,
        ProfilePicture,
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
        profilePictureBuffer,
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

    // Convert base64 string to Buffer if profilePicture exists
    const profilePictureBuffer = profilePicture
      ? Buffer.from(profilePicture.split(",")[1], "base64")
      : null;

    await pool.query(
      `UPDATE Child SET
        FirstName = ?,
        LastName = ?,
        DateOfBirth = ?,
        Gender = ?,
        School = ?,
        EmergencyContactNumber = ?,
        Dietary = ?,
        ProfilePicture = ?
      WHERE ChildID = ?`,
      [
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
