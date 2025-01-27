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
    const paymentsData = payments.map((payment) => ({
      paymentID: payment.paymentID,
      slotID: payment.slotID,
      promotionID: payment.promotionID,
      paymentAmount: payment.paymentAmount,
      paymentDate: payment.paymentDate,
      paymentMethod: payment.paymentMethod,
      paymentImage: payment.paymentImage
        ? Buffer.from(payment.paymentImage).toString("base64")
        : null, // Convert binary image to base64
    }));

    res.status(200).json(paymentsData);
  } catch (error) {
    console.error("Error fetching all payments:", error);
    res.status(500).json({ message: "Error fetching payments" });
  }
};

const updateTierBasedOnPurchases = async (req, res) => {
  try {
    const { accountId } = req.params; // Get the accountId from the URL parameter

    // Call the method to update the tier
    const result = await Payment.updateTierBasedOnPurchases(accountId);

    if (result.status === "upgraded") {
      res.status(200).json({ 
        tierUpdated: true,
        newTier: result.tier,
        message: `Tier upgraded to ${result.tier}`
     });
    } else if (result.status === "retained") {
      res.status(200).json({
        tierUpdated: false,
        newTier: result.tier,
        message: `Tier retained as ${result.tier}. TierStartDate updated.`,
      });
    } else {
      res.status(200).json({ message: "No changes to the tier." });
    }
  } catch (error) {
    console.error("Error updating tier based on purchases:", error);
    res.status(500).json({ message: "Error updating tier based on purchases" });
  }
};

const createPaymentIntent = async (req, res) => {
  const { paymentAmount } = req.body;

  try {
    const intent = await Payment.createPaymentIntent(paymentAmount);
    res.json({ client_secret: intent.client_secret });
  } catch (error) {
    console.error("Error creating payment intent:", error);
    res.status(500).json({ message: "Error creating payment intent" });
  }
};

const createPayout = async (req, res) => {
  const { amount } = req.body;

  try {
    const payout = await Payment.createPayout(amount);
    res.status(201).json({ message: "Payout created successfully", payout });
  } catch (error) {
    console.error("Error creating payout:", error);
    res.status(500).json({ message: "Error creating payout" });
  }
};

module.exports = {
  // createPayment,
  // getPaymentByID,
  getAllPayments,
  updateTierBasedOnPurchases,
  createPaymentIntent,
  createPayout,
};
