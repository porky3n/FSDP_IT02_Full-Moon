// edit-profile.js
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

  // Handle profile picture upload
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

  // Handle form submission
  const form = document.querySelector("form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      // Basic form validation
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

      if (isValid) {
        // Add your form submission logic here
        alert("Profile updated successfully!");
        window.location.href = "./user-profile.html";
      }
    });
  }

  // Handle form with "Add Child" button
  const addChildForm = document.querySelector("form");
  const addChildBtn = addChildForm.querySelector(".btn-warning");
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
});
