const pool = require("../../dbConfig");
const Account = require("../../models/accountModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.adminLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const account = await Account.findAccountByEmail(email);
    if (!account) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Check if the account type is 'A' (Admin)
    if (account.AccountType !== "A") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    const match = await bcrypt.compare(password, account.PasswordHashed);
    if (!match) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Set the session variable to indicate an admin login
    req.session.isAdmin = true;

    // Respond with JSON indicating a successful login
    res.status(200).json({ message: "Admin login successful" });
  } catch (error) {
    console.error("Error during admin login:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Handle signup
exports.signup = async (req, res) => {
  const { firstName, lastName, email, dob, phoneNumber, password } = req.body;

  try {
    // Check if account already exists
    const existingAccount = await Account.findAccountByEmail(email);
    if (existingAccount) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Begin a transaction to insert into Account and Parent tables
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Insert into Account table
      const [accountResult] = await connection.query(
        "INSERT INTO Account (Email, PasswordHashed, AccountType) VALUES (?, ?, ?)",
        [email, hashedPassword, "P"] // 'P' for Parent
      );

      // Get the generated AccountID for use in the Parent table
      const accountId = accountResult.insertId;

      // Insert into Parent table
      await connection.query(
        "INSERT INTO Parent (AccountID, FirstName, LastName, DateOfBirth, ContactNumber) VALUES (?, ?, ?, ?, ?)",
        [accountId, firstName, lastName, dob, phoneNumber]
      );

      // Commit the transaction
      await connection.commit();
      res.status(201).json({ message: "Account created successfully" });
    } catch (error) {
      // Rollback if any error occurs during the transaction
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error during signup:", error);
    res
      .status(500)
      .json({ message: "Error creating account", error: error.message });
  }
};

exports.login = async (req, res) => {
  console.log(req.body);
  const { email, password } = req.body;

  try {
    // Find the account by email
    const account = await Account.findAccountByEmail(email);
    if (!account) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Check if the account type is 'P' (Parent)
    if (account.AccountType !== "P") {
      return res
        .status(403)
        .json({ message: "Access denied. Admins please use Admin Portal." });
    }

    // Compare passwords
    const match = await bcrypt.compare(password, account.PasswordHashed);
    if (!match) {
      return res.status(400).json({ message: "Invalid email or password" });
    }
    // Fetch the first name from the Parent table
    const [parentData] = await pool.query(
      "SELECT FirstName FROM Parent WHERE AccountID = ?",
      [account.AccountID]
    );
    const firstName = parentData[0]?.FirstName;

    // Generate JWT (JSON Web Token)
    const token = jwt.sign(
      { accountId: account.AccountID, accountType: account.AccountType },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    // Set session data
    req.session.isLoggedIn = true;
    req.session.accountId = account.AccountID;
    req.session.accountType = account.AccountType;

    // Send the response with the first name
    res.json({ message: "Login successful", firstName, email });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const [parentData] = await pool.query(`
          SELECT 
              Parent.ParentID,
              Parent.FirstName,
              Parent.LastName,
              Parent.DateOfBirth,
              Parent.ContactNumber,
              Account.Email,
              Parent.Membership,
              Parent.MembershipExpirationDate,
              Parent.Dietary,
              Parent.ProfilePictureURL,
              Account.CreatedAt AS DateJoined,
              IF(COUNT(Child.ChildID) > 0, 'true', 'false') AS HasChildren
          FROM Parent
          JOIN Account ON Parent.AccountID = Account.AccountID
          LEFT JOIN Child ON Parent.ParentID = Child.ParentID
          GROUP BY Parent.ParentID;
      `);

    const [childData] = await pool.query(`
          SELECT 
              Child.ChildID,
              Child.ParentID,
              Child.FirstName,
              Child.LastName,
              Child.DateOfBirth,
              Child.School,
              Child.Dietary,
              Child.ProfilePictureURL
          FROM Child;
      `);

    res.json({ parentData, childData });
  } catch (error) {
    console.error("Error fetching user data:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

exports.deleteParent = async (req, res) => {
  const { parentId } = req.body;
  try {
    // Start a transaction to maintain data integrity
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Find the AccountID associated with the ParentID
      const [parentData] = await connection.query(
        "SELECT AccountID FROM Parent WHERE ParentID = ?",
        [parentId]
      );
      if (parentData.length === 0) {
        throw new Error("Parent not found");
      }

      const accountId = parentData[0].AccountID;

      // Delete child records associated with the parent
      await connection.query("DELETE FROM Child WHERE ParentID = ?", [
        parentId,
      ]);

      // Delete the parent record
      await connection.query("DELETE FROM Parent WHERE ParentID = ?", [
        parentId,
      ]);

      // Delete the account record
      await connection.query("DELETE FROM Account WHERE AccountID = ?", [
        accountId,
      ]);

      // Commit the transaction
      await connection.commit();
      res.status(200).json({
        message: "Parent and associated account deleted successfully",
      });
    } catch (error) {
      // Rollback the transaction in case of error
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error deleting parent:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.deleteChild = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM Child WHERE ChildID = ?", [id]);
    res.status(200).json({ message: "Child deleted successfully" });
  } catch (error) {
    console.error("Error deleting child:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.updateParent = async (req, res) => {
  const { id } = req.params;
  const { firstName, lastName, dob, contactNumber, dietary } = req.body;

  try {
    const result = await pool.query(
      `UPDATE Parent SET FirstName = ?, LastName = ?, DateOfBirth = ?, ContactNumber = ?, Dietary = ? WHERE ParentID = ?`,
      [firstName, lastName, dob, contactNumber, dietary, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Parent not found" });
    }

    res.status(200).json({ message: "Parent updated successfully" });
  } catch (error) {
    console.error("Error updating parent:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.updateChild = async (req, res) => {
  const { id } = req.params;
  const { firstName, lastName, dob, school, dietary } = req.body;

  try {
    const result = await pool.query(
      `UPDATE Child SET FirstName = ?, LastName = ?, DateOfBirth = ?, School = ?, Dietary = ? WHERE ChildID = ?`,
      [firstName, lastName, dob, school, dietary, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Child not found" });
    }

    res.status(200).json({ message: "Child updated successfully" });
  } catch (error) {
    console.error("Error updating child:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getParentById = async (req, res) => {
  const { id } = req.params;
  try {
    const [parent] = await pool.query(
      "SELECT * FROM Parent WHERE ParentID = ?",
      [id]
    );
    res.json(parent[0]);
  } catch (error) {
    console.error("Error fetching parent by ID:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getChildById = async (req, res) => {
  const { id } = req.params;
  try {
    const [child] = await pool.query("SELECT * FROM Child WHERE ChildID = ?", [
      id,
    ]);
    res.json(child[0]);
  } catch (error) {
    console.error("Error fetching child by ID:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.checkSession = async (req, res) => {
  if (req.session.isLoggedIn && req.session.accountId) {
    try {
      const [parentData] = await pool.query(
        "SELECT FirstName FROM Parent WHERE AccountID = ?",
        [req.session.accountId]
      );
      const firstName = parentData.length > 0 ? parentData[0].FirstName : null;

      return res.json({
        isLoggedIn: true,
        firstName: firstName || "Guest",
        email: req.session.email,
      });
    } catch (error) {
      console.error("Error fetching session details:", error);
      return res
        .status(500)
        .json({ isLoggedIn: false, message: "Error fetching session details" });
    }
  } else {
    return res.json({ isLoggedIn: false });
  }
};

exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error during logout:", err);
      return res.status(500).json({ message: "Failed to log out" });
    }
    res.clearCookie("connect.sid"); // Clear the session cookie
    res.status(200).json({ message: "Logged out successfully" });
  });
};
