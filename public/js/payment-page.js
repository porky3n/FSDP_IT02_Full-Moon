// Global variable to store the last successfully uploaded image's data URL
let lastUploadedImage = null;

// Generate QR Code on page load
document.addEventListener("DOMContentLoaded", function () {
  generateQRCode();
  updateSummary();
});

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

function printReceipt() {
  try {
    createBooking(); // Attempt to create booking
    window.location.href = "../paymentReceipt.html";
  } catch (error) {
    console.error("Failed to create booking:", error);
    alert("There was an error creating your booking. Please try again.");
  }
}

function updateSummary() {
  const coursePrice = 120;
  const subtotal = coursePrice;

  // Update summary box values
  document.querySelector(
    ".summary-item:nth-child(2) span:last-child"
  ).textContent = `$${coursePrice.toFixed(2)}`;
  document.querySelector(
    ".total-section span:last-child"
  ).textContent = `$${subtotal.toFixed(2)}`;
}

/**
 * Handle image upload and display the "Image has been uploaded" message
 */
function handleImageUpload(event) {
  const file = event.target.files[0];
  const printReceiptButton = document.querySelector(".btn-print-receipt");

  // Check if a file is selected
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      // Directly set the uploaded image as the last uploaded image
      lastUploadedImage = e.target.result;

      // Show confirmation message on main page
      document.getElementById("uploadedImageMessage").style.display = "block";

      // Enable and style the Print Receipt button
      printReceiptButton.disabled = false;
      printReceiptButton.classList.remove("btn-secondary");
      printReceiptButton.classList.add("btn-warning");
    };
    reader.readAsDataURL(file);

  } else {
    // Hide the uploaded image message and disable the Print Receipt button if no file
    document.getElementById("uploadedImageMessage").style.display = "none";
    printReceiptButton.disabled = true;
    printReceiptButton.classList.remove("btn-warning");
    printReceiptButton.classList.add("btn-secondary");
  }
}

/**
 * Open image preview modal on clicking the confirmation message
 */
function openImageModal() {
  if (lastUploadedImage) {
    // Set the last uploaded image as the source for the modal preview
    document.getElementById("modalImagePreview").src = lastUploadedImage;

    // Open the modal
    const imageModal = new bootstrap.Modal(document.getElementById("imagePreviewModal"));
    imageModal.show();
  }
}

async function createBooking() {
  const bookingData = {
    programmeClassID: 1, // Replace with actual programmeClassID
    programmeID: 1, // Replace with actual programmeID
    instanceID: 1, // Replace with actual instanceID
    parentID: 1, // Replace with actual parentID
    childID: null // Replace with actual childID if applicable
  };

  try {
    const response = await fetch("/api/createBooking", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(bookingData)
    });

    if (!response.ok) {
      throw new Error("Failed to create booking.");
    }
    const data = await response.json();
    console.log("Booking created successfully:", data);
  } catch (error) {
    console.error("Error creating booking:", error);
    throw error;
  }
}