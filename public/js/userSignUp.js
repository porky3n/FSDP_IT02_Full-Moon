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
const signUpForm = document.getElementById('signUpForm');
signUpForm.addEventListener('submit', function(event) {
    if (password.value !== confirmPassword.value) {
        event.preventDefault(); // Prevent form submission if passwords don't match
        passwordError.style.display = 'block';
    }
});
