let payments = []; // Global array to store fetched payments

document.addEventListener("DOMContentLoaded", () => {
    // Fetch and display all payments on page load
    getAllPayments();

    // Event listeners for filtering and search
    document.getElementById("paymentSearchButton").addEventListener("click", applyFilters);
    document.getElementById("applyFiltersButton").addEventListener("click", applyFilters);

    // Close the modal when the close button is clicked
    document.getElementById("closeModal").addEventListener("click", closeImageModal);

    // Close the modal when clicking outside of the image
    document.getElementById("imageModal").addEventListener("click", (event) => {
        if (event.target === document.getElementById("imageModal")) {
            closeImageModal();
        }
    });
});

// Fetch all payments and display them in the table
async function getAllPayments() {
    try {
        console.log("Fetching all payments...");
        const response = await fetch('/api/payment');
        if (!response.ok) throw new Error("Failed to fetch payments.");

        payments = await response.json(); // Store the fetched payments globally
        populateTable(payments);
    } catch (error) {
        console.error("Error loading payments:", error);
        alert("Could not load payment data. Please try again later.");
    }
}

// Populate the table with payment data
function populateTable(payments) {
    const userTableBody = document.getElementById("payment-list");
    userTableBody.innerHTML = ""; // Clear any existing rows

    payments.forEach(payment => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${payment.paymentID || "N/A"}</td>
            <td>${payment.slotID || "N/A"}</td>
            <td>${payment.promotionID || "N/A"}</td>
            <td>${payment.paymentAmount || "N/A"}</td>
            <td>${formatDate(payment.paymentDate)}</td>
            <td>${payment.paymentMethod || "N/A"}</td>
            <td>
                <img src="data:image/png;base64,${payment.paymentImage}" 
                     alt="Transaction Image" 
                     style="width: 50px; height: 50px; cursor: pointer;"
                     onclick="showImageModal('data:image/png;base64,${payment.paymentImage}')">
            </td>
        `;

        userTableBody.appendChild(row);
    });
}

// Function to show the modal with the enlarged image
function showImageModal(imageSrc) {
    const modal = document.getElementById("imageModal");
    const modalImage = document.getElementById("modalImage");

    modalImage.src = imageSrc;
    modal.style.display = "block";
    document.body.classList.add("modal-open"); // Disable background scroll
}

// Function to close the modal
function closeImageModal() {
    const modal = document.getElementById("imageModal");
    modal.style.display = "none";
    document.body.classList.remove("modal-open"); // Enable background scroll
}

// Apply search and filter options
function applyFilters() {
    const searchQuery = document.getElementById("paymentSearchInput").value.toLowerCase();
    const startDate = new Date(document.getElementById("startDate").value);
    const endDate = new Date(document.getElementById("endDate").value);
    const minAmount = parseFloat(document.getElementById("minAmount").value) || 0;

    const filteredPayments = payments.filter(payment => {
        // Check payment method search
        const methodMatch = payment.paymentMethod && payment.paymentMethod.toLowerCase().includes(searchQuery);

        // Check date range
        const paymentDate = new Date(payment.paymentDate);
        const dateMatch = (!isNaN(startDate) ? paymentDate >= startDate : true) &&
                          (!isNaN(endDate) ? paymentDate <= endDate : true);

        // Check minimum amount
        const amountMatch = payment.paymentAmount >= minAmount;

        return methodMatch && dateMatch && amountMatch;
    });

    populateTable(filteredPayments);
}

// Format date to a readable format
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString();
}
