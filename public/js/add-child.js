document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("childProfileForm");
  const profilePictureInput = document.getElementById("profilePictureInput");
  const profilePreview = document.getElementById("profilePreview");
  let currentProfilePicture = null;

  // Load existing children
  async function loadExistingChildren() {
    try {
      const response = await fetch("/api/children", {
        credentials: "include", // Important for sending cookies
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

  // Function to display the children
  function displayChildren(children) {
    const childrenContainer = document.getElementById("childrenContainer");
    if (childrenContainer) {
      childrenContainer.innerHTML = "";

      children.forEach((child) => {
        const childDiv = document.createElement("div");
        childDiv.className = "child-card";

        const profilePicture = document.createElement("img");
        profilePicture.src =
          child.ProfilePictureURL || "images/profilePicture.png";
        profilePicture.alt = `${child.FirstName} ${child.LastName}`;
        profilePicture.className = "child-profile-picture";

        const nameDiv = document.createElement("div");
        nameDiv.className = "child-name";
        nameDiv.textContent = `${child.FirstName} ${child.LastName}`;

        const detailsDiv = document.createElement("div");
        detailsDiv.className = "child-details";
        detailsDiv.innerHTML = `
        <p>Date of Birth: ${child.DateOfBirth}</p>
        <p>Gender: ${child.Gender}</p>
        <p>School: ${child.School || "N/A"}</p>
        <p>Emergency Contact: ${child.EmergencyContactNumber}</p>
        <p>Dietary: ${child.Dietary || "N/A"}</p>
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

  // Handle profile picture upload
  if (profilePictureInput) {
    profilePictureInput.addEventListener("change", function (e) {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        if (!file.type.startsWith("image/")) {
          alert("Please upload an image file");
          return;
        }
        const reader = new FileReader();
        reader.onload = function (e) {
          profilePreview.src = e.target.result;
          currentProfilePicture = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // Handle form submission
  if (form) {
    form.addEventListener("submit", async function (e) {
      e.preventDefault();

      const formData = {
        firstName: document.getElementById("firstName").value,
        lastName: document.getElementById("lastName").value,
        dob: document.getElementById("dob").value,
        gender: document.getElementById("gender").value,
        school: document.getElementById("school").value,
        emergencyContactNumber:
          document.getElementById("emergencyContact").value,
        dietary: document.getElementById("dietary").value,
        profilePicture: currentProfilePicture,
      };

      try {
        const response = await fetch("/api/children", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(formData),
        });

        if (!response.ok) throw new Error("Failed to add child");

        alert("Child added successfully!");
        form.reset();
        profilePreview.src = "images/profilePicture.png";
        currentProfilePicture = null;
        loadExistingChildren();
      } catch (error) {
        console.error("Error adding child:", error);
        alert("Error adding child. Please try again.");
      }
    });
  }

  // Edit child function
  window.editChild = async function (childId) {
    try {
      const response = await fetch(`/api/children/${childId}`, {
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to fetch child details");

      const child = await response.json();

      document.getElementById("firstName").value = child.FirstName;
      document.getElementById("lastName").value = child.LastName;
      document.getElementById("dob").value = child.DateOfBirth;
      document.getElementById("gender").value = child.Gender;
      document.getElementById("school").value = child.School || "";
      document.getElementById("emergencyContact").value =
        child.EmergencyContactNumber;
      document.getElementById("dietary").value = child.Dietary || "";

      if (child.ProfilePictureURL) {
        profilePreview.src = child.ProfilePictureURL;
        currentProfilePicture = child.ProfilePictureURL;
      }

      const submitBtn = document.getElementById("submitBtn");
      submitBtn.textContent = "Update Child";
      submitBtn.onclick = async (e) => {
        e.preventDefault();
        await updateChild(childId);
      };
    } catch (error) {
      console.error("Error loading child details:", error);
      alert("Error loading child details. Please try again.");
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
  async function updateChild(childId) {
    const formData = {
      firstName: document.getElementById("firstName").value,
      lastName: document.getElementById("lastName").value,
      dob: document.getElementById("dob").value,
      gender: document.getElementById("gender").value,
      school: document.getElementById("school").value,
      emergencyContactNumber: document.getElementById("emergencyContact").value,
      dietary: document.getElementById("dietary").value,
      profilePicture: currentProfilePicture,
    };

    try {
      const response = await fetch(`/api/children/${childId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to update child");

      alert("Child updated successfully!");
      form.reset();
      profilePreview.src = "images/profilePicture.png";
      currentProfilePicture = null;

      const submitBtn = document.getElementById("submitBtn");
      submitBtn.textContent = "Add Child";
      submitBtn.onclick = null;

      loadExistingChildren();
    } catch (error) {
      console.error("Error updating child:", error);
      alert("Error updating child. Please try again.");
    }
  }

  // Export the loadExistingChildren function
  window.loadExistingChildren = loadExistingChildren;
});
