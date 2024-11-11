function getProgrammeIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get("programmeId") ? parseInt(params.get("programmeId"), 10) : null;
}

async function getProgrammeSchedules(programmeId) {
    try {
        const response = await fetch(`/api/programmeSchedule/${programmeId}/schedules`);
        if (!response.ok) throw new Error("Failed to load programme schedules.");
        const schedules = await response.json();

        const scheduleSection = document.querySelector("#select-schedule-section");
        scheduleSection.innerHTML = "<h2>Select your schedule 📅</h2><p>Please check that you are available to attend all class dates.</p>";

        schedules.forEach(schedule => {
            const scheduleList = document.createElement("div");
            scheduleList.classList.add("schedule-list", "mt-4");

            const scheduleElement = document.createElement("div");
            scheduleElement.classList.add("schedule-item", "p-3", "mb-3");

            // Add data attributes for IDs
            scheduleElement.setAttribute("data-programmeClassId", schedule.programmeClassID);
            scheduleElement.setAttribute("data-programmeId", schedule.programmeID);
            scheduleElement.setAttribute("data-instanceId", schedule.instanceID);

            const startDate = new Date(schedule.startDateTime);
            const endDate = new Date(schedule.endDateTime);

            const dateItemsHTML = generateDateItems(schedule.dates);

            scheduleElement.innerHTML = `
                <input type="radio" name="schedule" class="me-2">
                <div class="schedule-details-dates-container">
                    <div class="schedule-icon-text">
                        <div class="schedule-details">
                            <p class="schedule-info mb-1"><img src="/images/Vector.png" alt="Date Icon" class="schedule-icon">
                                ${formatDate(startDate)} - ${formatDate(endDate)}
                            </p>
                            <p class="schedule-info mb-0"><img src="/images/alert-circle.png" alt="Level Icon" class="schedule-icon">
                                <span>${schedule.programmeLevel || 'No Level'}</span>
                            </p>
                            <p class="schedule-info mb-0"><img src="/images/clock-time-three-outline.png" alt="Time Icon" class="schedule-icon">
                                ${formatTime(startDate)} - ${formatTime(endDate)}
                            </p>
                        </div>
                    </div>
                    <div class="schedule-dates mt-3 mt-md-0 text-center">
                        <div class="date-list">${dateItemsHTML}</div>
                        <span class="badge bg-warning text-dark mt-2">
                            ${schedule.slotsRemaining > 0 ? `${schedule.slotsRemaining} Slots Left!` : 'Limited Slots Available!'}
                        </span>
                    </div>
                </div>
            `;

            scheduleList.appendChild(scheduleElement);
            scheduleSection.appendChild(scheduleList);
        });

        addNextButton(scheduleSection);
        highlightItems();
    } catch (error) {
        console.error("Error fetching schedules:", error);
    }
}

function formatDate(date) {
    return new Date(date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatTime(time) {
    return new Date(time).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: true });
}

function generateDateItems(dates) {
    return dates.map(date => `
        <div class="date-item p-2 mx-1 bg-light border rounded">
            ${new Date(date).toLocaleDateString(undefined, { weekday: 'short' })}<br>${formatDate(date)}
        </div>
    `).join('');
}

function highlightItems() {
    const scheduleItems = document.querySelectorAll('.schedule-item');
    const profileItems = document.querySelectorAll('.profile-item');
    let selectedSchedule = false;
    let selectedProfile = false;

    scheduleItems.forEach(item => {
        item.addEventListener('click', function() {
            scheduleItems.forEach(i => i.classList.remove('selected'));
            this.classList.add('selected');
            this.querySelector('input[type="radio"]').checked = true;
            selectedSchedule = true;
            toggleNextButton(selectedSchedule, selectedProfile);
        });
    });

    profileItems.forEach(item => {
        item.addEventListener('click', function() {
            profileItems.forEach(i => i.classList.remove('selected'));
            this.classList.add('selected');
            this.querySelector('input[type="radio"]').checked = true;
            selectedProfile = true;
            toggleNextButton(selectedSchedule, selectedProfile);
        });
    });
}

function toggleNextButton(scheduleSelected, profileSelected) {
    const nextButton = document.querySelector(".next-button");
    nextButton.disabled = !(scheduleSelected && profileSelected);
}

function addNextButton(container) {
    const nextButton = document.createElement("button");
    nextButton.classList.add("btn", "btn-primary", "mt-4", "next-button");
    nextButton.textContent = "Next";
    nextButton.disabled = true;

    nextButton.addEventListener("click", function() {
        const selectedSchedule = document.querySelector('input[name="schedule"]:checked').parentElement;
        const selectedProfile = document.querySelector('input[name="profile-selection"]:checked').closest('.profile-item');

        const programmeId = selectedSchedule.getAttribute("data-programmeId");
        const instanceId = selectedSchedule.getAttribute("data-instanceId");
        const programmeClassId = selectedSchedule.getAttribute("data-programmeClassId");
        const profileId = selectedProfile.getAttribute("data-profile-id");

        sessionStorage.setItem("selectedScheduleDetails", JSON.stringify({ programmeId, instanceId, programmeClassId, profileId }));
        window.location.href = "payment-page.html";
    });

    container.appendChild(nextButton);
}

const programmeId = getProgrammeIdFromUrl();
if (programmeId) getProgrammeSchedules(programmeId);
else alert("Invalid programme ID. Please check the URL.");
