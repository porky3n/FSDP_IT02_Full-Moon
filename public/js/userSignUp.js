// JavaScript for Sign-Up Page

// Date of Birth (DOB) validation with date picker
document.addEventListener('DOMContentLoaded', function() {
    const dobInput = document.getElementById('dob');
    dobInput.addEventListener('focus', function() {
        dobInput.type = 'date'; // Convert to date input on focus
    });
    dobInput.addEventListener('blur', function() {
        dobInput.type = 'text'; // Revert to text input on blur
        if (!dobInput.value) {
            dobInput.placeholder = 'Date of Birth (DD/MM/YYYY)';
        }
    });
});

// Password and Confirm Password validation
const password = document.getElementById('password');
const confirmPassword = document.getElementById('confirmPassword');
const passwordError = document.getElementById('passwordError');

confirmPassword.addEventListener('input', function() {
    if (password.value !== confirmPassword.value) {
        passwordError.style.display = 'block';
    } else {
        passwordError.style.display = 'none';
    }
});

// Form submission handler
// /public/js/userSignUp.js

document.getElementById('signUpForm').addEventListener('submit', async function (event) {
    event.preventDefault(); // Prevent the default form submission

    // Gather form data
    const firstName = document.querySelector('input[placeholder="First Name"]').value;
    const lastName = document.querySelector('input[placeholder="Last Name"]').value;
    const email = document.querySelector('input[type="email"]').value;
    const dob = document.getElementById('dob').value;
    const countryCode = document.getElementById('countryCode').value;
    const phoneNumber = document.querySelector('input[type="tel"]').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const termsAccepted = document.getElementById('terms').checked;
    const passwordError = document.getElementById('passwordError');

    // Validate password confirmation
    if (password !== confirmPassword) {
        passwordError.style.display = 'block';
        return;
    } else {
        passwordError.style.display = 'none';
    }

    if (!termsAccepted) {
        alert("Please accept the terms and privacy policy.");
        return;
    }

    try {
        // Send data to backend
        const response = await fetch('/auth/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                firstName,
                lastName,
                email,
                dob,
                phoneNumber: countryCode + phoneNumber,
                password
            })
        });

        const result = await response.json();

        if (response.ok) {
            alert("Account created successfully! Redirecting to sign in.");
            window.location.href = '/userSignIn.html'; // Redirect to sign-in page
        } else {
            alert(result.message || 'Signup failed. Please try again.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred during signup. Please try again.');
    }
});
