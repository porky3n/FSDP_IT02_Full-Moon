const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "vincenth1025@gmail.com",
    pass: "rrcc zrnj kwcx ximd",
  },
});

/**
 * Send payment confirmation email
 * @param {Object} userDetails - Contains email, programme details, and payment info
 */

const sendPaymentConfirmationEmail = async (userDetails) => {
  const { userEmail, paymentID, programmeName, startDate, endDate, paymentAmount, paymentMethod } = userDetails;

  console.log("paymentAmount type:", typeof paymentAmount, "value:", paymentAmount);

  try {
    const numericPaymentAmount = Number(paymentAmount); // Convert to number
    if (isNaN(numericPaymentAmount)) {
      throw new Error("Invalid payment amount: not a number");
    }

    let htmlContent = fs.readFileSync(path.join(__dirname, '../public/paymentReceipt.html'), 'utf-8');
    htmlContent = htmlContent
      .replace("{{receiptDate}}", new Date().toDateString())
      .replace("{{receiptNumber}}", paymentID)
      .replace("{{programmeName}}", programmeName)
      .replace("{{programmeAmount}}", numericPaymentAmount.toFixed(2))
      // .replace("{{paymentMethod}}", paymentMethod)
      .replace("{{subTotal}}", numericPaymentAmount.toFixed(2))
      .replace("{{taxFee}}", (numericPaymentAmount * 0.09).toFixed(2))
      .replace("{{total}}", (numericPaymentAmount * 1.09).toFixed(2))
      .replace("{{startDate}}", startDate)
      .replace("{{endDate}}", endDate);

    const mailOptions = {
      from: "vincenth1025@gmail.com",
      to: userEmail,
      subject: "Payment Confirmation and Slot Booking Successful",
      html: htmlContent,
      attachments: [
        {
          filename: 'logo.png',
          path: path.join(__dirname, '../public/images/mindsphere-logo.png'),
          cid: 'mindsphere-logo', // same cid value as in the html img src
        },
      ],
    };

    await transporter.sendMail(mailOptions);
    console.log("Payment confirmation email sent successfully.");
  } catch (error) {
    console.error("Error sending payment confirmation email:", error);
    throw error;
  }
};
  
  module.exports = { sendPaymentConfirmationEmail };
