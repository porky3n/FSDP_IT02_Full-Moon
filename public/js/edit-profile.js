document.addEventListener("DOMContentLoaded", function () {
  // Load external navbar and footer into the template
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

  const signInModal = document.getElementById("signInModal");
  let initialFormData = {};

  // Check if user is authenticated
  function isAuthenticated() {
    const token = localStorage.getItem("token");
    return token !== null && token !== undefined;
  }

  // Handle sign in modal
  document.getElementById("goToSignIn").addEventListener("click", function () {
    window.location.href = "../userSignIn.html";
  });

  document
    .getElementById("closeSignInModal")
    .addEventListener("click", function () {
      signInModal.style.display = "none";
    });

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

  // Function to check if form has changes
  function hasFormChanges() {
    const currentData = getCurrentFormData();
    return Object.keys(currentData).some(
      (key) => initialFormData[key] !== currentData[key]
    );
  }

  // Validate phone number format
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
    const form = document.getElementById("profileForm");
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

  // Handle profile picture upload
  function initializeProfilePicture() {
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
  }

  // Fetch and display profile data
  async function fetchProfileData() {
    if (!isAuthenticated()) {
      showSignInModal(
        "Please sign in to view and edit your profile information."
      );
      return;
    }

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
        if (response.status === 401) {
          signInModal.style.display = "flex";
          return;
        }
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

      // Initialize profile picture handling
      initializeProfilePicture();
    } catch (error) {
      console.error("Error fetching profile data:", error);
      if (error.message.includes("401")) {
        signInModal.style.display = "flex";
      }
    }
  }

  // Initialize form submission handling
  function initializeFormSubmission() {
    const form = document.getElementById("profileForm");
    const confirmationModal = document.getElementById("confirmationModal");

    if (form) {
      form.addEventListener("submit", async function (e) {
        e.preventDefault();

        if (!validateForm()) {
          alert("Please fill in all required fields.");
          return;
        }

        if (!hasFormChanges()) {
          alert("No changes have been made to the profile.");
          return;
        }

        confirmationModal.style.display = "flex";
      });

      // Handle confirm save
      document
        .getElementById("confirmSave")
        .addEventListener("click", async function () {
          confirmationModal.style.display = "none";

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

            await response.json();
            initialFormData = getCurrentFormData();
            window.location.href = "./user-profile.html";
          } catch (error) {
            console.error("Error updating profile:", error);
            alert("Failed to update profile. Please try again later.");
          }
        });

      // Handle cancel save
      document
        .getElementById("cancelSave")
        .addEventListener("click", function () {
          confirmationModal.style.display = "none";
        });
    }
  }

  // Function to show sign in modal with custom message
  function showSignInModal(message) {
    signInMessage.textContent = message;
    signInModal.style.display = "flex";
  }

  // Initialize Add Child button with authentication check
  function initializeAddChild() {
    const addChildBtn = document.getElementById("addChildBtn");
    if (addChildBtn) {
      addChildBtn.addEventListener("click", function (e) {
        e.preventDefault();
        if (!isAuthenticated()) {
          showSignInModal("Please sign in to add a child to your profile.");
          return;
        }
        window.location.href = "./add-child.html";
      });
    }
  }

  // Initialize form field validation
  function initializeFormValidation() {
    const form = document.getElementById("profileForm");
    const inputs = form.querySelectorAll("input[required], textarea[required]");
    inputs.forEach((input) => {
      input.addEventListener("input", function () {
        this.classList.remove("is-invalid");
      });
    });
  }

  // Initialize all handlers
  async function initialize() {
    await fetchProfileData();
    if (isAuthenticated()) {
      initializeFormSubmission();
      initializeAddChild();
      initializeFormValidation();
    }
  }

  // Start initialization
  initialize();
  initializeAddChild();
  fetchProfileData();
});
