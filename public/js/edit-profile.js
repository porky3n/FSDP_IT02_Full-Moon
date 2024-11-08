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

  // Fetch initial profile data
  async function fetchProfileData() {
    try {
      const response = await fetch("/auth/profile", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const profileData = await response.json();

      // Populate form fields
      document.getElementById("firstName").value = profileData.FirstName || "";
      document.getElementById("lastName").value = profileData.LastName || "";
      document.getElementById("email").value = profileData.Email || "";
      document.getElementById("phoneNumber").value =
        profileData.ContactNumber || "";
      document.getElementById("dietary").value = profileData.Dietary || "";

      // Store initial data for change detection
      initialFormData = {
        firstName: profileData.FirstName || "",
        lastName: profileData.LastName || "",
        email: profileData.Email || "",
        contactNumber: profileData.ContactNumber || "",
        dietary: profileData.Dietary || "",
      };
    } catch (error) {
      console.error("Error fetching profile data:", error);
      alert("Failed to load profile data. Please try again later.");
    }
  }

  // Call fetchProfileData when the page loads
  fetchProfileData();

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
      contactNumber: document.getElementById("phoneNumber").value,
      dietary: document.getElementById("dietary").value,
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
    return Object.keys(currentData).some(
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
    form.addEventListener("submit", async function (e) {
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

      // Show custom modal instead of confirm()
      const modal = document.getElementById("confirmationModal");
      modal.style.display = "flex";

      // Handle confirm button click
      document.getElementById("confirmSave").onclick = async function () {
        modal.style.display = "none";

        try {
          const formData = {
            firstName: document.getElementById("firstName").value,
            lastName: document.getElementById("lastName").value,
            email: document.getElementById("email").value,
            contactNumber: document.getElementById("phoneNumber").value,
            dietary: document.getElementById("dietary").value,
          };

          const response = await fetch("/auth/profile", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            credentials: "include",
            body: JSON.stringify(formData),
          });

          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }

          const result = await response.json();
          initialFormData = getCurrentFormData();
          window.location.href = "./user-profile.html";
        } catch (error) {
          console.error("Error updating profile:", error);
          alert("Failed to update profile. Please try again later.");
        }
      };

      // Handle cancel button click
      document.getElementById("cancelSave").onclick = function () {
        modal.style.display = "none";
      };
    });
  }

  // Handle "Add Child" button
  const addChildBtn = document.getElementById("addChildBtn");
  if (addChildBtn) {
    addChildBtn.addEventListener("click", function (e) {
      e.preventDefault();
      window.location.href = "./add-child.html"; // Adjust path as needed
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
