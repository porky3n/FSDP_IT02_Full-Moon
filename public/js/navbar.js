document.addEventListener('DOMContentLoaded', function () {
    // Call updateAuthButton when the DOM content is loaded
    updateAuthButton();
});

function updateAuthButton() {
    const authButtonContainer = document.getElementById('authButtonContainer');
    const userDetails = JSON.parse(localStorage.getItem('userDetails'));

    if (authButtonContainer) {
        if (userDetails && userDetails.firstName) {
            // User is logged in, show "Log Out" button
            authButtonContainer.innerHTML = `<a href="#" class="btn btn-danger rounded-pill" onclick="logout()">Log Out</a>`;
        } else {
            // User is not logged in, show "Log In" button
            authButtonContainer.innerHTML = `<a href="/userSignIn.html" class="btn btn-warning rounded-pill">Log In</a>`;
        }
    }
}

function logout() {
    // Clear local storage
    localStorage.removeItem('userDetails');

    // Update the button back to "Log In"
    updateAuthButton();

    // Update the welcome message to "Guest"
    displayWelcomeMessage('Guest');

    // Redirect to home page or refresh to update UI
    window.location.href = 'index.html';
}
