const { rows } = require("mssql");
const pool = require("../../dbConfig");
const Account = require("../../models/accountModel");
const bcrypt = require("bcryptjs");
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
    res.status(200).json({
      message: "Admin login successful",
      accountId: account.AccountID,
    });
  } catch (error) {
    console.error("Error during admin login:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Handle signup
exports.signup = async (req, res) => {
  const { firstName, lastName, email, dob, gender, phoneNumber, password, profileDetails } = req.body;

  try {
    // Check if an account already exists with the provided email
    const [existingAccount] = await pool.query(
      `SELECT * FROM Account WHERE Email = ?`,
      [email]
    );
    if (existingAccount.length > 0) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Get a database connection
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Fetch the Telegram ID from the TemporaryTelegramIDs table
      const [telegramResult] = await connection.query(
        `SELECT telegram_id FROM TemporaryTelegramIDs WHERE token = ?`,
        [email]
      );

      let telegramId = null;
      if (telegramResult.length > 0) {
        telegramId = telegramResult[0].telegram_id;

        // Delete the row from the TemporaryTelegramIDs table
        await connection.query(`DELETE FROM TemporaryTelegramIDs WHERE token = ?`, [email]);
      }

      // Insert a new account into the Account table
      const [accountResult] = await connection.query(
        `INSERT INTO Account (Email, PasswordHashed, AccountType) VALUES (?, ?, ?)`,
        [email, hashedPassword, "P"]
      );
      const accountId = accountResult.insertId;

      // Insert into the Parent table
      const [parentResult] = await connection.query(
        `INSERT INTO Parent (AccountID, FirstName, LastName, DateOfBirth, Gender, ContactNumber, TelegramChatID, ProfileDetails)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          accountId,
          firstName,
          lastName,
          dob,
          gender,
          phoneNumber,
          telegramId, // Add the TelegramChatID if it exists
          profileDetails,
        ]
      );

      // Commit the transaction
      await connection.commit();

      // Delete the row from the TemporaryTelegramIDs table
      await connection.query(`DELETE FROM TemporaryTelegramIDs WHERE token = ?`, [email]);
      
      // Respond with success
      res.status(201).json({
        message: "Account created successfully",
        accountId,
        parentId: parentResult.insertId,
      });
    } catch (error) {
      // Rollback the transaction on error
      await connection.rollback();
      throw error;
    } finally {
      // Release the connection back to the pool
      connection.release();
    }
  } catch (error) {
    console.error("Error during signup:", error);
    res.status(500).json({ message: "Error creating account", error: error.message });
  }
};


exports.login = async (req, res) => {
  console.log(req.body);
  const { email, password } = req.body;

  try {
    const account = await Account.findAccountByEmail(email);
    if (!account) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    if (account.AccountType !== "P") {
      return res
        .status(403)
        .json({ message: "Access denied. Admins please use Admin Portal." });
    }

    const match = await bcrypt.compare(password, account.PasswordHashed);
    if (!match) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Fetch both FirstName and LastName from Parent table
    const [parentData] = await pool.query(
      "SELECT FirstName, LastName, Membership FROM Parent WHERE AccountID = ?",
      [account.AccountID]
    );

    const firstName = parentData[0]?.FirstName;
    const lastName = parentData[0]?.LastName;
    const membership = parentData[0]?.Membership;

    const token = jwt.sign(
      { accountId: account.AccountID, accountType: account.AccountType },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    req.session.isLoggedIn = true;
    req.session.accountId = account.AccountID;
    req.session.accountType = account.AccountType;

    // Include both FirstName and LastName in the response
    res.json({
      message: "Login successful",
      firstName,
      lastName, // Add lastName to the response
      email,
      membership,
      accountId: account.AccountID,
    });
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
              Parent.Gender,
              Parent.ContactNumber,
              Account.Email,
              Parent.Membership,
              Parent.StartDate AS MembershipStartDate, -- Fetch Membership Start Date
              Parent.Dietary,
              Parent.ProfileDetails,
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
              Child.Relationship,
              Child.HealthDetails,
              Child.Gender,
              Child.ProfileDetails
          FROM Child;
      `);

    res.json({ parentData, childData });
  } catch (error) {
      console.error("Error fetching user data:", error);
      res.status(500).json({ message: "Internal server error", error: error.message });
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
  const { 
      firstName, 
      lastName, 
      dob, 
      contactNumber, 
      dietary, 
      gender, 
      profileDetails, 
      membership, 
      membershipStartDate 
  } = req.body;

  try {
      // Ensure membershipStartDate is not null
      const startDate = membershipStartDate || null;

      const query = `
          UPDATE Parent 
          SET 
              FirstName = ?, 
              LastName = ?, 
              DateOfBirth = ?, 
              ContactNumber = ?, 
              Dietary = ?, 
              Gender = ?, 
              ProfileDetails = ?, 
              Membership = ?, 
              StartDate = ?
          WHERE ParentID = ?;
      `;

      const result = await pool.query(query, [
          firstName, 
          lastName, 
          dob, 
          contactNumber, 
          dietary, 
          gender, 
          profileDetails, 
          membership, 
          startDate, 
          id,
      ]);

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
  const {
    firstName,
    lastName,
    dob,
    school,
    dietary,
    relationship,
    healthDetails,
    gender,
    profileDetails,
  } = req.body;

  try {
    const result = await pool.query(
      `UPDATE Child 
           SET FirstName = ?, LastName = ?, DateOfBirth = ?, School = ?, Dietary = ?, Relationship = ?, HealthDetails = ?, Gender = ?, ProfileDetails = ? 
           WHERE ChildID = ?`,
      [
        firstName,
        lastName,
        dob,
        school,
        dietary,
        relationship,
        healthDetails,
        gender,
        profileDetails,
        id,
      ]
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
      `SELECT * FROM Parent WHERE ParentID = ?`,
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
    const [child] = await pool.query(`SELECT * FROM Child WHERE ChildID = ?`, [
      id,
    ]);
    res.json(child[0]);
  } catch (error) {
    console.error("Error fetching child by ID:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.checkSession = async (req, res) => {
  if (req.session.accountId) {
    try {
      // Fetch user's name or other details if not already in session
      if (!req.session.firstName) {
        const [rows] = await pool.query(
          `SELECT 
            p.FirstName,
            a.Email,
            p.Membership
          FROM Parent p
          JOIN Account a ON p.AccountID = a.AccountID
          WHERE p.AccountID = ?
           `,
          [req.session.accountId]
        );
        if (rows.length > 0) {
          req.session.firstName = rows[0].FirstName;
          req.session.email = rows[0].Email;
          req.session.membership = rows[0].Membership;
        }
      }

      res.json({
        isLoggedIn: true,
        accountId: req.session.accountId,
        firstName: req.session.firstName || "Guest",
        email: req.session.email || rows[0].Email,
        membership: req.session.membership || rows[0].Membership,
      });
    } catch (error) {
      console.error("Error in checkSession:", error);
      res.status(500).json({ isLoggedIn: false, message: "Server error" });
    }
  } else {
    res.json({ isLoggedIn: false });
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
