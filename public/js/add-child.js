// add-child.js
document.addEventListener("DOMContentLoaded", function () {
  // Load navbar
  fetch("navbar.html")
    .then((response) => response.text())
    .then((data) => {
      document.getElementById("navbar-placeholder").innerHTML = data;
    });

  // Load footer
  fetch("footer.html")
    .then((response) => response.text())
    .then((data) => {
      document.getElementById("footer-placeholder").innerHTML = data;
    });

  // Handle profile picture upload for child
  const uploadBtn = document.querySelector(".upload-profile-btn");
  const profileInput = document.createElement("input");
  profileInput.type = "file";
  profileInput.accept = "image/*";

  if (uploadBtn) {
    uploadBtn.addEventListener("click", function () {
      profileInput.click();
    });

    profileInput.addEventListener("change", function (e) {
      if (e.target.files && e.target.files[0]) {
        const reader = new FileReader();
        reader.onload = function (event) {
          document.querySelector(".profile-picture").src = event.target.result;
        };
        reader.readAsDataURL(e.target.files[0]);
      }
    });
  }

  // Handle child profile form submission
  const form = document.querySelector("form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      // Validate required fields
      const requiredFields = form.querySelectorAll("input[required]");
      let isValid = true;

      requiredFields.forEach((field) => {
        if (!field.value.trim()) {
          isValid = false;
          field.classList.add("is-invalid");
        } else {
          field.classList.remove("is-invalid");
        }
      });

      // Validate email format if provided
      const emailField = form.querySelector('input[type="email"]');
      if (emailField && emailField.value.trim()) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(emailField.value.trim())) {
          isValid = false;
          emailField.classList.add("is-invalid");
        }
      }

      if (isValid) {
        // Add your form submission logic here
        alert("Child profile added successfully!");
        window.location.href = "./user-profile.html";
      } else {
        alert(
          "Please check all required fields and ensure they are filled correctly."
        );
      }
    });
  }

  // Handle cancel button
  const cancelBtn = document.querySelector(".cancel-btn");
  if (cancelBtn) {
    cancelBtn.addEventListener("click", function (e) {
      e.preventDefault();
      if (
        confirm(
          "Are you sure you want to cancel? All entered information will be lost."
        )
      ) {
        window.location.href = "../user-profile.html";
      }
    });
  }
});
