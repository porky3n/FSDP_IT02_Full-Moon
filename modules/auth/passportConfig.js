const passport = require('passport');
const bcrypt = require('bcryptjs');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const Account = require('../../models/accountModel');
const pool = require('../../dbConfig');

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;

        // Check if the account exists
        const account = await Account.findAccountByEmail(email);

        if (!account) {
          // Begin a transaction to create the account and parent profile
          const connection = await pool.getConnection();
          await connection.beginTransaction();

          try {
            // Insert new account
            const placeholderPassword = await bcrypt.hash("google-placeholder", 10);
            const [accountResult] = await connection.query(
              "INSERT INTO Account (Email, PasswordHashed, AccountType) VALUES (?, ?, ?)",
              [email, placeholderPassword, "P"]
            );
            const accountId = accountResult.insertId;

            // Insert parent profile with default placeholders
            await connection.query(
              "INSERT INTO Parent (AccountID, FirstName, LastName, DateOfBirth, Gender, ContactNumber) VALUES (?, ?, ?, ?, ?, ?)",
              [
                accountId,
                profile.name.givenName || "GoogleUser",
                profile.name.familyName || "GoogleUser",
                "1970-01-01", // Placeholder DOB
                "M", // Placeholder Gender
                "", // Placeholder ContactNumber
              ]
            );

            // Commit the transaction
            await connection.commit();

            // Pass the new account's ID for serialization
            return done(null, { email, accountType: "P", AccountID: accountId });
          } catch (error) {
            // Rollback in case of failure
            await connection.rollback();
            throw error;
          } finally {
            connection.release();
          }
        }

        // Pass the existing account data for serialization
        return done(null, { email, accountType: "P", AccountID: account.AccountID });
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, { email: user.email, AccountID: user.AccountID });
});

passport.deserializeUser(async (user, done) => {
  try {
    const account = await Account.findAccountByEmail(user.email); // Adjust to your schema
    if (!account) {
      console.error("Account not found for email:", user.email);
      return done(null, false);
    }
    done(null, account);
  } catch (error) {
    console.error("Error in deserializeUser:", error);
    done(error, null);
  }
});



module.exports = passport;
