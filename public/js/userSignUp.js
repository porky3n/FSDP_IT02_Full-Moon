// JavaScript for Sign-Up Page

// Date of Birth (DOB) validation with date picker
document.addEventListener("DOMContentLoaded", function () {
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
const signUpForm = document.getElementById("signUpForm");
signUpForm.addEventListener("submit", function (event) {
  event.preventDefault(); // Prevent form submission

  // Check if passwords match
  if (password.value !== confirmPassword.value) {
    passwordError.style.display = "block";
    return;
  }

  // Get all form data
  const formData = {
    firstName: document.getElementById("firstName").value,
    lastName: document.getElementById("lastName").value,
    email: document.getElementById("email").value,
    dob: document.getElementById("dob").value,
    password: password.value,
    timestamp: new Date().toISOString(),
  };

  // Store user data in localStorage
  try {
    // Get existing users or initialize empty array
    const existingUsers = JSON.parse(localStorage.getItem("users")) || [];

    // Add new user
    existingUsers.push(formData);

    // Save back to localStorage
    localStorage.setItem("users", JSON.stringify(existingUsers));

    // Optional: Store current user separately
    localStorage.setItem("currentUser", JSON.stringify(formData));

    // Clear the form
    signUpForm.reset();

    // Show success message
    alert("Sign up successful!");

    // Optional: Redirect to another page
    // window.location.href = 'dashboard.html';
  } catch (error) {
    console.error("Error saving user data:", error);
    alert("There was an error signing up. Please try again.");
  }
});

// Optional: Function to retrieve users (for reference)
function getUsers() {
  const users = localStorage.getItem("users");
  return users ? JSON.parse(users) : [];
}
