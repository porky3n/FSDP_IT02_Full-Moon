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
            accountId: result.accountId,
            firstName: result.firstName, // Ensure the backend response includes firstName
            lastName: result.lastName,
            email: result.email,
            membership: result.membership,
          })
        );

        // Call updateAuthButton to update the login/logout button
        if (typeof updateAuthButton === "function") {
          updateAuthButton(); // Update the auth button immediately
        }

        // Check and reset membership tier upon successful login
        if (result.accountId) {
          await checkAndResetTierForAccount(result.accountId);
        }

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

  async function checkAndResetTierForAccount(accountId) {
    try {
        console.log("Checking membership for accountId:", accountId);
        const response = await fetch(`/api/tier/${accountId}/checkMembership`, {
            method: 'PUT',
        });

        if (response.ok) {
            const data = await response.json();
            console.log(data.message);

            // Update localStorage if the tier was expired
            if (data.expired) {
                const updatedUserDetails = {
                    ...JSON.parse(localStorage.getItem("userDetails")),
                    membership: data.membership,
                };
                localStorage.setItem("userDetails", JSON.stringify(updatedUserDetails));

                // Store the expiration message in localStorage
                localStorage.setItem("tierExpirationMessage", data.message);
            }
        } else {
            console.error("Error resetting Membership for account:", response.statusText);
        }
    } catch (error) {
        console.error("Error resetting Membership for account:", error);
        localStorage.setItem("tierExpirationMessage", "Error resetting Membership for account.");
    }
}

//   async function checkAndResetTierForAccount(accountId) {
//     try {
//         console.log("Checking membership for accountId:", accountId);
//         const response = await fetch(`/api/tier/${accountId}/checkMembership`, {
//             method: 'PUT',
//         });

//         if (response.ok) {
//             const data = await response.json();
//             console.log(data.message);

//             // Update localStorage if the tier was expired
//             if (data.expired) {
//                 const updatedUserDetails = {
//                     ...JSON.parse(localStorage.getItem("userDetails")),
//                     membership: data.membership,
//                 };
//                 localStorage.setItem("userDetails", JSON.stringify(updatedUserDetails));

//                 // Display the message only if the tier was expired
//                 alert(data.message);
//             }
//         } else {
//             console.error("Error resetting Membership for account:", response.statusText);
//         }
//     } catch (error) {
//         console.error("Error resetting Membership for account:", error);
//         alert("Error resetting Membership for account.");
//     }
// }