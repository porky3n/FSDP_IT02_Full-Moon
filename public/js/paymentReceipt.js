document.addEventListener("DOMContentLoaded", function () {
  initializeReceipt();
});

function initializeReceipt() {
  setReceiptDetails();
  calculateTotals();
}

function setReceiptDetails() {
  // Set Receipt Number
  const receiptNumber = "#1881218281";
  document.getElementById("receipt-number").textContent = receiptNumber;

  // Set Current Date
  const currentDate = "20 Oct, 2024";
  document.getElementById("receipt-date").textContent = currentDate;
}

function calculateTotals() {
  const subtotal = 370;
  const taxRate = 0.09;
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  document.getElementById("subtotal").textContent = `$${subtotal.toFixed(2)}`;
  document.getElementById("tax").textContent = `$${tax.toFixed(2)}`;
  document.getElementById("total").textContent = `SGD$ ${total.toFixed(2)}`;
}
