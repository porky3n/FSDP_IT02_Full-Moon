// user-profile.js
document.addEventListener("DOMContentLoaded", function () {
  // Function to fetch user profile data
  const loadUserProfile = async () => {
    try {
      const response = await fetch("/api/profile", {
        method: "GET",
        credentials: "include", // Important: Include credentials for session
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const profileData = await response.json();

      // Update profile data in the HTML
      const userName = document.getElementById("userName");
      const userEmail = document.getElementById("userEmail");

      if (userName && userEmail) {
        userName.textContent = `${profileData.FirstName} ${profileData.LastName}`;
        userEmail.textContent = profileData.Email;
      }

      // Update profile picture if it exists
      const profilePic = document.querySelector(".profile-picture");
      if (profilePic && profileData.ProfilePicture) {
        profilePic.src = `/uploads/profile-pictures/${profileData.ProfilePicture}`;
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      // Show error message to user
      const userName = document.getElementById("userName");
      const userEmail = document.getElementById("userEmail");

      if (userName && userEmail) {
        userName.textContent = "Error loading profile";
        userEmail.textContent = "Please try again later";
      }
    }
  };

  // Load user profile when page loads
  loadUserProfile();

  // Handle edit button click
  const editBtn = document.querySelector(".btn-edit");
  if (editBtn) {
    editBtn.addEventListener("click", function () {
      window.location.href = "./edit-profile.html";
    });
  }

  // Handle profile picture click for upload functionality
  const profilePic = document.querySelector(".profile-picture");
  if (profilePic) {
    profilePic.addEventListener("click", function () {
      const fileInput = document.createElement("input");
      fileInput.type = "file";
      fileInput.accept = "image/*";

      fileInput.onchange = async function () {
        const file = fileInput.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("profilePicture", file);

        try {
          const response = await fetch("/api/profile/picture", {
            method: "POST",
            body: formData,
          });

          if (!response.ok) {
            throw new Error("Failed to upload profile picture");
          }

          const data = await response.json();
          profilePic.src = `/uploads/profile-pictures/${data.profilePicture}`;
        } catch (error) {
          console.error("Error uploading profile picture:", error);
          // Optional: Show error message to user
          alert("Failed to upload profile picture. Please try again.");
        }
      };

      fileInput.click();
    });

    // Profile picture hover effects
    profilePic.addEventListener("mouseenter", function () {
      this.style.opacity = "0.8";
    });
    profilePic.addEventListener("mouseleave", function () {
      this.style.opacity = "1";
    });
  }

  // Handle programme card hover effects
  const programmeCards = document.querySelectorAll(".programme-card");
  programmeCards.forEach((card) => {
    card.addEventListener("mouseenter", function () {
      this.style.transform = "translateY(-5px)";
      this.style.boxShadow = "0 4px 15px rgba(0,0,0,0.1)";
    });
    card.addEventListener("mouseleave", function () {
      this.style.transform = "translateY(0)";
      this.style.boxShadow = "0 2px 10px rgba(0,0,0,0.1)";
    });
  });

  // Load navbar
  fetch("navbar.html")
    .then((response) => response.text())
    .then((data) => {
      document.getElementById("navbar-placeholder").innerHTML = data;
    })
    .catch((error) => console.error("Error loading navbar:", error));

  // Load footer
  fetch("footer.html")
    .then((response) => response.text())
    .then((data) => {
      document.getElementById("footer-placeholder").innerHTML = data;
    })
    .catch((error) => console.error("Error loading footer:", error));
});
