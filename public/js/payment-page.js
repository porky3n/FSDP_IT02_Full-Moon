// Global variables to store payment information and last uploaded image in binary format
let lastUploadedImageBinary = null;
let paymentMethod = "PayNow"; // Default payment method (can be updated based on fetched data)
let promotionID = null;       // Will be updated based on fetched data
let paymentAmount = 0;        // Updated based on original or discounted fee

document.addEventListener("DOMContentLoaded", function () {
  generateQRCode();
  fetchProgrammeCartDetails();
});

/**
 * Generate QR Code
 */
function generateQRCode() {
  const qrcode = new QRCode(document.getElementById("qrcode"), {
    text: "https://payment-link-example.com",
    width: 200,
    height: 200,
    colorDark: "#000000",
    colorLight: "#ffffff",
    correctLevel: QRCode.CorrectLevel.H,
  });
}

/**
 * Fetch programme cart details from the server and populate the summary box
 */
async function fetchProgrammeCartDetails() {
  try {
    const scheduleDetails = JSON.parse(sessionStorage.getItem("selectedScheduleDetails"));
    if (!scheduleDetails) {
      alert("Programme details not found.");
      return;
    }

    const { programmeClassId } = scheduleDetails;
    const response = await fetch(`/api/programmeClass/${programmeClassId}/cart`);
    if (!response.ok) throw new Error("Failed to fetch programme details");

    const data = await response.json();
    updateSummary(data);

    // Set global variables for payment details
    paymentMethod = data.paymentMethod || paymentMethod;
    promotionID = data.promotionID || null;

  } catch (error) {
    console.error("Error fetching programme cart details:", error);
  }
}

/**
 * Update summary box with fetched data
 * @param {Object} data - Programme cart data returned from server
 */
function updateSummary(data) {
  console.log("Programme cart data:", data);

  const courseName = data.programmeName;
  const originalFee = parseFloat(data.originalFee);
  const discountedFee = data.discountedFee ? parseFloat(data.discountedFee) : originalFee;
  const promotionName = data.promotionName || "No promotion available";
  const discountValue = originalFee - discountedFee;

  // Set the payment amount to the discounted fee if available, otherwise to the original fee
  paymentAmount = discountedFee;

  // Update course name
  document.getElementById("courseName").textContent = courseName;

  // Update original price
  document.getElementById("originalPrice").textContent = `$${originalFee.toFixed(2)}`;

  // Display discount section if there is a discount
  if (discountedFee < originalFee) {
    document.getElementById("discountSection").classList.remove("d-none");
    document.getElementById("discountLabel").textContent = `Discount (${promotionName})`;
    document.getElementById("discountAmount").textContent = `-$${discountValue.toFixed(2)}`;
  } else {
    // Hide discount section if no discount
    document.getElementById("discountSection").classList.add("d-none");
  }

  // Update total price
  document.getElementById("totalPrice").textContent = `$${discountedFee.toFixed(2)}`;
}

/**
 * Handle image upload and display the "Image has been uploaded" message
 */
function handleImageUpload(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const base64Image = e.target.result.split(",")[1]; // Extract base64 part
      lastUploadedImageBinary = Uint8Array.from(atob(base64Image), c => c.charCodeAt(0)); // Convert to binary

      document.getElementById("uploadedImageMessage").style.display = "block";
      const printReceiptButton = document.querySelector(".btn-print-receipt");
      printReceiptButton.disabled = false;
      printReceiptButton.classList.replace("btn-secondary", "btn-warning");
    };
    reader.readAsDataURL(file);
  }
}

/**
 * Open image preview modal on clicking the confirmation message
 */
function openImageModal() {
  if (lastUploadedImageBinary) {
    const modalImage = document.getElementById("modalImagePreview");
    modalImage.src = URL.createObjectURL(new Blob([lastUploadedImageBinary]));
    const imageModal = new bootstrap.Modal(document.getElementById("imagePreviewModal"));
    imageModal.show();
  }
}

/**
 * Function to create a slot, and upon success redirect to payment receipt page
 */
async function printReceipt() {
  try {
    const slotCreated = await createSlot();
    if (slotCreated) {
      // Redirect to payment receipt page only if slot creation is successful
      window.location.href = "../paymentReceipt.html";
    }
  } catch (error) {
    console.error("Failed to create slot:", error);
    alert("There was an error creating your booking. Please try again.");
  }
}

/**
 * Create slot and store binary image in the database
 * @returns {boolean} - Returns true if slot creation is successful, false otherwise
 */
async function createSlot() {
  const scheduleDetails = JSON.parse(sessionStorage.getItem("selectedScheduleDetails"));
  if (!scheduleDetails) {
    alert("No schedule details found. Please select a schedule before proceeding.");
    return false;
  }

  const { programmeId, instanceId, programmeClassId, profileId } = scheduleDetails;

  const slotData = {
    programmeClassID: programmeClassId,
    programmeID: programmeId,
    instanceID: instanceId,
    parentID: null, // Replace with actual parentID if applicable
    childID: 2, // Replace with actual childID if applicable
    paymentAmount: paymentAmount, // Use calculated payment amount from updateSummary
    paymentMethod: paymentMethod, // Retrieved from fetchProgrammeCartDetails
    paymentImage: Array.from(lastUploadedImageBinary), // Convert binary data to array for JSON transmission
    promotionID: promotionID // Retrieved from fetchProgrammeCartDetails
  };

  console.log("Slot and payment data:", slotData);

  try {
    const response = await fetch("/api/slot/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(slotData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to create slot and payment.");
    }

    const data = await response.json();
    console.log("Slot and payment created successfully:", data);
    alert("Slot and payment created successfully.");
    return true; // Return true on successful slot creation
  } catch (error) {
    alert(`Error creating slot and payment: ${error.message}`);
    console.error("Error creating slot and payment:", error);
    return false; // Return false on failure
  }
}
