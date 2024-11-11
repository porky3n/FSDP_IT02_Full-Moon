// Function to extract the programme ID from the URL
// Function to extract the programme ID from URL query parameters
function getProgrammeIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const programmeId = params.get("programmeId");
    return programmeId ? parseInt(programmeId, 10) : null;
}

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

        // Populate the main programme details
        document.querySelector(".header-text h1").textContent = data.programmeName || "N/A";
        document.querySelector(".header-text p").textContent = data.description || "N/A";


        console.log("data.picture: " + data.programmePicture);
        // Populate the main image (ProgrammePicture) as a Base64-encoded image
        const headerImage = document.querySelector(".header-image img");
        if (data.programmePicture) {
            headerImage.src = `data:image/jpeg;base64,${data.programmePicture}`;
        } else {
            headerImage.src = "/images/default-image.png";
        }
        headerImage.alt = `${data.programmeName} Image`;

        // Populate additional images in the about section
        const aboutImageContainer = document.querySelector(".about-section .col-md-4 img");
        if (data.images && data.images.length > 0) {
            // Display the first additional image as an example, using Base64 format
            aboutImageContainer.src = `data:image/jpeg;base64,${data.images[0]}`;
            aboutImageContainer.alt = `${data.programmeName} Additional Image`;
        } else {
            aboutImageContainer.src = "/images/default-image.png";
            aboutImageContainer.alt = "Default Image";
        }

        // Store the category to use for related programmes
        const category = data.category;

        // Call getRelatedProgrammes with the category and programme ID
        getRelatedProgrammes(category, programmeId);

    } catch (error) {
        console.error("Error retrieving programme details:", error);
        alert("Could not load programme details. Please try again later.");
    }
}



// new version
async function getProgrammeSchedules(programmeId) {
    try {
        const response = await fetch(`/api/programmeSchedule/${programmeId}/schedules`);
        if (!response.ok) throw new Error("Failed to load programme schedules.");
        const schedules = await response.json();

        const scheduleSection = document.querySelector(".upcoming-schedule");
        scheduleSection.innerHTML = "<h2>Upcoming Schedules</h2>";

        let rowElement = document.createElement("div");
        rowElement.classList.add("row");

        schedules.forEach((schedule, index) => {
            const scheduleList = document.createElement("div");
            scheduleList.classList.add("schedule-list", "mt-4");

            const scheduleElement = document.createElement("div");
            scheduleElement.classList.add("schedule-item", "p-3", "mb-3");

            const startDate = new Date(schedule.startDateTime);
            const endDate = new Date(schedule.endDateTime);

            // Generate the HTML for each date in the `dates` array
            const dateItemsHTML = generateDateItems(schedule.dates);

            scheduleElement.innerHTML = `
                <div class="schedule-details-dates-container">
                    <div class="schedule-icon-text">
                        <div class="schedule-details">
                            <p class="schedule-info mb-1">
                                <img src="/images/Vector.png" alt="Date Icon" class="schedule-icon">
                                ${formatDate(startDate)} - ${formatDate(endDate)}
                            </p>
                            <p class="schedule-info mb-0">
                                <img src="/images/alert-circle.png" alt="Level Icon" class="schedule-icon">
                                <span>${schedule.programmeLevel || 'No Level'}</span>
                            </p>
                        </div>
                    </div>
                    <div class="schedule-dates mt-3 mt-md-0 text-center">
                        <div class="date-list">
                            ${dateItemsHTML}
                        </div>
                        <span class="badge bg-warning text-dark mt-2">
                            ${schedule.slotsRemaining > 0 ? `${schedule.slotsRemaining} SLOTS LEFT!` : 'Full'}
                        </span>
                    </div>
                </div>
                <button class="btn btn-outline-primary mt-3 mt-md-0" onclick="location.href='userSelectSchedule.html?programmeId=${encodeURIComponent(programmeId)}'">Apply</button>
            `;

            scheduleList.appendChild(scheduleElement);
            rowElement.appendChild(scheduleList);

            // Append the row element to the schedule section after every 2 schedules
            if ((index + 1) % 2 === 0 || index === schedules.length - 1) {
                scheduleSection.appendChild(rowElement);
                rowElement = document.createElement("div");
                rowElement.classList.add("row");
            }
        });
    } catch (error) {
        console.error("Error fetching schedules:", error);
    }
}



function generateDateItems(dates) {
    return dates.map(date => `
        <div class="date-item p-2 mx-1 bg-light border rounded">
            ${formatDay(date)}<br>${formatDate(date)}
        </div>
    `).join('');
}

// Function to handle storing schedule data in sessionStorage and navigating to payment page
// function applyForProgramme(programmeClassID, scheduleData) {
//     // Store the schedule data in sessionStorage
//     sessionStorage.setItem("selectedSchedule", JSON.stringify(scheduleData));
    
//     // Navigate to the payment page with the programmeClassID as a URL parameter
//     // location.href = `payment-page.html?programmeClassId=${encodeURIComponent(programmeClassID)}`;
//     location.href = `payment-page.html?`;
// }


async function getProgrammeFees(programmeId) {
    try {
        const response = await fetch(`/api/programmeClass/${programmeId}/classes`);
        if (!response.ok) throw new Error("Failed to load programme fees.");
        const fees = await response.json();

        // Select the container for the programme fees section and clear existing content
        const feeSection = document.querySelector(".programme-fees");
        feeSection.innerHTML = "<h2>Programme Fees</h2>"; // Reset with header

        let rowElement = null; // Variable to hold the current row
        fees.forEach((fee, index) => {
            // Alternate between 'card-1' and 'card-2' classes based on the index
            const cardClass = index % 2 === 0 ? "card-1" : "card-2";

            // Parse remarks as a list, separated by "~"
            const remarksList = fee.remarks ? fee.remarks.split("~") : [];

            // Create the card element for each fee item
            const feeElement = document.createElement("div");
            feeElement.classList.add("col-md-4"); // Set to one-third width in row
            feeElement.innerHTML = `
                <div class="card ${cardClass}">
                    <div class="card-body">
                        <h3>$${fee.fee}*</h3>
                        <p><b>${fee.programmeLevel}</b></p>
                        <p>${fee.shortDescription}</p> <!-- Display short description -->
                        <button class="btn btn-light" onclick="location.href='userSelectSchedule.html?programmeId=${encodeURIComponent(programmeId)}'">Get started</button>
                        <ul class="list-unstyled">
                            <li><img src="/images/check-circle-outline.png" alt="Check icon" class="check-icon"> Max Slots: ${fee.maxSlots}</li>
                            ${remarksList.map(remark => `<li><img src="/images/check-circle-outline.png" alt="Check icon" class="check-icon"> ${remark}</li>`).join("")}
                        </ul>
                    </div>
                </div>
            `;

            // Add a new row for every three fee items
            if (index % 3 === 0) {
                rowElement = document.createElement("div");
                rowElement.classList.add("row", "mt-4");
                feeSection.appendChild(rowElement);
            }

            // Append the fee item to the current row
            rowElement.appendChild(feeElement);
        });
    } catch (error) {
        console.error("Error fetching fees:", error);
    }
}



// Function to fetch and display related webinars by category
async function getRelatedProgrammes(category, excludeProgrammeID = null, limit = 3) {
    try {
        const url = `/api/programme/category/${encodeURIComponent(category)}?excludeProgrammeID=${excludeProgrammeID}&limit=${limit}`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("Failed to load related webinars.");
        }

        const programmes = await response.json();

        // Select the container for related webinars and clear existing content
        const relatedWebinarsSection = document.querySelector(".related-webinars .row");
        relatedWebinarsSection.innerHTML = ""; // Clear existing cards

        // Loop through the fetched programmes and create a card for each
        programmes.forEach(programme => {
            const webinarCard = document.createElement("div");
            webinarCard.classList.add("col-md-4");

            // Populate each card with the programme's data
            webinarCard.innerHTML = `
                <div class="card">
                    <img src="${programme.image || '/images/default-webinar.png'}" class="card-img-top" alt="Webinar">
                    <div class="card-body">
                        <h5 class="card-title">${programme.programmeName}</h5>
                        <p class="card-text">${programme.description}</p>
                        <a href="/programme/${programme.programmeID}" class="btn btn-outline-primary">Learn More</a>
                    </div>
                </div>
            `;

            // Append each card to the related webinars section
            relatedWebinarsSection.appendChild(webinarCard);
        });
    } catch (error) {
        console.error("Error fetching related webinars:", error);
    }
}

// Helper function to format dates (if needed elsewhere in your code)
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

// Helper function to format time
function formatTime(timeString) {
    const date = new Date(timeString);
    const options = { hour: '2-digit', minute: '2-digit', hour12: true };
    return date.toLocaleTimeString(undefined, options);
}
// Helper function to format day
function formatDay(dateString) {
    const options = { weekday: 'short' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

// Initialize programme details display on page load
const programmeId = getProgrammeIdFromUrl();
if (programmeId) {
    getProgrammeDetails(programmeId);
    getProgrammeSchedules(programmeId);
    getProgrammeFees(programmeId);
} else {
    console.error("No programme ID found in URL");
    alert("Invalid programme ID. Please check the URL.");
}

// function scrollToSection(target) {
//     const element = document.getElementsByClassName(target)[0];
//     if (element) {
//         element.scrollIntoView({
//             behavior: "smooth", // Enables smooth scrolling
//             block: "start"      // Aligns the element to the top of the view
//         });
//     } else {
//         console.error("Target section not found:", target);
//     }
// }

