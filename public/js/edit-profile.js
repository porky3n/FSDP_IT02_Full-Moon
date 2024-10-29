document.addEventListener("DOMContentLoaded", function () {
  // Load navbar and footer
  fetch("navbar.html")
    .then((response) => response.text())
    .then((data) => {
      document.getElementById("navbar-container").innerHTML = data;
    });

  fetch("footer.html")
    .then((response) => response.text())
    .then((data) => {
      document.getElementById("footer-container").innerHTML = data;
    });

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
          alert("Please upload a valid image file");
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
  // Store initial form values
  const form = document.getElementById("profileForm");
  let initialFormData = {};

  // Function to get current form data
  function getCurrentFormData() {
    return {
      firstName: document.getElementById("firstName").value,
      lastName: document.getElementById("lastName").value,
      email: document.getElementById("email").value,
      biography: document.getElementById("biography").value,
      profilePicture: document.getElementById("profilePreview").src,
    };
  }

  // Store initial values once the form is loaded
  if (form) {
    initialFormData = getCurrentFormData();
  }
  // Function to check if form has changes
  function hasFormChanges() {
    const currentData = getCurrentFormData();
    return Object.keys(initialFormData).some(
      (key) => initialFormData[key] !== currentData[key]
    );
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

    return isValid;
  }

  // Handle form submission
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      // Check if all required fields are filled
      if (!validateForm()) {
        alert("Please fill in all required fields.");
        return;
      }

      // Check if any changes were made
      if (!hasFormChanges()) {
        alert("No changes have been made to the profile.");
        return;
      }

      // If everything is valid and changes were made, proceed with submission
      alert("Profile updated successfully!");
      window.location.href = "./user-profile.html";
    });
  }

  // Handle "Add Child" button
  const addChildBtn = document.getElementById("addChildBtn");
  if (addChildBtn) {
    addChildBtn.addEventListener("click", function (e) {
      e.preventDefault();
      window.location.href = "./add-child.html";
    });
  }

  // Handle cancel button if exists
  const cancelBtn = document.querySelector(".btn-cancel");
  if (cancelBtn) {
    cancelBtn.addEventListener("click", function (e) {
      e.preventDefault();
      if (
        confirm(
          "Are you sure you want to cancel? Any unsaved changes will be lost."
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

  // Form submission logic and validation would follow here
});
