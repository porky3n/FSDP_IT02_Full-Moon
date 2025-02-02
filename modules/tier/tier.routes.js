// ========== Packages ==========
// Initializing express
const express = require("express");
const { tierEmitter } = require("../../models/tier");

// ========== Controllers ==========
// Initializing programmeController
const tierController = require("./controllers/tierController");

// ========== Middleware ==========
// Initializing authMiddleware
//const authorizeUser = require("../../middlewares/authMiddleware");

// ========== Set-up ==========
// Initializing programmeRoutes
const tierRoutes = express.Router();

// ========== Routes ==========

tierRoutes.get("/tier-discount/:tier", tierController.getTierDiscount);

tierRoutes.put('/:accountId/checkMembership', tierController.checkAndResetMembershipForAccount);


// ========== Export Route ==========
// Export the programme routes to be used in other parts of the application
module.exports = tierRoutes;



// async function updateSummary(data, dates) {
//     console.log("Programme cart data:", data);
//     console.log("Programme schedule dates:", dates);
  
//     console.log("coursePrice:", document.getElementById("coursePrice"));
//     console.log("coursePrice:", document.getElementById("coursePrice"));
  
//     const userDetailsString = localStorage.getItem("userDetails");
//     const userDetails = JSON.parse(userDetailsString);
//     const userMembership = userDetails.membership;
    
//     programmeName = data.programmeName;
//     // programmeDescription = data.programmeDescription;
//     const originalFee = parseFloat(data.originalFee);
//     const discountType = data.discountType || "No discount available";
//     const discountAmount = data.discountValue
//       ? parseFloat(data.discountValue)
//       : 0;
//     const discountedFee = data.discountedFee
//       ? parseFloat(data.discountedFee)
//       : originalFee;
//     const discountValue = originalFee - discountedFee;
//     const promotionName = data.promotionName || "No promotion available";
  
//     // Set the payment amount to the discounted fee if available, otherwise to the original fee
//     paymentAmount = discountedFee;
  
//     // Update course name
//     document.getElementById("courseName").firstChild.textContent = programmeName;
  
//     // Update original price
//     document.getElementById(
//       "originalPrice"
//     ).textContent = `SGD ${originalFee.toFixed(2)}`;
//     document.getElementById(
//       "coursePrice"
//     ).textContent = `SGD ${originalFee.toFixed(2)}`;
  
//     // Display discount section if there is a discount
//     if (discountedFee < originalFee) {
//       document.getElementById("discountSection").style.display = "block";
//       document.getElementById(
//         "discountLabel"
//       ).firstChild.textContent = `Discount (${promotionName}) `;
//       console.log(discountType);
//       if (discountType === "Percentage") {
//         document.getElementById(
//           "discountAmount"
//         ).textContent = `(${discountAmount}%)`;
//       } else {
//         document.getElementById("discountAmount").textContent = null;
//       }
//       document.getElementById(
//         "discountedPrice"
//       ).textContent = `SGD ${discountValue.toFixed(2)}`;
  
//       // Update total price (1)
//       // document.getElementById("totalPrice").textContent = `$${discountedFee.toFixed(2)}`;
//     } else {
//       // Hide discount section if no discount
//       document.getElementById("discountSection").classList.add("d-none");
//     }
  
  
//     // User Membership
//     if (userMembership !== "Non-Membership") {
//       const membershipDiscount = await fetchTierDiscount(userMembership);
//           console.log("Membership Discount:", membershipDiscount);
  
//           const membershipDiscountAmount = (discountedFee * membershipDiscount) / 100;
//           finalFee -= membershipDiscountAmount;
  
//           // Update Membership Discount Section
//           document.getElementById("membershipDiscountSection").style.display = "block";
//           document.getElementById("membershipDiscountLabel").textContent = `Membership Discount (${userMembership})`;
//           document.getElementById("membershipDiscountAmount").textContent = `SGD ${membershipDiscountAmount.toFixed(2)}`;
//     }
  
//     document.getElementById(
//       "subtotal"
//     ).textContent = `SGD ${discountedFee.toFixed(2)}`;
//     document.getElementById("total").textContent = `SGD ${discountedFee.toFixed(
//       2
//     )}`;
//     paymentAmount = discountedFee.toFixed(2);
//     console.log("discountedFee:", discountedFee.toFixed(2));
  
//     // Update total price (2)
//     // document.getElementById("totalPrice").textContent = `$${discountedFee.toFixed(2)}`;
  
//     // Create payment intent with the discounted fee (Using stripe)
//     // createPaymentIntent(paymentAmount);
  
//     // Display start and end dates
//     startDate = new Date(dates.firstStartDate).toLocaleDateString();
//     endDate = new Date(dates.lastEndDate).toLocaleDateString();
  
//     initializeStripe();
//     // document.getElementById("startDate").textContent = startDate;
//     // document.getElementById("endDate").textContent = endDate;
//   }