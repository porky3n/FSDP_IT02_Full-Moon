// /models/accountModel.js
const pool = require('../dbConfig'); // Using dbConfig for MySQL connection
const bcrypt = require('bcrypt');

// Insert a new account
exports.createAccount = async (email, password, accountType) => {
  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert into Account table
    const [result] = await pool.query(
      'INSERT INTO Account (Email, PasswordHashed, AccountType) VALUES (?, ?, ?)',
      [email, hashedPassword, accountType]
    );

    return result;
  } catch (error) {
    throw error;
  }
};

// Find account by email
exports.findAccountByEmail = async (email) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Account WHERE Email = ?', [email]);
    return rows[0]; // Return the account object, if found
  } catch (error) {
    throw error;
  }
};
