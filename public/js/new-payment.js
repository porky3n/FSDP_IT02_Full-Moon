const addPromotionLink = document.getElementById('addPromotionLink');
const promotionInput = document.getElementById('promotionInput');
const promotionInputField = document.getElementById('promotion-input-field');

addPromotionLink.addEventListener('click', function(e) {
    e.preventDefault();
    addPromotionLink.style.opacity = '0';
    setTimeout(() => {
        addPromotionLink.style.display = 'none';
        promotionInput.classList.add('show');
        promotionInputField.focus();
    }, 0);
});

document.addEventListener('click', function(e) {
    if (!promotionInput.contains(e.target) && e.target !== addPromotionLink) {
        if (promotionInputField.value.trim() === '') {
            if (promotionInput.classList.contains('show')) {
                promotionInput.classList.remove('show');
                setTimeout(() => {
                    addPromotionLink.style.display = 'block';
                    addPromotionLink.style.opacity = '1';
                }, 0);
            }
        }
    }
});


// Show "Apply" button when there is text
promotionInputField.addEventListener('input', function () {
    if (promotionInputField.value.trim() === '') {
        applyButton.classList.remove('show');
    } else {
        applyButton.classList.add('show');
    }
});

const applyButton = document.getElementById('applyButton');
// Handle "Apply" button click
applyButton.addEventListener('click', function () {
    alert(`Promotion code applied: ${promotionInputField.value}`);
});

// Handle focus and blur events for smooth transition
promotionInputField.addEventListener('focus', function () {
    promotionInputField.style.width = '380px';
    promotionInputField.style.height = '35px';
});

promotionInputField.addEventListener('blur', function () {
    if (promotionInputField.value.trim() === '') {
        promotionInputField.style.width = '250px';
        promotionInputField.style.height = '30px';
    }
});




/// Stripe Payment
  
// const stripe = Stripe('pk_test_51Qb1BvP2e3AF4UmhhiZG78Pr695qyCygnIKvbpm4EKk8t2ggA6LAc8ycF4Ghg3IAA3SB42OdemXL4eADwL7U0XeI00Qf9wG6xG');
const stripe = Stripe('pk_test_51QefolPwgB6Ze04CvONegf5es97gWPMkVLxcQv9XOBoEi26IIyvzBFmBpxHC5ORKE9eBIIACAK6uoL3dv5CpWjZx00E67kJbua');

async function initializeStripe() {
  // Wait for createPaymentIntent to complete and get the client secret
  clientSecret = await createPaymentIntent(100000);

  if (clientSecret) {
    // Proceed to set up Stripe elements and UI
    stripeCheckout(clientSecret);
  } else {
    console.error("Failed to create payment intent. Stripe Checkout cannot proceed.");
  }
}

// Call the initialization function
document.addEventListener("DOMContentLoaded", async () => {
  initializeStripe();
});



// new functions using stripe
async function createPaymentIntent(paymentAmount) {
  try {
    const response = await fetch("/api/payment/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ paymentAmount })
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
let clientSecret = '';
let elements = null;
let cardElement = null;
let selectedPaymentMethod = ''; // To store the selected payment method

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

    // Listen for changes to detect the selected payment method
    cardElement.on("change", (event) => {
      const errorDisplay = document.getElementById("card-errors");
      const bookButton = document.getElementById("bookButton");

      if (event.error) {
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

  // setTimeout (() => {
  //   const form = document.getElementsByTagName("form")[0];
  //   const bookButton = document.createElement("button");
  //   bookButton.id = "bookButton";
  //   bookButton.className = "btn-book";
  //   bookButton.type = "submit";
  //   paymentAmount = 100000;
  //   bookButton.textContent = `Book for SGD $${paymentAmount / 100}`;
  //   bookButton.disabled = true;

  //   // Add click event listener
  //   // bookButton.addEventListener("click", async function (e) {
  //   //   e.preventDefault(); // Prevent the default form submission
      
  //   //   console.log("Client secret:", clientSecret);
    
  //   //   if (clientSecret) {
  //   //     await confirmPay(clientSecret);
  //   //   } else {
  //   //     console.error("Client secret is not available");
  //   //   }
  //   // });

  //   // form.appendChild(bookButton);  

  //   // Add the show class to trigger the animation
  //   setTimeout(() => {
  //     bookButton.classList.add("show");
  //   }, 10); // Small delay to ensure the element is added to the DOM before the animation starts
  // }, 650);
  
  
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
          return_url: `http://www.localhost:3000`,
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
document.getElementById('paymentForm').addEventListener('submit', handleSubmit);

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
