document.addEventListener('DOMContentLoaded', function () {
    console.log('DOM fully loaded and parsed');
    updateAuthButton();
});

function updateAuthButton() {
    const authButtonContainer = document.getElementById('authButtonContainer');
    const userDetails = JSON.parse(localStorage.getItem('userDetails'));
    console.log('Checking localStorage:', userDetails);

    if (authButtonContainer) {
        if (userDetails && userDetails.firstName) {
            // User is logged in, show "Log Out" button
            console.log('User is logged in, updating button to Log Out');
            authButtonContainer.innerHTML = `
                <button class="btn btn-danger rounded-pill" onclick="logout()">Log Out</button>
            `;
        } else {
            // User is not logged in, show "Log In" button
            console.log('User is not logged in, showing Log In button');
            authButtonContainer.innerHTML = `
                <a href="/userSignIn.html" class="btn btn-warning rounded-pill" id="authButton">Log In</a>
            `;
        }
    } else {
        console.error('Auth button container not found.');
    }
}

function logout() {
    // Clear user details from localStorage
    localStorage.removeItem('userDetails');

    // Update the auth button back to "Log In"
    updateAuthButton();

    // Redirect to the home page or refresh to update the UI
    window.location.href = 'index.html';
}
