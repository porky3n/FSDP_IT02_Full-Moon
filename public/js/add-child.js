document.addEventListener("DOMContentLoaded", function () {
  // Function to load existing children
  async function loadExistingChildren() {
    try {
      // Replace with your actual API endpoint
      const response = await fetch(
        "/api/children?parentId=" + getCurrentParentId()
      );
      const children = await response.json();

      const existingChildrenContainer =
        document.getElementById("existingChildren");
      existingChildrenContainer.innerHTML = ""; // Clear existing content

      children.forEach((child) => {
        const childCard = createChildCard(child);
        existingChildrenContainer.appendChild(childCard);
      });
    } catch (error) {
      console.error("Error loading existing children:", error);
    }
  }

  // Function to create child card element
  function createChildCard(child) {
    const card = document.createElement("div");
    card.className = "child-card mb-4 p-3 border rounded";
    card.innerHTML = `
      <div class="row">
        <div class="col-md-2">
          <img src="${
            child.ProfilePictureURL || "/images/default-profile.jpg"
          }" 
               class="img-fluid rounded-circle" alt="${
                 child.FirstName
               }'s profile">
        </div>
        <div class="col-md-8">
          <h3>${child.FirstName} ${child.LastName}</h3>
          <p>Date of Birth: ${new Date(
            child.DateOfBirth
          ).toLocaleDateString()}</p>
          <p>School: ${child.School || "Not specified"}</p>
          <p>Emergency Contact: ${child.EmergencyContactNumber}</p>
          ${child.Dietary ? `<p>Dietary Needs: ${child.Dietary}</p>` : ""}
        </div>
        <div class="col-md-2">
          <button class="btn btn-primary mb-2 w-100" onclick="editChild(${
            child.ChildID
          })">Edit</button>
          <button class="btn btn-danger w-100" onclick="deleteChild(${
            child.ChildID
          })">Delete</button>
        </div>
      </div>
    `;
    return card;
  }

  // Store initial form values
  const form = document.getElementById("childProfileForm");
  let initialFormData = {};

  // Function to get current form data
  function getCurrentFormData() {
    return {
      firstName: document.getElementById("firstName").value,
      lastName: document.getElementById("lastName").value,
      dob: document.getElementById("dob").value,
      school: document.getElementById("school").value,
      emergencyContact: document.getElementById("emergencyContact").value,
      gender: document.getElementById("gender").value,
      dietary: document.getElementById("dietary").value,
      profilePicture: document.getElementById("profilePreview").src,
    };
  }

  // Load existing children when page loads
  loadExistingChildren();

  // Store initial values once the form is loaded
  if (form) {
    initialFormData = getCurrentFormData();
  }

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
        if (!file.type.startsWith("image/")) {
          alert("Please upload an image file");
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

  // Function to check if form has changes
  function hasFormChanges() {
    const currentData = getCurrentFormData();
    return Object.keys(initialFormData).some(
      (key) => initialFormData[key] !== currentData[key]
    );
  }

  // Handle form submission
  if (form) {
    form.addEventListener("submit", async function (e) {
      e.preventDefault();

      if (!validateForm()) {
        alert("Please fill in all required fields correctly.");
        return;
      }

      if (!hasFormChanges()) {
        alert("No changes have been made to the form.");
        return;
      }

      try {
        const formData = getCurrentFormData();
        // Replace with your actual API endpoint
        const response = await fetch("/api/children", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          alert("Child profile added successfully!");
          loadExistingChildren(); // Reload the list of children
          form.reset(); // Reset the form
          initialFormData = getCurrentFormData(); // Reset initial form data
        } else {
          alert("Error adding child profile. Please try again.");
        }
      } catch (error) {
        console.error("Error submitting form:", error);
        alert("Error adding child profile. Please try again.");
      }
    });
  }

  // Function to validate form (including new fields)
  function validateForm() {
    const inputs = form.querySelectorAll(
      "input[required], textarea[required], select[required]"
    );
    let isValid = true;

    inputs.forEach((input) => {
      if (!input.value.trim()) {
        input.classList.add("is-invalid");
        isValid = false;
      } else {
        input.classList.remove("is-invalid");
      }
    });

    return isValid;
  }

  // Add input event listeners to remove invalid state
  const inputs = form.querySelectorAll(
    "input[required], textarea[required], select[required]"
  );
  inputs.forEach((input) => {
    input.addEventListener("input", function () {
      this.classList.remove("is-invalid");
    });
  });

  // Handle edit child function
  window.editChild = function (childId) {
    // Implement edit functionality
    console.log("Edit child:", childId);
    // You would typically load the child's data into the form
  };

  // Handle delete child function
  window.deleteChild = async function (childId) {
    if (confirm("Are you sure you want to delete this child profile?")) {
      try {
        // Replace with your actual API endpoint
        const response = await fetch(`/api/children/${childId}`, {
          method: "DELETE",
        });

        if (response.ok) {
          loadExistingChildren(); // Reload the list
        } else {
          alert("Error deleting child profile");
        }
      } catch (error) {
        console.error("Error deleting child:", error);
        alert("Error deleting child profile");
      }
    }
  };
});
