// Function to extract the programme ID from the URL
function getProgrammeIdFromUrl() {
    const path = window.location.pathname;
    const pathParts = path.split('/');
    const programmeId = pathParts[pathParts.length - 1];
    return programmeId ? parseInt(programmeId, 10) : null;
}

// Function to fetch and display programme details
// Function to fetch and display programme details
async function getProgrammeDetails(programmeId) {
    try {
        const response = await fetch(`/api/programme/${programmeId}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) {
            throw new Error("Programme not found or server error occurred.");
        }

        const data = await response.json();

        // Ensure the HTML IDs match the elements you want to populate
        document.querySelector(".header-text h1").textContent = data.programmeName || "N/A";
        document.querySelector(".header-text p").textContent = data.description || "N/A";
        document.querySelector(".badge.bg-info span").textContent = `${data.maxSlots || "0"} Students`;
        document.querySelector(".badge.bg-primary span").textContent = `${data.maxSlots || "0"} Participated`;
        // document.getElementById("category").textContent = data.category || "N/A";
        // document.getElementById("location").textContent = data.location || "N/A";
        // document.getElementById("startDate").textContent = formatDate(data.startDate);
        // document.getElementById("endDate").textContent = formatDate(data.endDate);
        // document.getElementById("fee").textContent = data.fee ? `$${data.fee}` : "Free";
        // document.getElementById("programmeLevel").textContent = data.programmeLevel || "N/A";

    } catch (error) {
        console.error("Error retrieving programme details:", error);
        alert("Could not load programme details. Please try again later.");
    }
}

// Helper function to format date
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

// Initialize programme details display on page load
const programmeId = getProgrammeIdFromUrl();
if (programmeId) {
    getProgrammeDetails(programmeId);
} else {
    console.error("No programme ID found in URL");
    alert("Invalid programme ID. Please check the URL.");
}
