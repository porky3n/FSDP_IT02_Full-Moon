document.addEventListener('DOMContentLoaded', function () {
    console.log('DOM fully loaded and parsed');
    updateAuthButton(); // Ensure the button updates on page load
    console.log("Auth Button Update Triggered");
});

// Function to update the authentication button
function updateAuthButton() {
    const authButtonContainer = document.getElementById('authButtonContainer');
    const userDetails = JSON.parse(localStorage.getItem('userDetails') || '{}');
    console.log('Auth Button Container:', authButtonContainer);
    console.log('User Details from localStorage:', userDetails);

    if (authButtonContainer) {
        if (userDetails.firstName) {
            // User is logged in, show "Log Out" button
            authButtonContainer.innerHTML = `
                <button class="btn btn-danger rounded-pill" onclick="logout()">Log Out</button>
            `;
        } else {
            // User is not logged in, show "Log In" button
            authButtonContainer.innerHTML = `
                <a href="/userSignIn.html" class="btn btn-warning rounded-pill" id="authButton">Log In</a>
            `;
        }
    } else {
        console.error('Auth button container not found.');
    }
}

// Logout function
function logout() {
    // Clear user details from localStorage
    console.log('Logging out...');
    localStorage.removeItem('userDetails');

    // Update the auth button back to "Log In"
    updateAuthButton();

    // Redirect to the home page or refresh to update the UI
    window.location.href = 'index.html';
}
