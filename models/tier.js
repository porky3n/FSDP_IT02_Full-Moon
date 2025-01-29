const pool = require("../dbConfig");

class Tier {
  constructor(tier, minPurchases, tierDuration, tierDiscount, special) {
    this.tier = tier;
    this.minPurchases = minPurchases;
    this.tierDuration = tierDuration;
    this.tierDiscount = tierDiscount;
    this.special = special;
  }

  
  // Get all tiers
  static async getTiers() {
    const sqlQuery = `
            SELECT * FROM TierCriteria
        `;
    const [rows] = await pool.query(sqlQuery);
    return rows.map(
      (row) =>
        new Tier(
            row.Tier,
            row.MinPurchases,
            row.TierDuration,
            row.TierDiscount,
            row.Special
        )
    );
  }

  // Get a specific tier by ID
  static async getTierDiscount(tier) {
    const sqlQuery = `
        SELECT TierDiscount FROM TierCriteria
        WHERE Tier = ?
    `;
    const [rows] = await pool.query(sqlQuery, [tier]);
    if (rows.length === 0) return 0; // Default discount if tier not found
    return rows[0].TierDiscount;
}


  static async getAccountTier(accountID) {
    const sqlQuery = `
      SELECT p.Tier, tc.MinPurchases, tc.TierDuration, tc.TierDiscount, tc.Special
      FROM Parent p
      JOIN TierCriteria tc ON p.Tier = tc.Tier
      WHERE p.AccountID = ?
    `;
    const [rows] = await pool.query(sqlQuery, [accountID]);
    if (rows.length === 0) return null;

    const row = rows[0];
    return new Tier(
      row.Tier,
      row.MinPurchases,
      row.TierDuration,
      row.TierDiscount,
      row.Special
    );
  }

  static async updateAccountMembership(accountID, membership) {
    const sqlQuery = `
      UPDATE Parent
      SET Membership = ?
      WHERE AccountID = ?
    `;
    await pool.query(sqlQuery, [membership, accountID]);
  }

  static async determineMembership(numberOfPurchases) {
    const sqlQuery = `
      SELECT Tier
      FROM TierCriteria
      WHERE MinPurchases <= ?
      ORDER BY MinPurchases DESC
      LIMIT 1
    `;
    const [rows] = await pool.query(sqlQuery, [numberOfPurchases]);
    if (rows.length === 0) return 'Non-Membership'; // Default tier if no match

    return rows[0].Membership;
  }

  static async checkAndResetMembershipForAccount(accountID) {
    console.log("Checking and resetting tier for account:", accountID);
    const query = `
      UPDATE Parent
      SET 
          Membership = 'Non-Membership',
          StartDate = CURRENT_DATE
      WHERE 
          AccountID = ?
          AND Membership <> 'Non-Membership'
          AND DATEDIFF(CURRENT_DATE, StartDate) > (
              SELECT t.TierDuration
              FROM TierCriteria t
              WHERE t.Tier = Parent.Membership
          );
    `;

    const fetchTierDetailsQuery = `
      SELECT Membership, StartDate
      FROM Parent
      WHERE AccountID = ?;
    `;

    try {
      // Check and reset the expired tier
      const [result] = await pool.query(query, [accountID]);
      const wasTierExpired = result.affectedRows > 0;

      // Fetch the current tier details
      const [tierDetails] = await pool.query(fetchTierDetailsQuery, [accountID]);

      if (tierDetails.length > 0) {
        const { Membership, StartDate } = tierDetails[0];
        return {
          message: wasTierExpired
            ? "Tier was expired and reset to Non-Membership."
            : "Tier is still active.",
          membership: Membership,
          startDate: StartDate,
          expired: wasTierExpired,
        };
      } else {
        throw new Error("Account not found or invalid account ID.");
      }
    } catch (error) {
      console.error("Error checking and resetting tier:", error);
      throw error;
    }
  }

  
}

module.exports = Tier;