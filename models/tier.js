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
  static async getTierByID(tier) {
    const sqlQuery = `
            SELECT * FROM TierCriteria
            WHERE TierID = ?
        `;
    const [rows] = await pool.query(sqlQuery, [tier]);
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

  static async updateAccountTier(accountID, tier) {
    const sqlQuery = `
      UPDATE Parent
      SET Tier = ?
      WHERE AccountID = ?
    `;
    await pool.query(sqlQuery, [tier, accountID]);
  }

  static async determineTier(numberOfPurchases) {
    const sqlQuery = `
      SELECT Tier
      FROM TierCriteria
      WHERE MinPurchases <= ?
      ORDER BY MinPurchases DESC
      LIMIT 1
    `;
    const [rows] = await pool.query(sqlQuery, [numberOfPurchases]);
    if (rows.length === 0) return 'Non-Membership'; // Default tier if no match

    return rows[0].Tier;
  }
}
