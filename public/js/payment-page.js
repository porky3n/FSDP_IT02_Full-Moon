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
  window.location.href = "../paymentReceipt.html";
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
