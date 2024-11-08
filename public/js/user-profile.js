document.addEventListener("DOMContentLoaded", function () {
  // UI Elements
  const editBtn = document.querySelector(".btn-edit");
  const signInBtn = document.querySelector(".btn-signin");
  const logoutBtn = document.querySelector(".btn-logout");
  const logoutModal = new bootstrap.Modal(
    document.getElementById("logoutModal")
  );

  // Function to check if user is authenticated
  const isAuthenticated = async () => {
    try {
      const response = await fetch("/api/profile", {
        method: "GET",
        credentials: "include", // Important: Include credentials for session
      });

      if (!response.ok) {
        clearAllStorageAndCache();
        return false;
      }
      return true;
    } catch (error) {
      console.error("Auth check error:", error);
      clearAllStorageAndCache();
      return false;
    }
  };

  // Function to clear all storage and cache
  const clearAllStorageAndCache = () => {
    // Clear all local storage
    localStorage.clear();

    // Clear all session storage
    sessionStorage.clear();

    // Clear specific items if they exist
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");

    // Clear any cookies (except those httpOnly)
    document.cookie.split(";").forEach(function (c) {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
  };

  // Function to handle logout
  const handleLogout = async () => {
    try {
      // First clear all storage and cookies
      clearAllStorageAndCache();

      // Call logout endpoint
      const response = await fetch("/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Logout failed");
      }

      // Hide the modal
      const logoutModal = document.getElementById("logoutModal");
      if (logoutModal) {
        const bsModal = bootstrap.Modal.getInstance(logoutModal);
        if (bsModal) bsModal.hide();
      }

      // Redirect to home page
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
      alert("Error during logout. Please try again.");
    }
  };

  // Function to update UI based on authentication status
  const updateUIBasedOnAuth = async () => {
    const authenticated = await isAuthenticated();

    if (authenticated) {
      if (editBtn) editBtn.style.display = "inline-block";
      if (logoutBtn) logoutBtn.style.display = "inline-block";
      if (signInBtn) signInBtn.style.display = "none";
    } else {
      if (editBtn) editBtn.style.display = "none";
      if (logoutBtn) logoutBtn.style.display = "none";
      if (signInBtn) signInBtn.style.display = "inline-block";
      showGuestProfile();
    }
  };

  // Function to show guest profile
  const showGuestProfile = () => {
    const userName = document.getElementById("userName");
    const userEmail = document.getElementById("userEmail");
    const profilePic = document.querySelector(".profile-picture");

    if (userName) userName.textContent = "Guest";
    if (userEmail)
      userEmail.textContent = "Please sign in to view your profile";
    if (profilePic) profilePic.src = "/images/default-profile.png"; // Make sure to have a default image
  };

  // Function to fetch and display user profile data
  const loadUserProfile = async () => {
    try {
      const response = await fetch("/api/profile", {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const profileData = await response.json();

      // Update all profile fields
      const profileFields = {
        userName: `${profileData.FirstName} ${profileData.LastName}`,
        userEmail: profileData.Email,
        userDOB: profileData.DateOfBirth,
        userContact: profileData.ContactNumber,
        userMembership: profileData.Membership,
        userDietary: profileData.Dietary,
      };

      // Update each field if the element exists
      Object.entries(profileFields).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element && value) {
          element.textContent = value;
        }
      });

      // Update profile picture if it exists
      const profilePic = document.querySelector(".profile-picture");
      if (profilePic && profileData.ProfilePictureURL) {
        profilePic.src = profileData.ProfilePictureURL;
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      showGuestProfile();
    }
  };

  // Initialize event listeners
  const initializeEventListeners = () => {
    if (editBtn) {
      editBtn.addEventListener("click", () => {
        window.location.href = "./edit-profile.html";
      });
    }

    if (signInBtn) {
      signInBtn.addEventListener("click", () => {
        window.location.href = "./userSignIn.html";
      });
    }

    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        logoutModal.show();
      });
    }

    // Confirm logout button in modal
    const confirmLogoutBtn = document.getElementById("confirmLogout");
    if (confirmLogoutBtn) {
      confirmLogoutBtn.addEventListener("click", handleLogout);
    }
  };

  // Initialize all functionality
  const initialize = async () => {
    await updateUIBasedOnAuth();
    await loadUserProfile();
    initializeEventListeners();
    initializeProgrammeCards();
  };

  // Start initialization
  initialize();
});
