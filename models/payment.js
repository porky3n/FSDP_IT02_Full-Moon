const pool = require('../dbConfig');
require("dotenv").config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

//testkey = sk_test_51Qb1BvP2e3AF4UmhWHOgMw0xlqHsL0itETq1l1wyqFd22r3g7h5e3fUKQaJPbMblVLsMV07ouSNFgh0Xf5IYbyxZ00iLWvw9Vd
//apikey = pk_test_51Qb1BvP2e3AF4UmhhiZG78Pr695qyCygnIKvbpm4EKk8t2ggA6LAc8ycF4Ghg3IAA3SB42OdemXL4eADwL7U0XeI00Qf9wG6xG

class Payment {
    constructor(paymentID, slotID, promotionID, paymentAmount, paymentDate, paymentMethod, paymentImage) {
        this.paymentID = paymentID;
        this.slotID = slotID;
        this.promotionID = promotionID;
        this.paymentAmount = paymentAmount;
        this.paymentDate = paymentDate;
        this.paymentMethod = paymentMethod;
        this.paymentImage = paymentImage;
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
            return rows.map(row => new Payment(
                row.PaymentID,
                row.SlotID,
                row.PromotionID,
                row.PaymentAmount,
                row.PaymentDate,
                row.PaymentMethod,
                row.PaymentImage
            ));
        } catch (error) {
            console.error("Error fetching all payments:", error);
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
                amount: 5000,
                currency: 'sgd',
                automatic_payment_methods: { enabled: true },
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
                currency: 'sgd',
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