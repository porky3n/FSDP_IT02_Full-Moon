document.addEventListener("DOMContentLoaded", function () {
  // Load navbar and footer
  fetch("navbar.html")
    .then((response) => response.text())
    .then((data) => {
      document.getElementById("navbar-placeholder").innerHTML = data;
    });

  fetch("footer.html")
    .then((response) => response.text())
    .then((data) => {
      document.getElementById("footer-placeholder").innerHTML = data;
    });

  // Store initial form values
  const form = document.getElementById("childProfileForm");
  let initialFormData = {};

  // Function to get current form data
  function getCurrentFormData() {
    return {
      firstName: document.getElementById("firstName").value,
      lastName: document.getElementById("lastName").value,
      dob: document.getElementById("dob").value,
      school: document.getElementById("school").value,
      level: document.getElementById("level").value,
      email: document.getElementById("email").value,
      biography: document.getElementById("biography").value,
      profilePicture: document.getElementById("profilePreview").src,
    };
  }

  // Store initial values once the form is loaded
  if (form) {
    initialFormData = getCurrentFormData();
  }

  // Handle profile picture upload
  const uploadButton = document.getElementById("uploadButton");
  const profilePictureInput = document.getElementById("profilePictureInput");
  const profilePreview = document.getElementById("profilePreview");

  if (uploadButton && profilePictureInput) {
    uploadButton.addEventListener("click", () => {
      profilePictureInput.click();
    });

    profilePictureInput.addEventListener("change", function (e) {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];

        // Validate file type
        if (!file.type.startsWith("image/")) {
          alert("Please upload an image file");
          return;
        }

        const reader = new FileReader();
        reader.onload = function (event) {
          profilePreview.src = event.target.result;
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // Function to check if form has changes
  function hasFormChanges() {
    const currentData = getCurrentFormData();
    return Object.keys(initialFormData).some(
      (key) => initialFormData[key] !== currentData[key]
    );
  }

  // Function to validate email
  function isValidEmail(email) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  }

  // Function to validate form
  function validateForm() {
    const inputs = form.querySelectorAll("input[required], textarea[required]");
    let isValid = true;

    inputs.forEach((input) => {
      if (!input.value.trim()) {
        input.classList.add("is-invalid");
        isValid = false;
      } else {
        input.classList.remove("is-invalid");
      }
    });

    // Special validation for email
    const emailInput = document.getElementById("email");
    if (emailInput.value.trim() && !isValidEmail(emailInput.value.trim())) {
      emailInput.classList.add("is-invalid");
      isValid = false;
    }

    return isValid;
  }

  // Handle form submission
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      // Check if all required fields are filled
      if (!validateForm()) {
        alert("Please fill in all required fields correctly.");
        return;
      }

      // Check if any changes were made
      if (!hasFormChanges()) {
        alert("No changes have been made to the form.");
        return;
      }

      // If everything is valid and changes were made, proceed with submission
      alert("Child profile added successfully!");
      window.location.href = "./user-profile.html";
    });
  }

  // Handle cancel button
  const cancelBtn = document.getElementById("cancelBtn");
  if (cancelBtn) {
    cancelBtn.addEventListener("click", function (e) {
      e.preventDefault();
      if (
        confirm(
          "Are you sure you want to cancel? All entered information will be lost."
        )
      ) {
        window.location.href = "./user-profile.html";
      }
    });
  }

  // Add input event listeners to remove invalid state when user starts typing
  const inputs = form.querySelectorAll("input[required], textarea[required]");
  inputs.forEach((input) => {
    input.addEventListener("input", function () {
      this.classList.remove("is-invalid");
    });
  });
});
