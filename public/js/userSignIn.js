// /public/js/userSignIn.js

document
  .getElementById("loginForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault(); // Prevent the default form submission

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const errorMessage = document.getElementById("error-message");

    try {
      const response = await fetch("/auth/login", {
        method: "POST", // Ensure this is POST, not GET
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (response.ok) {
        // If login is successful, store user details in localStorage
        localStorage.setItem(
          "userDetails",
          JSON.stringify({
            firstName: result.firstName, // Ensure the backend response includes firstName
            email: result.email,
          })
        );

        // Redirect the user to the home page or desired page
        window.location.href = "/index.html"; // Adjust this path based on your app's structure
      } else {
        // Display error message if login failed
        errorMessage.textContent =
          result.message || "Login failed. Please check your credentials.";
        errorMessage.style.display = "block";
      }
    } catch (error) {
      errorMessage.textContent =
        "An error occurred during login. Please try again later.";
      errorMessage.style.display = "block";
      console.error("Error:", error);
    }
  });
