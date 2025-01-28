$(document).ready(function () {
    console.log("Script initialized");

    // Load the navbar and footer content dynamically
    $("#navbar-container").load("navbar.html");
    $("#footer-container").load("footer.html");

    // Directly check session and fetch user details
    checkSessionAndDisplayWelcomeMessage();
});

// Check the session and display welcome message
async function checkSessionAndDisplayWelcomeMessage() {
    try {
        // Fetch session details from the backend
        const response = await fetch("/auth/check-session", {
            method: "GET",
            credentials: "include",
            headers: {
                Accept: "application/json",
            },
        });

        const sessionData = await response.json();

        if (sessionData.isLoggedIn && sessionData.firstName) {
            // Store user details in localStorage
            localStorage.setItem(
                "userDetails",
                JSON.stringify({
                    accountId: sessionData.accountId,
                    firstName: sessionData.firstName,
                    email: sessionData.email,
                    membership: sessionData.membership,
                })
            );

            // Update welcome message
            displayWelcomeMessage(sessionData.firstName);
        } else {
            displayWelcomeMessage("Guest");
        }
    } catch (error) {
        console.error("Error checking session:", error);
        displayWelcomeMessage("Guest");
    }
}


// Display the welcome message
function displayWelcomeMessage(firstName) {
    const welcomeMessageContainer = document.getElementById('welcomeMessage');
    welcomeMessageContainer.textContent = `Welcome, ${firstName}!`;
    welcomeMessageContainer.classList.add('welcome-text'); // Add CSS class for styling
};

async function checkAndResetTierForAccount(accountId) {
    try {
      console.log("accountId:", accountId);
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
  
          // Display the message only if the tier was expired
          alert(data.message);
        }
      } else {
        console.error("Error resetting Membership for account:", response.statusText);
      }
    } catch (error) {
      console.error("Error resetting Membership for account:", error);
      alert("Error resetting Membership for account.");
    }
  }
  
