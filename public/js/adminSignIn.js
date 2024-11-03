// /public/js/adminSignIn.js

document.getElementById('adminSignInForm').addEventListener('submit', handleAdminLogin);

async function handleAdminLogin(event) {
    event.preventDefault(); // Prevent form submission
  
    const email = document.querySelector('input[placeholder="Admin Email"]').value;
    const password = document.querySelector('input[placeholder="Password"]').value;
  
    try {
      const response = await fetch('/auth/admin-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
  
      const result = await response.json();
  
      if (response.ok && result.message === 'Admin login successful') {
        // Successful login as admin, redirect
        window.location.href = 'adminHomePage.html';
      } else {
        // Display an error message
        displayError(result.message || 'Login failed. Please try again.');
      }
    } catch (error) {
      displayError('An error occurred during login. Please try again later.');
      console.error('Error:', error);
    }
  }
  

function displayError(message) {
    const errorMessage = document.getElementById('error-message');
    if (!errorMessage) {
        const errorDiv = document.createElement('div');
        errorDiv.id = 'error-message';
        errorDiv.className = 'text-danger mt-3';
        errorDiv.textContent = message;
        document.getElementById('adminSignInForm').appendChild(errorDiv);
    } else {
        errorMessage.textContent = message;
    }
}
