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

  let selectedProfilePicture = null;
  let initialFormData = {};

  // Create and append modal for file size error
  const modalHTML = `
      <div id="fileSizeModal" class="modal" style="display: none; position: fixed; z-index: 1000; left: 0; top: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.4);">
        <div class="modal-content" style="background-color: #fefefe; margin: 15% auto; padding: 20px; border: 1px solid #888; width: 80%; max-width: 500px; border-radius: 5px;">
          <h2>File Too Large</h2>
          <p>The selected image must be smaller than 10MB. Please choose a smaller file.</p>
          <button onclick="document.getElementById('fileSizeModal').style.display='none'" class="btn btn-primary">OK</button>
        </div>
      </div>
    `;
  document.body.insertAdjacentHTML("beforeend", modalHTML);

  // Function to show file size error modal
  function showFileSizeError() {
    document.getElementById("fileSizeModal").style.display = "block";
  }

  // Get DOM elements
  const form = document.getElementById("profileForm");
  const profilePictureInput = document.getElementById("profilePictureInput");
  const profilePreview = document.getElementById("profilePreview");
  const uploadButton = document.getElementById("uploadButton");
  let profPicture;

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

      // Set profile picture
      if (profileData.ProfilePicture) {
        profilePreview.src = profileData.ProfilePicture;
      } else {
        profilePreview.src = "/api/placeholder/400/320";
      }

      // Store initial data
      initialFormData = {
        firstName: profileData.FirstName || "",
        lastName: profileData.LastName || "",
        email: profileData.Email || "",
        contactNumber: profileData.ContactNumber || "",
        dietary: profileData.Dietary || "",
        profilePicture:
          profileData.ProfilePicture || "/api/placeholder/400/320",
      };
    } catch (error) {
      console.error("Error fetching profile data:", error);
      alert("Failed to load profile data. Please try again later.");
    }
  }

  async function handleProfilePictureUpload(file) {
    console.log(selectedProfilePicture);
    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please upload a valid image file");
      profilePictureInput.value = ""; // Clear the input
      return;
    }

    // Validate file size (10MB = 10 * 1024 * 1024 bytes)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      showFileSizeError();
      profilePictureInput.value = ""; // Clear the input
      return;
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async function (e) {
        try {
          // Update preview immediately
          profilePreview.src = e.target.result;

          // Attempt to upload
          const response = await fetch("/auth/profile/picture", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            credentials: "include",
            body: JSON.stringify({ profilePicture: e.target.result }),
          });

          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }

          await response.json();
          resolve();
        } catch (error) {
          console.error("Error updating profile picture:", error);
          alert("Failed to update profile picture. Please try again later.");
          // Revert preview on error
          profilePreview.src =
            initialFormData.profilePicture || "/api/placeholder/400/320";
          reject(error);
        }
      };
      reader.readAsDataURL(file);
    });
  }

  if (uploadButton) {
    uploadButton.addEventListener("click", (e) => {
      e.preventDefault();
      profilePictureInput.click();
    });
  }

  if (profilePictureInput) {
    profilePictureInput.addEventListener("change", async function (e) {
      if (e.target.files && e.target.files[0]) {
        profPicture = e.target.files[0];
        console.log(profPicture);
        await handleProfilePictureSelection(e.target.files[0]);
      }
    });
  }

  // Function to get current form data
  function getCurrentFormData() {
    return {
      firstName: document.getElementById("firstName").value,
      lastName: document.getElementById("lastName").value,
      email: document.getElementById("email").value,
      contactNumber: document.getElementById("phoneNumber").value,
      dietary: document.getElementById("dietary").value,
      profilePicture:
        selectedProfilePicture || document.getElementById("profilePreview").src,
    };
  }

  // Store initial values once the form is loaded
  if (form) {
    form.addEventListener("submit", async function (e) {
      e.preventDefault();

      if (!validateForm()) {
        alert("Please fill in all required fields correctly.");
        return;
      }

      const modal = document.getElementById("confirmationModal");
      modal.style.display = "flex";

      document.getElementById("confirmSave").onclick = async function () {
        modal.style.display = "none";

        try {
          // First update the profile data
          const formData = {
            firstName: document.getElementById("firstName").value,
            lastName: document.getElementById("lastName").value,
            email: document.getElementById("email").value,
            contactNumber: document.getElementById("phoneNumber").value,
            dietary: document.getElementById("dietary").value,
          };

          console.log("Hello1");
          const profileResponse = await fetch("/auth/profile", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            credentials: "include",
            body: JSON.stringify(formData),
          });

          if (!profileResponse.ok) {
            throw new Error(`HTTP error! Status: ${profileResponse.status}`);
          }

          console.log("Hello2");

          // If there's a new profile picture, update it
          if (selectedProfilePicture) {
            console.log("Hello3");

            await handleProfilePictureUpload(e.target.files[0]);
          }

          alert("Profile updated successfully");
          // window.location.href = "./user-profile.html";
        } catch (error) {
          console.error("Error updating profile:", error);
          alert("Failed to update profile. Please try again later.");
        }
      };

      document.getElementById("cancelSave").onclick = function () {
        modal.style.display = "none";
      };
    });
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
          profilePicture: document.getElementById("profilePreview").src,
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

        if (selectedProfilePicture) {
          console.log("Hello3");

          await handleProfilePictureUpload(profPicture);
        }

        const result = await response.json();
        initialFormData = getCurrentFormData();
        // window.location.href = "./user-profile.html";
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

  async function handleProfilePictureSelection(file) {
    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please upload a valid image file");
      profilePictureInput.value = ""; // Clear the input
      return;
    }

    // Validate file size (10MB = 10 * 1024 * 1024 bytes)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      showFileSizeError();
      profilePictureInput.value = ""; // Clear the input
      return;
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = function (e) {
        try {
          // Update preview immediately
          profilePreview.src = e.target.result;
          // Store the base64 string for later use
          selectedProfilePicture = e.target.result;
          resolve();
        } catch (error) {
          console.error("Error processing profile picture:", error);
          profilePreview.src =
            initialFormData.profilePicture || "/api/placeholder/400/320";
          reject(error);
        }
      };
      reader.readAsDataURL(file);
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
  // Call fetchProfileData when the page loads
  fetchProfileData();
});
