const Payment = require("../../../models/payment");

// // Controller to create a new payment
// exports.createPayment = async (req, res) => {
//     const { slotID, promotionID, paymentAmount, paymentMethod, paymentImage } = req.body;

//     try {
//         // Validate input
//         if (!slotID || !paymentAmount || !paymentMethod || !paymentImage) {
//             return res.status(400).json({ message: "Missing required fields" });
//         }

//         // Create new payment
//         const paymentID = await Payment.createPayment(slotID, promotionID, paymentAmount, paymentMethod, paymentImage);
//         res.status(201).json({ message: "Payment created successfully", paymentID });
//     } catch (error) {
//         console.error("Error creating payment:", error);
//         res.status(500).json({ message: "Error creating payment" });
//     }
// };

// // Controller to get payment by ID
// exports.getPaymentByID = async (req, res) => {
//     const { id } = req.params;

//     try {
//         const payment = await Payment.getPaymentByID(id);
//         if (!payment) {
//             return res.status(404).json({ message: "Payment not found" });
//         }

//         res.status(200).json(payment);
//     } catch (error) {
//         console.error("Error fetching payment by ID:", error);
//         res.status(500).json({ message: "Error fetching payment" });
//     }
// };

// Controller to get all payments
const getAllPayments = async (req, res) => {
    try {
        const payments = await Payment.getAllPayments();

        // Convert PaymentImage binary data to base64 format
        const paymentsData = payments.map(payment => ({
            paymentID: payment.paymentID,
            slotID: payment.slotID,
            promotionID: payment.promotionID,
            paymentAmount: payment.paymentAmount,
            paymentDate: payment.paymentDate,
            paymentMethod: payment.paymentMethod,
            paymentImage: payment.paymentImage
                ? Buffer.from(payment.paymentImage).toString('base64')
                : null, // Convert binary image to base64
        }));

        res.status(200).json(paymentsData);
    } catch (error) {
        console.error("Error fetching all payments:", error);
        res.status(500).json({ message: "Error fetching payments" });
    }
};

module.exports = {
    // createPayment,
    // getPaymentByID,
    getAllPayments
};