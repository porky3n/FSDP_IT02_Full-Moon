document.addEventListener("DOMContentLoaded", () => {
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
            scheduleSection.innerHTML = "<h3>Select your schedule 📅</h3><p>Please check that you are available to attend all class dates.</p>";

            schedules.forEach(schedule => {
                const scheduleList = document.createElement("div");
                scheduleList.classList.add("schedule-list");

                const scheduleElement = document.createElement("div");
                scheduleElement.classList.add("schedule-item", "p-3", "mb-3");

                // Add data attributes for IDs
                scheduleElement.setAttribute("data-programmeClassId", schedule.programmeClassID);
                scheduleElement.setAttribute("data-programmeId", schedule.programmeID);
                scheduleElement.setAttribute("data-instanceId", schedule.instanceID);

                const startDate = new Date(schedule.startDateTime);
                const endDate = new Date(schedule.endDateTime);

                const dateItemsHTML = generateDateItems(schedule.dates);

                // Set the message and class for slots remaining
                let slotsMessage = "";
                let slotsClass = "badge";
                if (schedule.slotsRemaining === 0) {
                    slotsMessage = "Full";
                    slotsClass += " full";
                } else if (schedule.slotsRemaining < 6) {
                    slotsMessage = `${schedule.slotsRemaining} Slots Left!`;
                    slotsClass += " not-full";
                } else {
                    slotsMessage = "Slots Filling Up Fast!";
                    slotsClass += " not-full";
                }

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
                            <span class="${slotsClass} mt-2">
                                ${slotsMessage}
                            </span>
                        </div>
                    </div>
                `;

                scheduleList.appendChild(scheduleElement);
                scheduleSection.appendChild(scheduleList);
            });

            addNextButton(scheduleSection);
            // highlightItems();
        } catch (error) {
            console.error("Error fetching schedules:", error);
        }
    }

    async function loadProfiles() {
        const userDetailsString = localStorage.getItem("userDetails");
        let accountId = null;
        let email = null;
        // Check if userDetails exists and parse it if it does
        if (userDetailsString) {
            const userDetails = JSON.parse(userDetailsString);
            accountId = userDetails.accountId;
            email = userDetails.email;
            console.log(email); // Output the accountId
        } else {
            console.log("User details not found in localStorage.");
        }

        if (!accountId) {
            displaySignUpButton();
            toggleNextButton(false, false);
            return;
        }

        try {
            const response = await fetch(`/auth/profile/${accountId}`);
            if (!response.ok) throw new Error("Failed to load profiles.");

            const { parentProfile, childProfiles } = await response.json();
            console.log(parentProfile, childProfiles);
            displayProfiles(parentProfile, childProfiles, email);
        } catch (error) {
            console.error("Error fetching profiles:", error);
        }
    }

    function displaySignUpButton() {
        const profileSection = document.querySelector("#select-profile-section");
        profileSection.innerHTML = `
            <h2>No Profile Available</h2>
            <p>You need an account to select a profile.</p>
            <a href="signup.html" class="btn btn-primary">Sign Up Now</a>
        `;
    }

    function displayProfiles(parentProfile, childProfiles, email) {
        const profileSection = document.querySelector("#select-profile-section");
        profileSection.innerHTML = `
            <h4>Profile</h4>
            <p>Who do you want to sign up for.</p>
        `;
    
        // Function to generate each profile card's HTML structure
        function generateProfileHTML(profile, profileTitle, email) {
            return `
                <div class="card mb-3 profile-item" data-profile-id="${profile.ProfileID}">
                    <div class="card-body">
                        <input type="radio" name="profile-selection" class="me-2">
                        <div class="d-flex align-items-center mt-2">
                            <img src="${profile.ProfilePicture || '/images/profile-placeholder.png'}" alt="${profileTitle} Picture" class="rounded-circle me-3" width="50" height="50">
                            <div>
                                <h5 class="card-title mb-0">${profileTitle}</h5>
                                <p class="card-text small text-muted">${profile.FirstName} ${profile.LastName}</p>
                            </div>
                        </div>
                        <ul class="list-unstyled mt-3">
                            ${profile.Gender ? `<li><strong>Gender:</strong> ${profile.Gender}</li>` : ''}
                            ${profile.DateOfBirth ? `<li><strong>Age:</strong> ${calculateAge(profile.DateOfBirth)}</li>` : ''}
                            ${email ? `<li><strong>Email:</strong> ${email}</li>` : ''}
                            ${profile.School ? `<li><strong>School:</strong> ${profile.School}</li>` : ''}
                        </ul>
                    </div>
                </div>
            `;
        }
    
        // Append the parent profile
        const parentProfileHTML = generateProfileHTML(parentProfile, "Your Profile", email);
        profileSection.insertAdjacentHTML("beforeend", parentProfileHTML);
    
        // Append each child profile
        childProfiles.forEach((child, index) => {
            const childProfileHTML = generateProfileHTML(child, `Child's Profile ${index + 1}`, null);
            profileSection.insertAdjacentHTML("beforeend", childProfileHTML);
        });

        highlightItems();
    }
    

    function calculateAge(dateOfBirth) {
        const dob = new Date(dateOfBirth);
        const diffMs = Date.now() - dob.getTime();
        const ageDate = new Date(diffMs);
        return Math.abs(ageDate.getUTCFullYear() - 1970);
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
    
        // Highlight selected schedule item
        scheduleItems.forEach(item => {
            item.addEventListener('click', function() {
                scheduleItems.forEach(i => i.classList.remove('selected'));
                this.classList.add('selected');
                this.querySelector('input[type="radio"]').checked = true;
                selectedSchedule = true;
                toggleNextButton(selectedSchedule, selectedProfile);
            });
        });
    
        // Highlight selected profile item
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
    if (programmeId) {
        getProgrammeSchedules(programmeId);
        loadProfiles();
    }
});
