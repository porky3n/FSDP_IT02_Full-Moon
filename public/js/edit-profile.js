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
<<<<<<< HEAD
      dietary: document.getElementById("dietary").value,
      countryCode: document.getElementById("countryCode").value,
      phoneNumber: document.getElementById("phoneNumber").value,
=======
>>>>>>> 6a00b93b6662dd7873a01d1a8d8b2cd0108dee1c
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

  // Validate phone number format (simple validation as an example)
  function validatePhoneNumber() {
    const phoneNumber = document.getElementById("phoneNumber");
    const phoneNumberValue = phoneNumber.value.trim();
    if (!/^\d+$/.test(phoneNumberValue)) {
      phoneNumber.classList.add("is-invalid");
      return false;
    } else {
      phoneNumber.classList.remove("is-invalid");
      return true;
    }
  }

  // Function to validate form
  function validateForm() {
    const inputs = form.querySelectorAll("input[required], select[required]");
    let isValid = true;

    inputs.forEach((input) => {
      if (!input.value.trim()) {
        input.classList.add("is-invalid");
        isValid = false;
      } else {
        input.classList.remove("is-invalid");
      }
    });

    return isValid && validatePhoneNumber();
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

      // Get full phone number with country code
      const countryCode = document.getElementById("countryCode").value;
      const phoneNumber = document.getElementById("phoneNumber").value;
      const fullPhoneNumber = `${countryCode} ${phoneNumber}`;

      console.log("Full Phone Number:", fullPhoneNumber);

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
<<<<<<< HEAD
      window.location.href = "../add-child.html";
=======
      window.location.href = "./add-child.html"; // Adjust path as needed
>>>>>>> 6a00b93b6662dd7873a01d1a8d8b2cd0108dee1c
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
});
