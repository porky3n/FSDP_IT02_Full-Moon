// Global variables to store payment information, last uploaded image in binary format, and session details
let promotionID = null; // Will be updated based on fetched data
let paymentAmount = 0; // Updated based on original or discounted fee

// Retrieve session storage details and store in global variables
const sessionDetails = JSON.parse(
  sessionStorage.getItem("selectedScheduleDetails")
);
const programmeId = sessionDetails ? sessionDetails.programmeId : null;
const instanceId = sessionDetails ? sessionDetails.instanceId : null;
const programmeClassId = sessionDetails
  ? sessionDetails.programmeClassId
  : null;
const profileId = sessionDetails ? sessionDetails.profileId : null;
let startDate = "";
let endDate = "";
let programmeName = "";
let accountId = null;

// Stripe variables
let clientSecret = "";
let elements = null;
let cardElement = null;
let selectedPaymentMethod = ""; // To store the selected payment method

document.addEventListener("DOMContentLoaded", async () => {
  fetchProgrammeCartDetails();
  // initializeStripe();
});

/**
 * Fetch programme cart details from the server and populate the summary box
 */
async function fetchProgrammeCartDetails() {
  try {
    if (!programmeClassId) {
      alert("Programme details not found.");
      return;
    }

    const [cartResponse, datesResponse] = await Promise.all([
      fetch(`/api/programmeClass/${programmeClassId}/cart`),
      fetch(`/api/programmeSchedule/${instanceId}/startenddates`),
    ]);

    if (!cartResponse.ok) throw new Error("Failed to fetch programme details");
    if (!datesResponse.ok)
      throw new Error("Failed to fetch programme schedule dates");

    const cartData = await cartResponse.json();
    const dateData = await datesResponse.json();

    console.log("coursePrice:", document.getElementById("coursePrice"));

    // Update the summary box with programme details and dates
    updateSummary(cartData, dateData);

    // Set global variables for payment details
    promotionID = cartData.promotionID || null;
  } catch (error) {
    console.error("Error fetching programme cart details or dates:", error);
  }
}

/**
 * Update summary box with fetched data
 * @param {Object} data - Programme cart data returned from server
 * @param {Object} dates - Start and end dates for the programme schedule
 */
function updateSummary(data, dates) {
  console.log("Programme cart data:", data);
  console.log("Programme schedule dates:", dates);

  console.log("coursePrice:", document.getElementById("coursePrice"));
  console.log("coursePrice:", document.getElementById("coursePrice"));

  programmeName = data.programmeName;
  // programmeDescription = data.programmeDescription;
  const originalFee = parseFloat(data.originalFee);
  const discountType = data.discountType || "No discount available";
  const discountAmount = data.discountValue
    ? parseFloat(data.discountValue)
    : 0;
  const discountedFee = data.discountedFee
    ? parseFloat(data.discountedFee)
    : originalFee;
  const discountValue = originalFee - discountedFee;
  const promotionName = data.promotionName || "No promotion available";

  // Set the payment amount to the discounted fee if available, otherwise to the original fee
  paymentAmount = discountedFee;

  // Update course name
  document.getElementById("courseName").firstChild.textContent = programmeName;

  // Update original price
  document.getElementById(
    "originalPrice"
  ).textContent = `SGD ${originalFee.toFixed(2)}`;
  document.getElementById(
    "coursePrice"
  ).textContent = `SGD ${originalFee.toFixed(2)}`;

  // Display discount section if there is a discount
  if (discountedFee < originalFee) {
    document.getElementById("discountSection").style.display = "block";
    document.getElementById(
      "discountLabel"
    ).firstChild.textContent = `Discount (${promotionName}) `;
    console.log(discountType);
    if (discountType === "Percentage") {
      document.getElementById(
        "discountAmount"
      ).textContent = `(${discountAmount}%)`;
    } else {
      document.getElementById("discountAmount").textContent = null;
    }
    document.getElementById(
      "discountedPrice"
    ).textContent = `SGD ${discountValue.toFixed(2)}`;

    // Update total price (1)
    // document.getElementById("totalPrice").textContent = `$${discountedFee.toFixed(2)}`;
  } else {
    // Hide discount section if no discount
    document.getElementById("discountSection").classList.add("d-none");
  }
  document.getElementById(
    "subtotal"
  ).textContent = `SGD ${discountedFee.toFixed(2)}`;
  document.getElementById("total").textContent = `SGD ${discountedFee.toFixed(
    2
  )}`;
  paymentAmount = discountedFee.toFixed(2);
  console.log("discountedFee:", discountedFee.toFixed(2));

  // Update total price (2)
  // document.getElementById("totalPrice").textContent = `$${discountedFee.toFixed(2)}`;

  // Create payment intent with the discounted fee (Using stripe)
  // createPaymentIntent(paymentAmount);

  // Display start and end dates
  startDate = new Date(dates.firstStartDate).toLocaleDateString();
  endDate = new Date(dates.lastEndDate).toLocaleDateString();

  initializeStripe();
  // document.getElementById("startDate").textContent = startDate;
  // document.getElementById("endDate").textContent = endDate;
}

/**
 * Function to create a slot, and upon success redirect to payment receipt page
 */
// async function printReceipt() {
//   try {
//     const slotCreated = await createSlot();
//     if (slotCreated) {
//       // Redirect to payment receipt page only if slot creation is successful
//       // window.location.href = "../paymentReceipt.html";
//     }
//   } catch (error) {
//     console.error("Failed to create slot:", error);
//     alert("There was an error creating your booking. Please try again.");
//   }
// }

/**
 * Create slot and store binary image in the database
 * @returns {boolean} - Returns true if slot creation is successful, false otherwise
 */
async function createSlot() {
  // Retrieve schedule details from session storage
  const scheduleDetailsString = sessionStorage.getItem(
    "selectedScheduleDetails"
  );
  const scheduleDetails = JSON.parse(scheduleDetailsString);

  // Check if all required details are available
  if (
    !scheduleDetails ||
    !scheduleDetails.programmeId ||
    !scheduleDetails.instanceId ||
    !scheduleDetails.programmeClassId
  ) {
    alert(
      "No schedule details found. Please select a schedule before proceeding."
    );
    return false;
  }

  const programmeId = scheduleDetails.programmeId;
  const instanceId = scheduleDetails.instanceId;
  const programmeClassId = scheduleDetails.programmeClassId;

  // Set parentID or childID based on profile type
  const parentID = scheduleDetails.parentId || null;
  const childID = scheduleDetails.childId || null;

  // Retrieve user email from localStorage
  const userDetailsString = localStorage.getItem("userDetails");
  const userDetails = JSON.parse(userDetailsString);
  const userEmail = userDetails.email;
  accountId = userDetails.accountId;

  // Prepare slot data object
  const slotData = {
    programmeClassID: programmeClassId,
    programmeID: programmeId,
    instanceID: instanceId,
    parentID: parentID, // Use parentID if profile type is parent
    childID: childID, // Use childID if profile type is child
    paymentAmount: paymentAmount, // Use calculated payment amount from updateSummary
    paymentMethod: selectedPaymentMethod, // Retrieved from fetchProgrammeCartDetails
    verified: "Verified", // Set to "Verified" for now
    purchaseTier: userDetails.tier, // Retrieve user tier from localStorage
    promotionID: promotionID,
    userEmail: userEmail, // Include user email
    programmeName: programmeName,
    startDate: startDate,
    endDate: endDate, // Retrieved from fetchProgrammeCartDetails
  };

  console.log("Slot and payment data:", slotData);

  try {
    const response = await fetch("/api/slot/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(slotData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || "Failed to create slot and payment."
      );
    }

    const data = await response.json();
    console.log("Slot and payment created successfully:", data);
    updateTierForAccount();
    alert("Slot and payment created successfully.");
    return true; // Return true on successful slot creation
  } catch (error) {
    alert(`Error creating slot and payment: ${error.message}`);
    console.error("Error creating slot and payment:", error);
    return false; // Return false on failure
  }
}

// Stripe Payment
// Stripe Public Key
const stripe = Stripe(
  "pk_test_51QefolPwgB6Ze04CvONegf5es97gWPMkVLxcQv9XOBoEi26IIyvzBFmBpxHC5ORKE9eBIIACAK6uoL3dv5CpWjZx00E67kJbua"
);

// Promotion code
const addPromotionLink = document.getElementById("addPromotionLink");
const promotionInput = document.getElementById("promotionInput");
const promotionInputField = document.getElementById("promotion-input-field");

addPromotionLink.addEventListener("click", function (e) {
  e.preventDefault();
  addPromotionLink.style.opacity = "0";
  setTimeout(() => {
    addPromotionLink.style.display = "none";
    promotionInput.classList.add("show");
    promotionInputField.focus();
  }, 0);
});

document.addEventListener("click", function (e) {
  if (!promotionInput.contains(e.target) && e.target !== addPromotionLink) {
    if (promotionInputField.value.trim() === "") {
      if (promotionInput.classList.contains("show")) {
        promotionInput.classList.remove("show");
        setTimeout(() => {
          addPromotionLink.style.display = "block";
          addPromotionLink.style.opacity = "1";
        }, 0);
      }
    }
  }
});

// Show "Apply" button when there is text
promotionInputField.addEventListener("input", function () {
  if (promotionInputField.value.trim() === "") {
    applyButton.classList.remove("show");
  } else {
    applyButton.classList.add("show");
  }
});

const applyButton = document.getElementById("applyButton");
// Handle "Apply" button click
applyButton.addEventListener("click", function () {
  alert(`Promotion code applied: ${promotionInputField.value}`);
});

// Handle focus and blur events for smooth transition
promotionInputField.addEventListener("focus", function () {
  promotionInputField.style.width = "380px";
  promotionInputField.style.height = "35px";
});

promotionInputField.addEventListener("blur", function () {
  if (promotionInputField.value.trim() === "") {
    promotionInputField.style.width = "250px";
    promotionInputField.style.height = "30px";
  }
});

/// Stripe Payment

async function initializeStripe() {
  // Wait for createPaymentIntent to complete and get the client secret
  clientSecret = await createPaymentIntent(paymentAmount);

  if (clientSecret) {
    // Proceed to set up Stripe elements and UI
    stripeCheckout(clientSecret);
  } else {
    console.error(
      "Failed to create payment intent. Stripe Checkout cannot proceed."
    );
  }
}

// Call the initialization function
// document.addEventListener("DOMContentLoaded", async () => {
//   initializeStripe();
// });

// new functions using stripe
async function createPaymentIntent(paymentAmount) {
  paymentAmount = paymentAmount * 100; // Convert to cents
  console.log("Payment amount in cents:", paymentAmount);
  try {
    const response = await fetch("/api/payment/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ paymentAmount }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to create payment intent.");
    }

    const data = await response.json();
    console.log("Payment intent created successfully:", data);
    clientSecret = data.client_secret;
    return clientSecret;
  } catch (error) {
    console.error("Error creating payment intent:", error);
    alert(`Error creating payment intent: ${error.message}`);
    return null;
  }
}

/* stripe form */

//Edit payment amount
async function stripeCheckout(clientSecret) {
  console.log("Client secret:", clientSecret);
  try {
    const appearance = {
      theme: "stripe",
    };
    elements = stripe.elements({ clientSecret, appearance });

    cardElement = elements.create("payment");
    cardElement.mount("#card-element");

    setTimeout(() => {
      const form = document.getElementsByTagName("form")[0];
      const bookButton = document.createElement("button");
      bookButton.id = "bookButton";
      bookButton.className = "btn-book";
      bookButton.type = "submit";
      bookButton.textContent = `Book for SGD $${paymentAmount}`;
      bookButton.disabled = true;

      // Add click event listener
      // bookButton.addEventListener("click", async function (e) {
      //   e.preventDefault(); // Prevent the default form submission

      //   console.log("Client secret:", clientSecret);

      //   if (clientSecret) {
      //     await confirmPay(clientSecret);
      //   } else {
      //     console.error("Client secret is not available");
      //   }
      // });

      form.appendChild(bookButton);

      // Add the show class to trigger the animation

      // Listen for changes to detect the selected payment method
      cardElement.on("change", (event) => {
        const errorDisplay = document.getElementById("card-errors");
        const bookButton = document.getElementById("bookButton");

        console.log("bookButton:", bookButton);
        if (event.complete === false) {
          bookButton.disabled = true;
        } else if (event.error) {
          errorDisplay.textContent = event.error.message;
          bookButton.disabled = true;
        } else {
          errorDisplay.textContent = "";
          bookButton.disabled = false;

          // Capture the selected payment method
          if (event.value && event.value.type) {
            selectedPaymentMethod = event.value.type;
            console.log("Selected payment method:", selectedPaymentMethod);
          }
        }
      });

      setTimeout(() => {
        bookButton.classList.add("show");
      }, 10); // Small delay to ensure the element is added to the DOM before the animation starts
    }, 650);
  } catch (error) {
    console.error("Error setting up Stripe elements:", error);
  }

  // const paymentElementOptions = {
  //   layout: "accordion",
  // };

  // const cardElement = elements.create("payment");
  // cardElement = elements.create("payment");
  // cardElement.on("change", (event) => {
  //   const errorDisplay = document.getElementById("card-errors");
  //   const bookButton = document.getElementById("bookButton");

  //   // Display errors in the UI and disable the button if there's an error
  //   if (event.error) {
  //     errorDisplay.textContent = event.error.message;
  //     bookButton.disabled = true;
  //   } else {
  //     errorDisplay.textContent = '';
  //     bookButton.disabled = false;
  //   }
  // });

  // // Mount the card element into the #card-element div
  // cardElement.mount("#card-element");
}

// Function to confirm the payment
async function confirmPayment(clientSecret) {
  const errorMessageContainer = document.getElementById("card-errors");
  const spinner = document.getElementById("spinner");
  const bookButton = document.getElementById("bookButton");

  bookButton.disabled = true;
  spinner.style.display = "block"; // Show loading spinner

  try {
    const { error: submitError } = await elements.submit();
    if (submitError) {
      errorMessageContainer.textContent = submitError.message;
      bookButton.disabled = false;
      spinner.style.display = "none";
      return;
    }

    if (selectedPaymentMethod === "card") {
      // Confirm card payment
      const { error } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `http://www.localhost:3000/paymentReceipt.html`,
        },
      });

      if (error) {
        errorMessageContainer.textContent = error.message;
      }
    } else if (selectedPaymentMethod === "paynow") {
      // Confirm PayNow payment
      const res = await stripe.confirmPayNowPayment(clientSecret);
      console.log("res: ", res);
      if (res.paymentIntent.status === "succeeded") {
        console.log("Payment successful via PayNow");
        createSlot();
      } else {
        console.log("PayNow payment cancelled");
      }
    } else {
      console.error("Unknown payment method selected:", selectedPaymentMethod);
    }
  } catch (err) {
    console.error("Unexpected error during payment confirmation:", err);
    errorMessageContainer.textContent =
      "An unexpected error occurred. Please try again.";
  } finally {
    bookButton.disabled = false;
    spinner.style.display = "none"; // Hide loading spinner
  }
  // stripe.confirmPayNowPayment(
  //   clientSecret,
  // )
  // .then((res) => {
  //   if(res.paymentIntent.status === 'succeeded') {
  //     // The user scanned the QR code
  //     console.log('Payment successful');
  //     // createPayout(100000);
  //   } else {
  //     // The user closed the modal, cancelling payment
  //     console.log('Payment cancelled');
  //   }
  // });
}

// Handling form submission
document.getElementById("paymentForm").addEventListener("submit", handleSubmit);

async function handleSubmit(event) {
  // Prevent the default form submission behavior
  event.preventDefault();

  // Update PaymentIntent with the selected payment method
  // try {
  //   if (selectedPaymentMethod === "card") {
  //     await stripe.paymentIntents.update(clientSecret, {
  //       payment_method_types: ["card"],
  //     });
  //   } else if (selectedPaymentMethod === "paynow") {
  //     await stripe.paymentIntents.update(clientSecret, {
  //       payment_method_types: ["paynow"],
  //     });
  //   }

  //   // Confirm the payment
  //   const result = await stripe.confirmPayment({
  //     clientSecret: clientSecret,
  //     confirmParams: {
  //       return_url: "https://your-site.com/payment-success",
  //     },
  //   });

  //   if (result.error) {
  //     console.error("Payment failed:", result.error.message);
  //   } else {
  //     console.log("Payment succeeded:", result.paymentIntent);
  //   }
  // } catch (error) {
  //   console.error("Error updating PaymentIntent:", error.message);
  // }

  await confirmPayment(clientSecret);
}

// FOR CARD PAYMENT
// function createPayout(amount) {
//   fetch("/api/payment/payout", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json"
//     },
//     body: JSON.stringify({ amount })
//   })
//   .then((response) => {
//     if (!response.ok) {
//       throw new Error("Failed to create payout.");
//     }

//     return response.json();
//   })
//   .then((data) => {
//     console.log("Payout created successfully:", data);
//   })
//   .catch((error) => {
//     console.error("Error creating payout:", error);
//     alert(`Error creating payout: ${error.message}`);
//   });
// }

async function updateTierForAccount() {
  try {
    console.log("Updating tier for account:", accountId);

    // Call the API to update the tier
    const response = await fetch(`/api/payment/${accountId}/tier`, {
      method: "PUT",
    });

    if (!response.ok) {
      throw new Error("Failed to update tier for account.");
    }

    const data = await response.json();

    // Check if the tier was upgraded
    if (data.tierUpdated) {
      // Update localStorage if the tier was upgraded
      const userDetails = JSON.parse(localStorage.getItem("userDetails")) || {};
      localStorage.setItem(
        "userDetails",
        JSON.stringify({
          ...userDetails,
          tier: data.newTier, // Update the tier in localStorage
        })
      );
      alert(data.message);
    } else {
      alert(data.message); // Notify the user that the tier was retained
    }
  } catch (error) {
    console.error("Error updating tier for account:", error);
    alert(`Error updating tier for account: ${error.message}`);
  }
}



//update the localstorage
