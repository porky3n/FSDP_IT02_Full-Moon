// Global variables to store payment information, last uploaded image in binary format, and session details
let lastUploadedImageBinary = null;
let paymentMethod = "PayNow"; // Default payment method (can be updated based on fetched data)
let promotionID = null;       // Will be updated based on fetched data
let paymentAmount = 0;        // Updated based on original or discounted fee

// Retrieve session storage details and store in global variables
const sessionDetails = JSON.parse(sessionStorage.getItem("selectedScheduleDetails"));
const programmeId = sessionDetails ? sessionDetails.programmeId : null;
const instanceId = sessionDetails ? sessionDetails.instanceId : null;
const programmeClassId = sessionDetails ? sessionDetails.programmeClassId : null;
const profileId = sessionDetails ? sessionDetails.profileId : null;
let startDate = "";
let endDate = "";
let programmeName = "";

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
    if (!programmeClassId) {
      alert("Programme details not found.");
      return;
    }

    const [cartResponse, datesResponse] = await Promise.all([
      fetch(`/api/programmeClass/${programmeClassId}/cart`),
      fetch(`/api/programmeSchedule/${instanceId}/startenddates`)
    ]);

    if (!cartResponse.ok) throw new Error("Failed to fetch programme details");
    if (!datesResponse.ok) throw new Error("Failed to fetch programme schedule dates");

    const cartData = await cartResponse.json();
    const dateData = await datesResponse.json();

    // Update the summary box with programme details and dates
    updateSummary(cartData, dateData);

    // Set global variables for payment details
    paymentMethod = cartData.paymentMethod || paymentMethod;
    promotionID = cartData.promotionID || null;

  } catch (error) {
    console.error("Error fetching programme cart details or dates:", error);
  }
}

/**
 * Update summary box with fetched data
 * @param {Object} data - Programme cart data returned from server
 * @param {Object} dates - Start and end dates for the programme schedule
 */
function updateSummary(data, dates) {
  console.log("Programme cart data:", data);
  console.log("Programme schedule dates:", dates);

  programmeName = data.programmeName;
  const originalFee = parseFloat(data.originalFee);
  const discountedFee = data.discountedFee ? parseFloat(data.discountedFee) : originalFee;
  const promotionName = data.promotionName || "No promotion available";
  const discountValue = originalFee - discountedFee;

  // Set the payment amount to the discounted fee if available, otherwise to the original fee
  paymentAmount = discountedFee;

  // Update course name
  document.getElementById("courseName").textContent = programmeName;

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

  // Display start and end dates
  startDate = new Date(dates.firstStartDate).toLocaleDateString();
  endDate = new Date(dates.lastEndDate).toLocaleDateString();
  document.getElementById("startDate").textContent = startDate;
  document.getElementById("endDate").textContent = endDate;
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
  if (!programmeId || !instanceId || !programmeClassId || !profileId) {
    alert("No schedule details found. Please select a schedule before proceeding.");
    return false;
  }

  //const userEmail = sessionStorage.getItem("userEmail"); // Retrieve user email from session storage
  const userEmail = "xrages68@gmail.com";
  
  const slotData = {
    programmeClassID: programmeClassId,
    programmeID: programmeId,
    instanceID: instanceId,
    parentID: null, // Replace with actual parentID if applicable
    childID: 2, // Replace with actual childID if applicable
    paymentAmount: paymentAmount, // Use calculated payment amount from updateSummary
    paymentMethod: paymentMethod, // Retrieved from fetchProgrammeCartDetails
    paymentImage: Array.from(lastUploadedImageBinary), // Convert binary data to array for JSON transmission
    promotionID: promotionID,
    userEmail: userEmail,  // Include user email
    programmeName: programmeName,
    startDate: startDate,
    endDate: endDate // Retrieved from fetchProgrammeCartDetails
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
