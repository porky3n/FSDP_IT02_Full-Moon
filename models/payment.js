const pool = require("../dbConfig");
require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

//testkey = sk_test_51Qb1BvP2e3AF4UmhWHOgMw0xlqHsL0itETq1l1wyqFd22r3g7h5e3fUKQaJPbMblVLsMV07ouSNFgh0Xf5IYbyxZ00iLWvw9Vd
//apikey = pk_test_51Qb1BvP2e3AF4UmhhiZG78Pr695qyCygnIKvbpm4EKk8t2ggA6LAc8ycF4Ghg3IAA3SB42OdemXL4eADwL7U0XeI00Qf9wG6xG

class Payment {
  constructor(
    paymentID,
    slotID,
    promotionID,
    paymentAmount,
    paymentDate,
    paymentMethod
  ) {
    this.paymentID = paymentID;
    this.slotID = slotID;
    this.promotionID = promotionID;
    this.paymentAmount = paymentAmount;
    this.paymentDate = paymentDate;
    this.paymentMethod = paymentMethod;
  }

  // // Method to create a new payment
  // static async createPayment(slotID, promotionID, paymentAmount, paymentMethod, paymentImage) {
  //     const sqlQuery = `
  //         INSERT INTO Payment (SlotID, PromotionID, PaymentAmount, PaymentMethod, PaymentImage)
  //         VALUES (?, ?, ?, ?, ?)
  //     `;

  //     try {
  //         const [result] = await pool.query(sqlQuery, [slotID, promotionID, paymentAmount, paymentMethod, paymentImage]);
  //         return result.insertId; // Return the ID of the new payment
  //     } catch (error) {
  //         console.error("Error creating payment:", error);
  //         throw error;
  //     }
  // }

  // // Method to fetch a payment by ID
  // static async getPaymentByID(paymentID) {
  //     const sqlQuery = `
  //         SELECT * FROM Payment WHERE PaymentID = ?
  //     `;

  //     try {
  //         const [rows] = await pool.query(sqlQuery, [paymentID]);
  //         if (rows.length === 0) return null;

  //         const row = rows[0];
  //         return new Payment(
  //             row.PaymentID,
  //             row.SlotID,
  //             row.PromotionID,
  //             row.PaymentAmount,
  //             row.PaymentDate,
  //             row.PaymentMethod,
  //             row.PaymentImage
  //         );
  //     } catch (error) {
  //         console.error("Error fetching payment by ID:", error);
  //         throw error;
  //     }
  // }

  // Method to fetch all payments
  static async getAllPayments() {
    const sqlQuery = `
            SELECT * FROM Payment
        `;

    try {
      const [rows] = await pool.query(sqlQuery);
      return rows.map(
        (row) =>
          new Payment(
            row.PaymentID,
            row.SlotID,
            row.PromotionID,
            row.PaymentAmount,
            row.PaymentDate,
            row.PaymentMethod
          )
      );
    } catch (error) {
      console.error("Error fetching all payments:", error);
      throw error;
    }
  }

  static async updateTierBasedOnPurchases(accountID) {
    const getPurchasesQuery = `
            SELECT COUNT(p.PaymentID) AS numberOfPurchases
            FROM Payment p
            JOIN Slot s ON p.SlotID = s.SlotID
            WHERE s.ParentID IN (SELECT ParentID FROM Parent WHERE AccountID = ?)
               OR s.ChildID IN (SELECT ChildID FROM Child WHERE ParentID IN (SELECT ParentID FROM Parent WHERE AccountID = ?));
        `;

    const getCurrentTierQuery = `
            SELECT Membership 
            FROM Parent 
            WHERE AccountID = ?;
        `;

    // User restars at gold if he was at gold
    // const updateTierQuery = `
    //         UPDATE Parent
    //         SET 
    //             StartDate = CASE 
    //                 WHEN Membership = (
    //                     SELECT t.Tier
    //                     FROM TierCriteria t
    //                     WHERE t.MinPurchases <= ?
    //                     ORDER BY t.MinPurchases DESC
    //                     LIMIT 1
    //                 ) THEN CURRENT_DATE
    //                 ELSE StartDate
    //             END,
    //             Membership = CASE 
    //                 WHEN Membership <> (
    //                     SELECT t.Tier
    //                     FROM TierCriteria t
    //                     WHERE t.MinPurchases <= ?
    //                     ORDER BY t.MinPurchases DESC
    //                     LIMIT 1
    //                 ) THEN (
    //                     SELECT t.Tier
    //                     FROM TierCriteria t
    //                     WHERE t.MinPurchases <= ?
    //                     ORDER BY t.MinPurchases DESC
    //                     LIMIT 1
    //                 )
    //                 ELSE Membership
    //             END
    //         WHERE AccountID = ?;
    //     `;

    console.log("accountID from payment.js:", accountID);
    // user restarts from bronze if he was at gold
    const updateTierQuery = `
      UPDATE Parent
      SET 
          StartDate = CASE 
              WHEN Membership = 'Non-Membership' THEN CURRENT_DATE -- Reset start date when rejoining
              WHEN Membership = (
                  SELECT t.Tier
                  FROM TierCriteria t
                  WHERE t.MinPurchases <= ?
                  ORDER BY t.MinPurchases DESC
                  LIMIT 1
              ) THEN StartDate
              ELSE CURRENT_DATE
          END,
          Membership = CASE 
              WHEN Membership = 'Non-Membership' THEN 'Bronze' -- Restart from Bronze if previously Non-Membership
              WHEN Membership <> (
                  SELECT t.Tier
                  FROM TierCriteria t
                  WHERE t.MinPurchases <= ?
                  ORDER BY t.MinPurchases DESC
                  LIMIT 1
              ) THEN (
                  SELECT t.Tier
                  FROM TierCriteria t
                  WHERE t.MinPurchases <= ?
                  ORDER BY t.MinPurchases DESC
                  LIMIT 1
              )
              ELSE Membership
          END
      WHERE AccountID = ?;
      `;

    try {
      // Step 1: Get the number of purchases
      const [purchasesResult] = await pool.query(getPurchasesQuery, [
        accountID,
        accountID,
      ]);
      const numberOfPurchases = purchasesResult[0]?.numberOfPurchases || 0;

      // Step 2: Get the current tier before the update
      const [currentTierResult] = await pool.query(getCurrentTierQuery, [
        accountID,
      ]);
      const currentTier = currentTierResult[0]?.Membership;

      // Step 3: Update the tier and/or TierStartDate
      await pool.query(updateTierQuery, [
        numberOfPurchases, // For TierStartDate logic
        numberOfPurchases, // For Tier update logic
        numberOfPurchases, // For Tier update logic
        accountID, // AccountID
      ]);

      // Step 4: Fetch the updated tier
      const [updatedTierResult] = await pool.query(getCurrentTierQuery, [
        accountID,
      ]);
      const updatedTier = updatedTierResult[0]?.Membership;

      // Step 5: Determine the status
      if (currentTier !== updatedTier) {
        return { status: "upgraded", membership: updatedTier };
      } else {
        return { status: "retained", membership: currentTier };
      }
    } catch (error) {
      console.error("Error updating tier based on purchases:", error);
      throw error;
    }
  }

  static async createPaymentIntent(paymentAmount) {
    try {
    // const paymentIntent = await stripe.paymentIntents.create({
      //     payment_method_types: ['paynow'],
      //     payment_method_data: {
      //         type: 'paynow',
      //     },
      //     amount: paymentAmount,
      //     currency: 'sgd',
      // });

      const paymentIntent = await stripe.paymentIntents.create({
        amount: paymentAmount,
        currency: "sgd",
        payment_method_types: ["card", "paynow"],
        payment_method_data: {
          type: "paynow",
        },
      });
      console.log("Payment Intent Response:", paymentIntent);
      return paymentIntent;
    } catch (error) {
      console.error("Error creating payment intent in Stripe:", error);
      throw error; // Rethrow the error to handle it in the controller
    }
  }

  static async createPayout(payoutAmount) {
    try {
      const payout = await stripe.payouts.create({
        amount: payoutAmount,
        currency: "sgd",
      });
      console.log("Payout Response:", payout);
      return payout;
    } catch (error) {
      console.error("Error creating payout in Stripe:", error);
      throw error; // Rethrow the error to handle it in the controller
    }
  }
}

module.exports = Payment;
