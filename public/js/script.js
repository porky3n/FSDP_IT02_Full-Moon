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
    const welcomeMessageContainer = document.getElementById("welcomeMessage");
    if (welcomeMessageContainer) {
        console.log("Updating welcome message:", firstName);
        welcomeMessageContainer.textContent = `Welcome, ${firstName}!`;
        welcomeMessageContainer.classList.add("welcome-text"); // Add CSS class for styling
    } else {
        console.error("Welcome message container not found");
    }
}
