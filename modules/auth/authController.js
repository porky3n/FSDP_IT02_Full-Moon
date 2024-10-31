// /modules/auth/authController.js
const pool = require('../../dbConfig');
const Account = require('../../models/accountModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// /modules/auth/authController.js

exports.adminLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const account = await Account.findAccountByEmail(email);
    if (!account) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Check if the account type is 'A' (Admin)
    if (account.AccountType !== 'A') {
      return res.status(403).json({ message: 'Access denied. Admins only.' });
    }

    const match = await bcrypt.compare(password, account.PasswordHashed);
    if (!match) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Set the session variable to indicate an admin login
    req.session.isAdmin = true;

    // Redirect to the admin home page
    res.redirect('/adminHomePage.html');
  } catch (error) {
    console.error('Error during admin login:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};


// Handle signup
exports.signup = async (req, res) => {
  const { firstName, lastName, email, dob, phoneNumber, password } = req.body;

  try {
    // Check if account already exists
    const existingAccount = await Account.findAccountByEmail(email);
    if (existingAccount) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Begin a transaction to insert into Account and Parent tables
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Insert into Account table
      const [accountResult] = await connection.query(
        'INSERT INTO Account (Email, PasswordHashed, AccountType) VALUES (?, ?, ?)',
        [email, hashedPassword, 'P'] // 'P' for Parent
      );

      // Get the generated AccountID for use in the Parent table
      const accountId = accountResult.insertId;

      // Insert into Parent table
      await connection.query(
        'INSERT INTO Parent (AccountID, FirstName, LastName, DateOfBirth, ContactNumber) VALUES (?, ?, ?, ?, ?)',
        [accountId, firstName, lastName, dob, phoneNumber]
      );

      // Commit the transaction
      await connection.commit();
      res.status(201).json({ message: 'Account created successfully' });
    } catch (error) {
      // Rollback if any error occurs during the transaction
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error during signup:', error);
    res.status(500).json({ message: 'Error creating account', error: error.message });
  }
};

// Handle login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the account by email
    const account = await Account.findAccountByEmail(email);
    if (!account) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Compare passwords
    const match = await bcrypt.compare(password, account.PasswordHashed);
    if (!match) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Generate JWT (JSON Web Token)
    const token = jwt.sign({ accountId: account.AccountID, accountType: account.AccountType }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    return res.json({ message: 'Login successful', token });
  } catch (error) {
    return res.status(500).json({ message: 'Error logging in', error: error.message });
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
      console.error('Error fetching user data:', error);
      res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};
