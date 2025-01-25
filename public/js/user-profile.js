document.addEventListener("DOMContentLoaded", function () {
  // UI Elements
  const editBtn = document.querySelector(".btn-edit");
  const signInBtn = document.querySelector(".btn-signin");
  const logoutBtn = document.querySelector(".btn-logout");
  const profileContent = document.getElementById("profileContent");
  const guestContent = document.getElementById("guestContent");
  const logoutModal = new bootstrap.Modal(
    document.getElementById("logoutModal")
  );

  // Function to check if user is authenticated
  const isAuthenticated = async () => {
    try {
      const response = await fetch("/auth/profile", {
        method: "GET",
        credentials: "include",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        await clearAllStorageAndCache();
        return false;
      }
      return true;
    } catch (error) {
      console.error("Auth check error:", error);
      await clearAllStorageAndCache();
      return false;
    }
  };

  // Function to clear all storage and cache
  const clearAllStorageAndCache = async () => {
    // Clear all local storage
    localStorage.clear();

    // Clear all session storage
    sessionStorage.clear();

    // Clear specific items if they exist
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");

    // Clear cookies (except httpOnly cookies which can only be cleared by the server)
    const cookies = document.cookie.split(";");
    for (let cookie of cookies) {
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
    }

    // If you're using any other storage mechanisms, clear them here
    try {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
    } catch (e) {
      console.error("Cache clear error:", e);
    }
  };

  // Function to handle logout
  const handleLogout = async () => {
    try {
      const response = await fetch("/auth/logout", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Logout failed");
      }

      // Clear all storage and cookies
      await clearAllStorageAndCache();

      // Hide the modal
      const logoutModal = document.getElementById("logoutModal");
      if (logoutModal) {
        const bsModal = bootstrap.Modal.getInstance(logoutModal);
        if (bsModal) bsModal.hide();
      }

      // Add a small delay to ensure everything is cleared
      setTimeout(() => {
        window.location.href = "/";
      }, 100);
    } catch (error) {
      console.error("Logout error:", error);
      // Show user-friendly error message
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
    const profileContent = document.getElementById("profileContent");
    const guestContent = document.getElementById("guestContent");

    if (userName) userName.textContent = "Guest";
    if (userEmail)
      userEmail.textContent = "Please sign in to view your profile";
    if (profilePic) profilePic.src = "../images/profilePicture.png";
    if (profileContent) profileContent.style.display = "none";
    if (guestContent) guestContent.style.display = "block";
  };

  // Function to fetch and display user profile data
  const loadUserProfile = async () => {
    try {
      const response = await fetch("/auth/profile", {
        method: "GET",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.status === 401) {
        if (profileContent) profileContent.style.display = "none";
        if (guestContent) guestContent.style.display = "block";
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const profileData = await response.json();

      // Show profile content and hide guest content
      if (profileContent) profileContent.style.display = "block";
      if (guestContent) guestContent.style.display = "none";

      // Format the date
      // const formatDate = (dateStr) => {
      //   if (!dateStr) return "Not provided";
      //   const date = new Date(dateStr);
      //   if (isNaN(date.getTime())) return "Not provided";
      //   return date.toLocaleDateString("en-GB", {
      //     day: "numeric",
      //     month: "long",
      //     year: "numeric",
      //   });
      // };

      // Format membership status based on the Membership column value
      const formatMembership = (status) => {
        if (!status) return "Not a Member";
        return status === "Non-Member" ? "Not a Member" : "Member";
      };

      // Update profile fields
      const profileFields = {
        userName: `${profileData.FirstName} ${profileData.LastName}`,
        userEmail: profileData.Email,
        userDOB: formatDate(profileData.DateOfBirth),
        userContact: profileData.ContactNumber || "Not provided",
        userMembership: formatMembership(profileData.Membership),

        userDietary: profileData.Dietary || "Not provided",
      };
      console.log(profileData.Membership);

      Object.entries(profileFields).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
          element.textContent = value;
        }
      });

      // Update profile picture with error handling
      const profilePic = document.querySelector(".profile-picture");
      if (profilePic) {
        try {
          await fetch(
            profileData.ProfilePicture || "../images/profilePicture.png"
          );
          profilePic.src =
            profileData.ProfilePicture || "../images/profilePicture.png";
        } catch {
          profilePic.src = "../images/profilePicture.png";
        }
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      // Show guest content on error
      if (profileContent) profileContent.style.display = "none";
      if (guestContent) guestContent.style.display = "block";
    }
  };

  const initializeProgrammeCards = async () => {
    // This function can be implemented later for programme cards
    console.log("Programme cards initialization will be implemented later");
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
  const loadEnrolledProgrammes = async () => {
    try {
      const response = await fetch("/auth/enrolled-programmes", {
        method: "GET",
        credentials: "include",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const programmes = await response.json();
      const container = document.getElementById("programmesContainer");
  
      if (!container) {
        console.error("Programmes container not found");
        return;
      }
  
      if (programmes.length === 0) {
        container.innerHTML =
          '<div class="col-12"><p class="text-center">No enrolled programmes found.</p></div>';
        return;
      }
  
      let meetingLink = "";

      container.innerHTML = programmes
      .map((prog) => {
        // Convert StartDateTime to a Date object
        const currentTime = new Date();
        const startTime = parseDate(prog.StartDateTime);
        const endTime = parseDate(prog.StartDateTime);

        // console.log(startTime);
        // console.log(parseDate(startTime));

        console.log(currentTime);
        meetingLink = prog.MeetingLink;
        console.log("Meeting Link: ", prog.MeetingLink);
        const isOnline = prog.Location === "Online";
        const isNear =
        ((startTime - currentTime) / (1000 * 60) <= 5) || // Within 5 minutes of startTime
        (currentTime < endTime); // Current time is before endTime

        return `
          <div class="col-md-6 col-lg-4 mb-4">
            <div class="programme-card h-100">
              <div class="programme-info p-3">
                <h5 class="card-title text-primary date">${prog.ProgrammeName}</h5>
                <p class="card-text">
                  <small class="text-muted">
                    Enrolled: ${prog.EnrolledFirstName} ${prog.EnrolledLastName}
                    <span class="badge ${
                      prog.EnrolledType === "Parent"
                        ? "bg-primary"
                        : "bg-success"
                    } ms-2">
                      ${prog.EnrolledType}
                    </span>
                  </small>
                </p>
                <p class="card-text description">${prog.Description}</p>
                <div class="mt-3">
                  <p class="mb-1"><strong>Level:</strong> ${prog.ProgrammeLevel}</p>
                  <p class="mb-1"><strong>Location:</strong> ${prog.Location}</p>
                  <div class="schedule-details mt-2 border-top pt-2">
                    <p class="mb-1"><strong>Schedule:</strong></p>
                    <div class="ps-3">
                      <p class="mb-1">
                        <i class="bi bi-clock"></i> Start: ${prog.StartDateTime}
                      </p>
                      <p class="mb-0">
                        <i class="bi bi-clock-fill"></i> End: ${prog.EndDateTime}
                      </p>
                    </div>
                  </div>
                  ${
                    isOnline
                      ? 
                      `<button 
                        class="btn btn-primary mt-3 create-meeting-btn" 
                        data-programme-id="${prog.ProgrammeID}" 
                        ${isNear ? "" : "disabled"}>
                        Join Meeting
                      </button>
                      `
                      : ""
                  }
                </div>
              </div>
            </div>
          </div>
        `;
      })
      .join("");

      // Add click event listeners to "Join Meeting" buttons
      document.querySelectorAll(".create-meeting-btn").forEach((button) => {
        button.addEventListener("click", (event) => {
          if (meetingLink) {
            window.open(meetingLink, "_blank");
          } else {
            alert("Meeting link not available");
          }
        });
      });

    } catch (error) {
      console.error("Error loading enrolled programmes:", error);
      const container = document.getElementById("programmesContainer");
      if (container) {
        container.innerHTML =
          '<div class="col-12"><p class="text-center text-danger">Please sign in to see enrolled programmes.</p></div>';
      }
    }
  };
  

  // Initialize all functionality
  const initialize = async () => {
    await updateUIBasedOnAuth();
    await loadUserProfile();
    await loadEnrolledProgrammes(); // Add this line
    initializeEventListeners();
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "Not provided";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "Not provided";
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const parseDate = (dateStr) => {
    // Example: "20 January 2025 at 11:53 pm"
    const [day, month, year, hourMinute, period] = dateStr
      .replace(" at ", " ")
      .split(/[\s]+/); // Split by spaces only
  
    // Extract hours and minutes from hourMinute
    const [hour, minute] = hourMinute.split(":").map(Number);
  
    // Convert month name to zero-based index
    const monthIndex = new Date(`${month} 1, ${year}`).getMonth();
  
    // Adjust hours for 24-hour format
    const adjustedHour = hour + (period.toLowerCase() === "pm" && hour !== 12 ? 12 : 0);
  
    // Handle midnight case (12 am is hour 0)
    const finalHour = period.toLowerCase() === "am" && hour === 12 ? 0 : adjustedHour;
  
    // Return the Date object
    return new Date(year, monthIndex, parseInt(day, 10), finalHour, minute);
  };
  

  // Start initialization
  initialize();
});
