const pool = require('../dbConfig');

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
}

module.exports = Payment;