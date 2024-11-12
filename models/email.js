const nodemailer = require("nodemailer");

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
    const { userEmail, programmeName, startDate, endDate, paymentAmount, paymentMethod } = userDetails;
  
    const mailOptions = {
      from: "",
      to: userEmail,
      subject: "Payment Confirmation and Slot Booking Successful",
      html: `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h2 style="color: #4CAF50;">Thank you for your payment!</h2>
          <p>Your slot for <strong>${programmeName}</strong> has been successfully booked.</p>
          <div style="border: 1px solid #ddd; padding: 10px; margin-top: 15px;">
            <p><strong>Payment Details:</strong></p>
            <p>Amount Paid: <span style="color: #4CAF50;">$${paymentAmount}</span></p>
            <p>Payment Method: ${paymentMethod}</p>
            <p>Programme Date: ${startDate} - ${endDate}</p>
          </div>
          <p style="margin-top: 20px;">We look forward to seeing you there!</p>
        </div>
      `
    };
  
    try {
      await transporter.sendMail(mailOptions);
      console.log("Payment confirmation email sent successfully.");
    } catch (error) {
      console.error("Error sending payment confirmation email:", error);
      throw error;
    }
  };
  
  module.exports = { sendPaymentConfirmationEmail };
