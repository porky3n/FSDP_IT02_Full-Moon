// JavaScript for Sign-Up Page

document.addEventListener("DOMContentLoaded", function () {
  // Date of Birth (DOB) validation with date picker
  const dobInput = document.getElementById("dob");
  dobInput.addEventListener("focus", function () {
    dobInput.type = "date"; // Convert to date input on focus
  });
  dobInput.addEventListener("blur", function () {
    dobInput.type = "text"; // Revert to text input on blur
    if (!dobInput.value) {
      dobInput.placeholder = "Date of Birth (DD/MM/YYYY)";
    }
  });

  // Handle gender selection buttons
  const genderButtons = document.querySelectorAll(".btn-gender");
  const genderInput = document.getElementById("gender");

  genderButtons.forEach(button => {
      button.addEventListener("click", function () {
          // Remove active class from all buttons
          genderButtons.forEach(btn => btn.classList.remove("active"));
          // Add active class to selected button
          this.classList.add("active");
          // Set hidden input value
          genderInput.value = this.getAttribute("data-gender");
      });
  });
  
  // Generate QR Code for Telegram bot
  const qrCodeContainer = document.getElementById("qrCodeContainer");
  const telegramBotLink = "https://t.me/mindSphereBot"; // Replace with your bot's username

  if (qrCodeContainer) {
    const canvas = document.createElement("canvas"); // Create a canvas element dynamically
    qrCodeContainer.appendChild(canvas); // Append the canvas to the container

    QRCode.toCanvas(canvas, telegramBotLink, { width: 200 }, function (error) {
      if (error) {
        console.error("Error generating QR Code:", error);
      } else {
        console.log("QR Code generated successfully.");
      }
    });
  } else {
    console.error("QR Code container not found.");
  }

  // Word count for the ProfileDetails textarea
  const profileDetails = document.getElementById("profileDetails");
  const wordCount = document.getElementById("wordCount");
  profileDetails.addEventListener("input", function () {
    const words = profileDetails.value.trim().split(/\s+/).filter(Boolean);
    const wordLimit = 100;

    if (words.length > wordLimit) {
      const trimmedWords = words.slice(0, wordLimit);
      profileDetails.value = trimmedWords.join(" ");
    }

    wordCount.textContent = `${words.length}/${wordLimit} words`;
  });

  // Password and Confirm Password validation
  const password = document.getElementById("password");
  const confirmPassword = document.getElementById("confirmPassword");
  const passwordError = document.getElementById("passwordError");

  confirmPassword.addEventListener("input", function () {
    if (password.value !== confirmPassword.value) {
      passwordError.style.display = "block";
    } else {
      passwordError.style.display = "none";
    }
  });

  // Form submission handler
  document.getElementById("signUpForm").addEventListener("submit", async function (event) {
    event.preventDefault(); // Prevent the default form submission

    // Gather form data
    const firstName = document.querySelector('input[placeholder="First Name"]').value;
    const lastName = document.querySelector('input[placeholder="Last Name"]').value;
    const email = document.querySelector('input[type="email"]').value;
    const dob = document.getElementById("dob").value;
    const gender = document.getElementById("gender").value;
    const countryCode = document.getElementById("countryCode").value;
    const phoneNumber = document.querySelector('input[type="tel"]').value;
    const password = document.getElementById("password").value;
    const profileDetails = document.getElementById("profileDetails").value;
    const termsAccepted = document.getElementById("terms").checked;

    if (!gender) {
      alert("Please select your gender.");
      return;
    }

    // Validate password confirmation
    if (password !== confirmPassword.value) {
      passwordError.style.display = "block";
      return;
    } else {
      passwordError.style.display = "none";
    }

    if (!termsAccepted) {
      alert("Please accept the terms and privacy policy.");
      return;
    }

    try {
      // Send data to backend
      const response = await fetch("/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          dob,
          gender,
          phoneNumber: countryCode + phoneNumber,
          password,
          profileDetails,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        alert("Account created successfully! Redirecting to sign in.");
        window.location.href = "/userSignIn.html"; // Redirect to sign-in page
      } else {
        alert(result.message || "Signup failed. Please try again.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred during signup. Please try again.");
    }
  });
});
