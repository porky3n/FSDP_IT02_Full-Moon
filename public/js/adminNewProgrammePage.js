document.addEventListener("DOMContentLoaded", function () {
    const classesAccordion = document.querySelector("#classesAccordion");
    const imagesSection = document.querySelector("#imagesSection");
    let mainImageBinary = null;
    const additionalImagesBinary = [];

    // Load Navbar
    fetch("adminNavbar.html")
        .then(response => response.text())
        .then(data => document.getElementById("navbar-container").innerHTML = data);

    // Add new class item
    document.querySelector(".btn-add-class").addEventListener("click", function () {
        addClassItem();
    });

    // Handle main image upload
    document.getElementById("programmeMainImage").addEventListener("change", function (event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                const base64Image = e.target.result.split(",")[1];
                mainImageBinary = Uint8Array.from(atob(base64Image), c => c.charCodeAt(0));
            };
            reader.readAsDataURL(file);
        }
    });

    // Add additional programme image
    document.querySelector(".btn-add-image").addEventListener("click", function () {
        const imageItem = document.createElement("div");
        imageItem.classList.add("mb-2");

        imageItem.innerHTML = `
            <input type="file" class="form-control programme-image-file" accept="image/*">
            <button type="button" class="btn btn-danger btn-sm btn-delete-image">&times;</button>
        `;
        imagesSection.appendChild(imageItem);

        imageItem.querySelector(".programme-image-file").addEventListener("change", function (event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    const base64Image = e.target.result.split(",")[1];
                    const imageBinary = Uint8Array.from(atob(base64Image), c => c.charCodeAt(0));
                    additionalImagesBinary.push(imageBinary);
                };
                reader.readAsDataURL(file);
            }
        });

        imageItem.querySelector(".btn-delete-image").addEventListener("click", function () {
            imageItem.remove();
        });
    });

    // Submit form
    document.querySelector("#programmeForm").addEventListener("submit", async function (event) {
        event.preventDefault(); 

        const serializedMainImageBinary = mainImageBinary ? Array.from(mainImageBinary) : null;

        // Collect programme data
        const programmeData = {
            title: document.getElementById("programmeTitle").value,
            category: document.getElementById("programmeCategory").value,
            description: document.getElementById("programmeDescription").value,
            picture: serializedMainImageBinary, // Send as an array  
            classes: Array.from(document.querySelectorAll(".class-item")).map(classItem => ({
                shortDescription: classItem.querySelector(".short-description").value,
                location: classItem.querySelector(".location").value,
                fee: parseFloat(classItem.querySelector(".fee").value),
                maxSlots: parseInt(classItem.querySelector(".max-slots").value),
                level: classItem.querySelector(".level").value,
                remarks: classItem.querySelector(".remarks").value,
                days: Array.from(classItem.querySelectorAll(".schedule-container > div")).map(dayItem => ({
                    startDateTime: dayItem.querySelector(".start-date").value,
                    endDateTime: dayItem.querySelector(".end-date").value
                }))
            })),
            images: additionalImagesBinary.map(binary => Array.from(binary))  // Convert each binary image to an array for ProgrammeImages table
        };

        // Send to backend API
        try {
            const response = await fetch("/api/programmes/new", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(programmeData)
            });

            if (response.ok) {
                alert("Programme added successfully");
                window.location.reload();
            } else {
                alert("Failed to add programme");
            }
        } catch (error) {
            console.error("Error adding programme:", error);
            alert("An error occurred. Please try again later.");
        }
    });


    function addClassItem() {
        const classCount = classesAccordion.children.length + 1;
        const classItem = document.createElement("div");
        classItem.classList.add("accordion-item", "mb-3", "class-item");

        classItem.innerHTML = `
            <h5>Class ${classCount}</h5>
            <button type="button" class="btn-close-class btn btn-danger btn-sm mb-2">Close Class</button>
            <div>
                <label>Short Description</label>
                <input type="text" class="form-control short-description mb-2" placeholder="Short Description">
                <label>Location</label>
                <input type="text" class="form-control location mb-2" placeholder="Location">
                <label>Fee</label>
                <input type="number" step="0.01" class="form-control fee mb-2" placeholder="Fee">
                <label>Max Slots</label>
                <input type="number" class="form-control max-slots mb-2" placeholder="Max Slots">
                <label>Level</label>
                <input type="text" class="form-control level mb-2" placeholder="Level">
                <label>Remarks</label>
                <input type="text" class="form-control remarks mb-2" placeholder="Remarks">

                <h6>Schedule</h6>
                <div class="schedule-container"></div>
                <button type="button" class="btn btn-sm btn-secondary btn-add-day">+ Add Schedule Day</button>
            </div>
        `;
        classesAccordion.appendChild(classItem);
        addDynamicEventListeners(classItem);
    }

    function addDynamicEventListeners(classItem) {
        // Close Class Button
        classItem.querySelector(".btn-close-class").addEventListener("click", function () {
            classItem.remove();
            updateClassNumbers();
        });

        // Add Schedule Day
        classItem.querySelector(".btn-add-day").addEventListener("click", function () {
            const scheduleContainer = classItem.querySelector(".schedule-container");
            const dayItem = document.createElement("div");
            dayItem.classList.add("mb-2");

            dayItem.innerHTML = `
                <input type="datetime-local" class="form-control start-date mb-2" placeholder="Start Date and Time">
                <input type="datetime-local" class="form-control end-date mb-2" placeholder="End Date and Time">
                <button class="btn btn-danger btn-sm btn-delete-day">&times;</button>
            `;
            scheduleContainer.appendChild(dayItem);

            // Remove Schedule Day
            dayItem.querySelector(".btn-delete-day").addEventListener("click", function () {
                dayItem.remove();
            });
        });
    }

    // Update class numbers after deletion
    function updateClassNumbers() {
        document.querySelectorAll(".class-item").forEach((classItem, index) => {
            const classNumber = index + 1;
            classItem.querySelector("h5").innerText = `Class ${classNumber}`;
        });
    }
});
