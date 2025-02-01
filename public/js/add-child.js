document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("childProfileForm");
  const profilePictureInput = document.getElementById("profilePictureInput");
  const profilePreview = document.getElementById("profilePreview");
  const uploadButton = document.getElementById("uploadButton");
  let currentProfilePicture = null;
  //let selectedProfilePicture = null;
  let profPicture = null;

  // Load existing children
  async function loadExistingChildren() {
    try {
      const response = await fetch("/api/children", {
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch children");
      }

      const children = await response.json();
      if (Array.isArray(children)) {
        displayChildren(children);
      } else {
        throw new Error("Invalid data format received from server");
      }
    } catch (error) {
      console.error("Error loading children:", error);
      const errorDiv = document.createElement("div");
      errorDiv.className = "alert alert-danger mt-3";
      errorDiv.role = "alert";
      errorDiv.textContent = `Error: ${error.message}. Please refresh the page or contact support if the problem persists.`;

      const container = document.querySelector(".container");
      container.insertBefore(errorDiv, container.firstChild);
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };
  function formatDateForInput(dateStr) {
    if (!dateStr) return "";
    const [day, month, year] = dateStr.split(" ");
    const monthNum = new Date(`${month} 1, 2000`).getMonth() + 1;
    return `${year}-${monthNum.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
  }

  // Function to display the children
  function displayChildren(children) {
    const childrenContainer = document.getElementById("childrenContainer");
    if (childrenContainer) {
      childrenContainer.innerHTML = "";

      children.forEach((child) => {
        const childDiv = document.createElement("div");
        childDiv.className = "child-card";

        const profilePicture = document.createElement("img");
        if (child.ProfilePicture) {
          profilePicture.src = `data:image/jpeg;base64,${child.ProfilePicture}`;
        } else {
          profilePicture.src = "images/profilePicture.png";
        }
        profilePicture.alt = `${child.FirstName} ${child.LastName}`;
        profilePicture.className = "child-profile-picture";

        const nameDiv = document.createElement("div");
        nameDiv.className = "child-name";
        nameDiv.textContent = `${child.FirstName} ${child.LastName} (${child.Relationship})`;

        const detailsDiv = document.createElement("div");
        detailsDiv.className = "child-details";
        detailsDiv.innerHTML = `
          <p>Date of Birth: ${formatDate(child.DateOfBirth)}</p>
          <p>Gender: ${child.Gender}</p>
          <p>School: ${child.School || "N/A"}</p>
          <p>Emergency Contact: ${child.EmergencyContactNumber}</p>
          <p>Dietary: ${child.Dietary || "N/A"}</p>
          <p>Health Details: ${child.HealthDetails || "N/A"}</p>
          <p>Relationship: ${child.Relationship}</p>
        `;

        const actionsDiv = document.createElement("div");
        actionsDiv.className = "child-actions";

        const editButton = document.createElement("button");
        editButton.className = "btn btn-primary btn-sm";
        editButton.textContent = "Edit";
        editButton.onclick = () => editChild(child.ChildID);

        const deleteButton = document.createElement("button");
        deleteButton.className = "btn btn-danger btn-sm";
        deleteButton.textContent = "Delete";
        deleteButton.onclick = () => deleteChild(child.ChildID);

        actionsDiv.appendChild(editButton);
        actionsDiv.appendChild(deleteButton);

        childDiv.appendChild(profilePicture);
        childDiv.appendChild(nameDiv);
        childDiv.appendChild(detailsDiv);
        childDiv.appendChild(actionsDiv);

        childrenContainer.appendChild(childDiv);
      });
    } else {
      console.error("Error: childrenContainer element not found.");
    }
  }

  async function compressImage(base64Str) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = function () {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions while maintaining aspect ratio
        const maxWidth = 800;
        const maxHeight = 800;

        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        // Compress as JPEG with 0.7 quality
        resolve(canvas.toDataURL("image/jpeg", 0.7));
      };
      img.src = base64Str;
    });
  }

  if (uploadButton) {
    uploadButton.addEventListener("click", (e) => {
      e.preventDefault();
      profilePictureInput.click();
    });
  }

  // Update the profile picture change handler
  if (profilePictureInput) {
    profilePictureInput.addEventListener("change", async function (e) {
      if (e.target.files && e.target.files[0]) {
        profPicture = e.target.files[0];
        await handleProfilePictureSelection(e.target.files[0]);
      }
      //   if (!file.type.startsWith("image/")) {
      //     alert("Please upload an image file");
      //     return;
      //   }

      //   const reader = new FileReader();
      //   reader.onload = async function (e) {
      //     try {
      //       // Compress the image before setting it
      //       const compressedImage = await compressImage(e.target.result);
      //       profilePreview.src = compressedImage;
      //       currentProfilePicture = compressedImage;
      //     } catch (error) {
      //       console.error("Error processing image:", error);
      //       alert("Error processing image. Please try a different image.");
      //     }
      //   };
      //   reader.readAsDataURL(file);
      // }
    });
  }

  // Handle form submission
  if (form) {
    form.addEventListener("submit", async function (e) {
      e.preventDefault();
      const submitBtn = document.getElementById("submitBtn");
      const isUpdate = submitBtn.textContent === "Update Child";
      const childId = form.dataset.childId;

      try {
        const formData = {
          firstName: document.getElementById("firstName").value,
          lastName: document.getElementById("lastName").value,
          dob: document.getElementById("dob").value,
          gender: document.getElementById("gender").value,
          school: document.getElementById("school").value,
          emergencyContactNumber:
            document.getElementById("emergencyContact").value,
          dietary: document.getElementById("dietary").value,
          healthDetails:
            document.getElementById("healthDetails").value || "nil",
          relationship: document.getElementById("relationship").value,
        };

        let url = "/api/children";
        let method = "POST";

        if (isUpdate && childId) {
          url = `/api/children/${childId}`;
          method = "PUT";
          if (currentProfilePicture) {
            formData.profilePicture = currentProfilePicture;
          }
        } else {
          formData.profilePicture = currentProfilePicture;
        }

        const response = await fetch(url, {
          method: method,
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message ||
              `Failed to ${isUpdate ? "update" : "add"} child`
          );
        }

        const result = await response.json();
        alert(result.message);
        resetForm();
        loadExistingChildren();
      } catch (error) {
        console.error(
          `Error ${isUpdate ? "updating" : "adding"} child:`,
          error
        );
        alert(
          `Error ${isUpdate ? "updating" : "adding"} child: ${error.message}`
        );
      }
    });
  }

  // Function to reset form
  function resetForm() {
    form.reset();
    profilePreview.src = "images/profilePicture.png";
    currentProfilePicture = null;
    const submitBtn = document.getElementById("submitBtn");
    submitBtn.textContent = "Add Child";
    form.removeAttribute("data-child-id");
  }

  // Edit child function
  window.editChild = async function (childId) {
    try {
      const response = await fetch(`/api/children/${childId}`, {
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch child details");
      }

      const child = await response.json();

      document.getElementById("firstName").value = child.FirstName;
      document.getElementById("lastName").value = child.LastName;
      document.getElementById("dob").value = formatDateForInput(
        child.DateOfBirth
      );
      document.getElementById("gender").value = child.Gender;
      document.getElementById("school").value = child.School || "";
      document.getElementById("emergencyContact").value =
        child.EmergencyContactNumber;
      document.getElementById("dietary").value = child.Dietary || "";
      document.getElementById("healthDetails").value =
        child.HealthDetails || "nil";
      document.getElementById("relationship").value = child.Relationship;

      if (child.ProfilePicture) {
        profilePreview.src = `data:image/jpeg;base64,${child.ProfilePicture}`;
        currentProfilePicture = `data:image/jpeg;base64,${child.ProfilePicture}`;
      }

      const submitBtn = document.getElementById("submitBtn");
      submitBtn.textContent = "Update Child";
      form.dataset.childId = childId;

      form.scrollIntoView({ behavior: "smooth" });
    } catch (error) {
      console.error("Error loading child details:", error);
      alert(error.message || "Error loading child details. Please try again.");
    }
  };

  // Delete child function
  window.deleteChild = async function (childId) {
    if (confirm("Are you sure you want to delete this child's profile?")) {
      try {
        const response = await fetch(`/api/children/${childId}`, {
          method: "DELETE",
          credentials: "include",
        });

        if (!response.ok) throw new Error("Failed to delete child");

        alert("Child deleted successfully!");
        loadExistingChildren();
      } catch (error) {
        console.error("Error deleting child:", error);
        alert("Error deleting child. Please try again.");
      }
    }
  };

  // Update child function
  // async function updateChild(childId) {
  //   const formData = {
  //     firstName: document.getElementById("firstName").value,
  //     lastName: document.getElementById("lastName").value,
  //     dob: document.getElementById("dob").value,
  //     gender: document.getElementById("gender").value,
  //     school: document.getElementById("school").value,
  //     emergencyContactNumber: document.getElementById("emergencyContact").value,
  //     dietary: document.getElementById("dietary").value,
  //     profilePicture: currentProfilePicture,
  //   };

  //   try {
  //     const response = await fetch(`/api/children/${childId}`, {
  //       method: "PUT",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       credentials: "include",
  //       body: JSON.stringify(formData),
  //     });

  //     if (!response.ok) throw new Error("Failed to update child");

  //     alert("Child updated successfully!");
  //     form.reset();
  //     profilePreview.src = "images/profilePicture.png";
  //     currentProfilePicture = null;

  //     const submitBtn = document.getElementById("submitBtn");
  //     submitBtn.textContent = "Add Child";
  //     submitBtn.onclick = null;

  //     loadExistingChildren();
  //   } catch (error) {
  //     console.error("Error updating child:", error);
  //     alert("Error updating child. Please try again.");
  //   }
  // }

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
          currentProfilePicture = e.target.result;
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

  // Export the loadExistingChildren function
  window.loadExistingChildren = loadExistingChildren;
});
