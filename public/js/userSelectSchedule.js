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
                highlightItems();
            } catch (error) {
                console.error("Error fetching schedules:", error);
            }
        }

        async function loadProfiles() {
            const userDetailsString = localStorage.getItem("userDetails");
            let accountId = null;
            let email = null;
            let tier = null;
            // Check if userDetails exists and parse it if it does
            if (userDetailsString) {
                const userDetails = JSON.parse(userDetailsString);
                accountId = userDetails.accountId;
                email = userDetails.email;
                tier = userDetails.tier;
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
                <a href="userSignUp.html" class="btn btn-primary">Sign Up Now</a>
            `;
        }

        function displayProfiles(parentProfile, childProfiles, email) {
            const profileSection = document.querySelector("#select-profile-section");
            profileSection.innerHTML = `
                <h4>Profile</h4>
                <p>Who do you want to sign up for.</p>
            `;
        
            // Function to generate each profile card's HTML structure
            function generateProfileHTML(profile, profileTitle, email, profileType) {
                console.log("profile type:", profileType);
                return `
                    <div class="card mb-3 profile-item" data-profile-id="${profile.ProfileID}" data-profile-type="${profileType}">
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
        
            // Append the parent profile with a profile type of "parent"
            const parentProfileHTML = generateProfileHTML(parentProfile, "Your Profile", email, "parent");
            profileSection.insertAdjacentHTML("beforeend", parentProfileHTML);
        
            // Append each child profile with a profile type of "child"
            childProfiles.forEach((child, index) => {
                const childProfileHTML = generateProfileHTML(child, `Child's Profile ${index + 1}`, null, "child");
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

        // Updated highlightItems function
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
                    selectedProfile = false; // Reset profile selection when schedule changes
                    toggleNextButton(selectedSchedule, selectedProfile);

                    // Unhighlight profile selection
                    profileItems.forEach(i => {
                        i.classList.remove('selected');
                        i.querySelector('input[type="radio"]').checked = false;
                    });

                    // Call disableAttendedProfiles when schedule changes
                    disableAttendedProfiles(this);
                });
            });

            // Highlight selected profile item
            profileItems.forEach(item => {
                item.addEventListener('click', function() {
                    if (item.classList.contains("disabled-profile")) return; // Prevent disabled profiles from being selected

                    profileItems.forEach(i => i.classList.remove('selected'));
                    this.classList.add('selected');
                    this.querySelector('input[type="radio"]').checked = true;
                    selectedProfile = true;
                    toggleNextButton(selectedSchedule, selectedProfile);
                });
            });
        }

        // function highlightItems() {
        //     const scheduleItems = document.querySelectorAll('.schedule-item');
        //     const profileItems = document.querySelectorAll('.profile-item');
        //     let selectedSchedule = false;
        //     let selectedProfile = false;
        
        //     // Highlight selected schedule item
        //     scheduleItems.forEach(item => {
        //         item.addEventListener('click', function() {
        //             scheduleItems.forEach(i => i.classList.remove('selected'));
        //             this.classList.add('selected');
        //             this.querySelector('input[type="radio"]').checked = true;
        //             selectedSchedule = true;
        //             toggleNextButton(selectedSchedule, selectedProfile);

        //             // Call disableAttendedProfiles when schedule changes
        //             disableAttendedProfiles(this);
        //         });
        //     });
        
        //     // Highlight selected profile item
        //     profileItems.forEach(item => {
        //         item.addEventListener('click', function() {
        //             profileItems.forEach(i => i.classList.remove('selected'));
        //             this.classList.add('selected');
        //             this.querySelector('input[type="radio"]').checked = true;
        //             selectedProfile = true;
        //             toggleNextButton(selectedSchedule, selectedProfile);
        //         });
        //     });
        // }
            

        // Ensure the Next button only toggles when both schedule and profile are selected
        function toggleNextButton(scheduleSelected, profileSelected) {
            const nextButton = document.querySelector("#next-button");
            if (scheduleSelected && profileSelected) {
                nextButton.removeAttribute("disabled");
            } else {
                nextButton.setAttribute("disabled", "true");
            }
        }

        // function toggleNextButton(scheduleSelected, profileSelected) {
        //     const nextButton = document.querySelector(".next-button");
        //     nextButton.disabled = !(scheduleSelected && profileSelected);
        // }

        function addNextButton(container) {
            const nextButton = document.createElement("button");
            nextButton.classList.add("btn", "btn-primary", "mt-4", "next-button");
            nextButton.id = "next-button"; // Set the button ID here
            nextButton.textContent = "Next";
            nextButton.disabled = true;
        
            nextButton.addEventListener("click", async function () {
                const selectedSchedule = document.querySelector('input[name="schedule"]:checked').parentElement;
                const selectedProfile = document.querySelector('input[name="profile-selection"]:checked').closest('.profile-item');
        
                const programmeId = selectedSchedule.getAttribute("data-programmeId");
                const instanceId = selectedSchedule.getAttribute("data-instanceId");
                const programmeClassId = selectedSchedule.getAttribute("data-programmeClassId");
                const profileId = selectedProfile.getAttribute("data-profile-id");
                const profileType = selectedProfile.getAttribute("data-profile-type");
        
                const scheduleDetails = {
                    programmeId,
                    instanceId,
                    programmeClassId,
                    parentId: profileType === "parent" ? profileId : null,
                    childId: profileType === "child" ? profileId : null,
                };
        
                // Proceed to payment if the user has not attended before
                sessionStorage.setItem("selectedScheduleDetails", JSON.stringify(scheduleDetails));
                window.location.href = "new-payment.html";
            });
        
            container.appendChild(nextButton);
        }
        

        const programmeId = getProgrammeIdFromUrl();
        if (programmeId) {
            getProgrammeSchedules(programmeId);
            loadProfiles();
        }

        async function disableAttendedProfiles(selectedSchedule) {
            if (!selectedSchedule) return;
        
            const programmeId = selectedSchedule.getAttribute("data-programmeId");
            const instanceId = selectedSchedule.getAttribute("data-instanceId");
            const programmeClassId = selectedSchedule.getAttribute("data-programmeClassId");
        
            console.log("Selected Schedule:", programmeId, instanceId, programmeClassId);
        
            try {
                const response = await fetch("/api/slot/getSlots", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ programmeId, instanceId, programmeClassId })
                });
        
                const data = await response.json();
                console.log("Fetched Slots:", data);
        
                // If no slots are found, reset all disabled profiles
                if (!response.ok || !data.slots || data.slots.length === 0) {
                    console.warn("No slots found. Resetting all disabled profiles.");
                    resetDisabledProfiles();
                    return; // Stop execution since there's no need to disable any profiles
                }
        
                const attendedParents = new Set();
                const attendedChildren = new Set();
        
                data.slots.forEach(slot => {
                    if (slot.parentID) attendedParents.add(slot.parentID);
                    if (slot.childID) attendedChildren.add(slot.childID);
                });
        
                // Reset all profile items before applying disable
                resetDisabledProfiles();
        
                document.querySelectorAll(".profile-item").forEach(profileItem => {
                    const profileId = parseInt(profileItem.getAttribute("data-profile-id"));
                    const profileType = profileItem.getAttribute("data-profile-type");
                    const radioInput = profileItem.querySelector("input[type='radio']");
        
                    if (
                        (profileType === "parent" && attendedParents.has(profileId)) ||
                        (profileType === "child" && attendedChildren.has(profileId))
                    ) {
                        profileItem.classList.add("disabled-profile");
                        profileItem.setAttribute("title", "This profile is already booked for this schedule.");
                        radioInput.disabled = true;
                    }
                });
            } catch (error) {
                console.error("Error fetching slots:", error);
            }
        }

        // Function to reset disabled profiles when a new schedule is selected
        function resetDisabledProfiles() {
            document.querySelectorAll(".profile-item").forEach(profileItem => {
                profileItem.classList.remove("disabled-profile");
                profileItem.removeAttribute("title"); // Remove tooltip
                profileItem.querySelector("input[type='radio']").disabled = false;
            });
        }

        // async function disableAttendedProfiles(selectedSchedule) {
        //     if (!selectedSchedule) return;
        
        //     const programmeId = selectedSchedule.getAttribute("data-programmeId");
        //     const instanceId = selectedSchedule.getAttribute("data-instanceId");
        //     const programmeClassId = selectedSchedule.getAttribute("data-programmeClassId");
        
        //     console.log("Selected Schedule:", programmeId, instanceId, programmeClassId);
        
        //     try {
        //         const response = await fetch("/api/slot/getSlots", {
        //             method: "POST",
        //             headers: { "Content-Type": "application/json" },
        //             body: JSON.stringify({ programmeId, instanceId, programmeClassId })
        //         });
        
        //         const data = await response.json();
        //         console.log("Fetched Slots:", data);
        
        //         if (response.ok) {
        //             const attendedParents = new Set();
        //             const attendedChildren = new Set();
        
        //             data.slots.forEach(slot => {
        //                 if (slot.parentID) attendedParents.add(slot.parentID);
        //                 if (slot.childID) attendedChildren.add(slot.childID);
        //             });
        
        //             // Reset all profile items before applying disable
        //             document.querySelectorAll(".profile-item").forEach(profileItem => {
        //                 const profileId = parseInt(profileItem.getAttribute("data-profile-id"));
        //                 const profileType = profileItem.getAttribute("data-profile-type");
        //                 const radioInput = profileItem.querySelector("input[type='radio']");
        
        //                 profileItem.classList.remove("disabled-profile");
        //                 profileItem.removeAttribute("title"); // Remove tooltip if not disabled
        //                 radioInput.disabled = false;
        
        //                 if (
        //                     (profileType === "parent" && attendedParents.has(profileId)) ||
        //                     (profileType === "child" && attendedChildren.has(profileId))
        //                 ) {
        //                     profileItem.classList.add("disabled-profile");
        //                     profileItem.setAttribute("title", "This profile is already booked for this schedule.");
        //                     radioInput.disabled = true;
        //                 }
        //             });
        //         }
        //     } catch (error) {
        //         console.error("Error fetching slots:", error);
        //     }
        // }
        
        

        // async function disableAttendedProfiles(selectedSchedule) {
        //     if (!selectedSchedule) return;
        
        //     // Retrieve data attributes
        //     const programmeId = selectedSchedule.getAttribute("data-programmeId");
        //     const instanceId = selectedSchedule.getAttribute("data-instanceId");
        //     const programmeClassId = selectedSchedule.getAttribute("data-programmeClassId");
        
        //     console.log("Programme ID:", programmeId, "Instance ID:", instanceId, "Programme Class ID:", programmeClassId);
        
        //     try {
        //         const response = await fetch("/api/slot/getSlots", {
        //             method: "POST",
        //             headers: { "Content-Type": "application/json" },
        //             body: JSON.stringify({
        //                 programmeId,
        //                 instanceId,
        //                 programmeClassId,
        //                 parentId: null, // Modify this based on actual selection
        //                 childId: null   // Modify this based on actual selection
        //             }),
        //         });
        
        //         const data = await response.json();
        //         console.log("Slots Data:", data);
        
        //         if (response.ok) {
        //             // Store attended profile IDs along with their type (parent or child)
        //             const attendedProfiles = new Set(
        //                 data.slots.map(slot => JSON.stringify({ id: String(slot.parentID || slot.childID), type: slot.parentID ? "parent" : "child" }))
        //             );
        
        //             console.log("Attended Profiles Set:", attendedProfiles);
        
        //             // Iterate through all profile items
        //             document.querySelectorAll(".profile-item").forEach(profileItem => {
        //                 const profileId = profileItem.getAttribute("data-profile-id");
        //                 const profileType = profileItem.getAttribute("data-profile-type");
        
        //                 // Ensure profileId is valid before checking
        //                 if (profileId && profileType) {
        //                     const profileKey = JSON.stringify({ id: profileId, type: profileType });
        
        //                     if (attendedProfiles.has(profileKey)) {
        //                         profileItem.classList.add("disabled-profile");
        //                         profileItem.querySelector("input[type='radio']").disabled = true;
        //                         console.log(`Disabled profile: ${profileId} (${profileType})`);
        //                     } else {
        //                         profileItem.classList.remove("disabled-profile");
        //                         profileItem.querySelector("input[type='radio']").disabled = false;
        //                     }
        //                 }
        //             });
        //         }
        //     } catch (error) {
        //         console.error("Error fetching slots:", error);
        //     }
        // }
        
        
        // async function disableAttendedProfiles(selectedSchedule) {
        //     if (!selectedSchedule) return;
        
        //     const programmeId = selectedSchedule.getAttribute("data-programmeId");
        //     const instanceId = selectedSchedule.getAttribute("data-instanceId");
        //     const programmeClassId = selectedSchedule.getAttribute("data-programmeClassId");
        
        //     console.log(programmeId, instanceId, programmeClassId);

        //     try {
        //         // Change method to POST and send JSON data
        //         const response = await fetch("/api/slot/getSlots", {
        //             method: "POST",
        //             headers: {
        //                 "Content-Type": "application/json",
        //             },
        //             body: JSON.stringify({
        //                 programmeId,
        //                 instanceId,
        //                 programmeClassId,
        //                 parentId: null, // Modify this based on actual selection
        //                 childId: null   // Modify this based on actual selection
        //             }),
        //         });
        
        //         const data = await response.json();
        //         console.log(data);

        //         if (response.ok) {
        //             const attendedProfileIds = new Set(data.slots.map(slot => slot.ParentID || slot.ChildID));
        
        //             document.querySelectorAll(".profile-item").forEach(profileItem => {
        //                 const profileId = profileItem.getAttribute("data-profile-id");
        //                 const radioInput = profileItem.querySelector("input[type='radio']");
        
        //                 if (attendedProfileIds.has(profileId)) {
        //                     profileItem.classList.add("disabled-profile");
        //                     radioInput.disabled = true;
        //                 } else {
        //                     profileItem.classList.remove("disabled-profile");
        //                     radioInput.disabled = false;
        //                 }
        //             });
        //         }
        //     } catch (error) {
        //         console.error("Error fetching slots:", error);
        //     }
        // }
        
    });
