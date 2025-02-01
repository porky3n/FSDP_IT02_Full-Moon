document.addEventListener("DOMContentLoaded", function () {
    async function fetchData() {
        try {
            const response = await fetch("/api/programme/all");
            if (!response.ok) {
                throw new Error("Failed to fetch programme details");
            }
    
            const data = await response.json();
            console.log("Fetched data:", data); // Log the data structure
            populateTables(data);
        } catch (error) {
            console.error("Error fetching all programme details:", error);
            alert("Failed to load programme details. Please try again.");
        }
    }

    
    function populateTables(data) {
        if (data.programmes) populateProgrammeTable(data.programmes);
        if (data.programmeClasses) populateProgrammeClassTable(data.programmeClasses);
        if (data.batches) populateProgrammeClassBatchTable(data.batches);
        if (data.schedules) populateProgrammeScheduleTable(data.schedules);
        if (data.images) populateProgrammeImagesTable(data.images);
    }

    function populateProgrammeTable(programmes) {
        const programmeTableBody = document.querySelector("#programmeTable tbody");
        programmeTableBody.innerHTML = "";
        programmes.forEach((programme) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${programme.programmeID}</td>
                <td>${programme.programmeName}</td>
                <td>${programme.category}</td>
                <td>${programme.description}</td>
            `;
            programmeTableBody.appendChild(row);
        });
    }
    
    function populateProgrammeClassTable(programmeClasses) {
        const classTableBody = document.querySelector("#programmeClassTable tbody");
        classTableBody.innerHTML = "";
        programmeClasses.forEach((cls) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${cls.programmeClassID}</td>
                <td>${cls.programmeID}</td>
                <td>${cls.shortDescription}</td>
                <td>${cls.location}</td>
                <td>${cls.fee}</td>
                <td>${cls.maxSlots}</td>
                <td>${cls.programmeLevel}</td>
                <td>${cls.remarks || "N/A"}</td>
            `;
            classTableBody.appendChild(row);
        });
    }
    
    function populateProgrammeClassBatchTable(batches) {
        const batchTableBody = document.querySelector("#programmeClassBatchTable tbody");
        batchTableBody.innerHTML = "";
        batches.forEach((batch) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${batch.instanceID}</td>
                <td>${batch.programmeClassID}</td>
            `;
            batchTableBody.appendChild(row);
        });
    }
    
    function populateProgrammeScheduleTable(schedules) {
        const scheduleTableBody = document.querySelector("#programmeScheduleTable tbody");
        scheduleTableBody.innerHTML = "";
        schedules.forEach((schedule) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${schedule.scheduleID}</td>
                <td>${schedule.instanceID}</td>
                <td>${new Date(schedule.startDateTime).toLocaleString()}</td>
                <td>${new Date(schedule.endDateTime).toLocaleString()}</td>
            `;
            scheduleTableBody.appendChild(row);
        });
    }
    
    function populateProgrammeImagesTable(images) {
        const imagesTableBody = document.querySelector("#programmeImagesTable tbody");
        imagesTableBody.innerHTML = ""; // Clear existing table content
    
        images.forEach((image) => {
            const imgSrc = `data:image/png;base64,${image.Image}`; // Validate this value in the console
            const row = document.createElement("tr");
    
            row.innerHTML = `
                <td>${image.ImageID}</td>
                <td>${image.ProgrammeID}</td>
                <td><img src="${imgSrc}" alt="Programme Image" class="img-thumbnail" width="100"></td>
            `;
    
            imagesTableBody.appendChild(row);
        });
    }    

    fetchData();
});

document.addEventListener("DOMContentLoaded", function () {
    let selectedProgrammeID;

    async function fetchProgrammes() {
        try {
            const response = await fetch("/api/programme/all");
            if (!response.ok) throw new Error(`Error fetching programmes: ${response.statusText}`);
            const data = await response.json();
            renderProgrammes(data);
        } catch (error) {
            console.error("Error fetching programmes:", error);
            alert("An error occurred while loading programmes. Please try again.");
        }
    }

    function renderProgrammes(data) {
        const programmeTableBody = document.querySelector("#programmeTable tbody");
        programmeTableBody.innerHTML = "";
        data.programmes.forEach((programme) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${programme.programmeID}</td>
                <td>${programme.programmeName}</td>
                <td>${programme.category}</td>
                <td>${programme.description}</td>
                <td>
                    <button class="btn btn-primary btn-sm btn-edit" data-id="${programme.programmeID}">Edit</button>
                    <button class="btn btn-danger btn-sm btn-delete" data-id="${programme.programmeID}">Delete</button>
                </td>
            `;
            programmeTableBody.appendChild(row);
        });

        addEventListeners();
    }

    function addEventListeners() {
        document.querySelectorAll(".btn-edit").forEach((btn) => {
            btn.addEventListener("click", (e) => {
                selectedProgrammeID = e.target.getAttribute("data-id");
                openEditModal(selectedProgrammeID);
            });
        });

        document.querySelectorAll(".btn-delete").forEach((btn) => {
            btn.addEventListener("click", (e) => {
                selectedProgrammeID = e.target.getAttribute("data-id");
                openDeleteModal(selectedProgrammeID);
            });
        });
    }

    function openEditModal(id) {
        // Fetch programme details to prefill the form
        fetch(`/api/programme/${id}`)
            .then((response) => response.json())
            .then((programme) => {
                document.getElementById("editProgrammeName").value = programme.programmeName;
                document.getElementById("editProgrammeCategory").value = programme.category;
                document.getElementById("editProgrammeDescription").value = programme.description;
                new bootstrap.Modal(document.getElementById("editProgrammeModal")).show();
            })
            .catch((error) => console.error("Error fetching programme details:", error));
    }

    function openDeleteModal(id) {
        new bootstrap.Modal(document.getElementById("deleteProgrammeModal")).show();
    }

    // Handle save changes in edit modal
    document.getElementById("editProgrammeForm").addEventListener("submit", async (e) => {
        e.preventDefault();
        const updatedProgramme = {
            programmeName: document.getElementById("editProgrammeName").value,
            category: document.getElementById("editProgrammeCategory").value,
            description: document.getElementById("editProgrammeDescription").value,
        };

        try {
            const response = await fetch(`/api/programme/${selectedProgrammeID}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedProgramme),
            });
            if (!response.ok) throw new Error("Failed to update programme");

            alert("Programme updated successfully");
            bootstrap.Modal.getInstance(document.getElementById("editProgrammeModal")).hide();
            fetchProgrammes();
        } catch (error) {
            console.error("Error updating programme:", error);
            alert("An error occurred while updating the programme. Please try again.");
        }
    });

    // Handle delete confirmation
    document.getElementById("confirmDeleteButton").addEventListener("click", async () => {
        try {
            const response = await fetch(`/api/programme/${selectedProgrammeID}`, { method: "DELETE" });
            if (!response.ok) throw new Error("Failed to delete programme");

            alert("Programme deleted successfully");
            bootstrap.Modal.getInstance(document.getElementById("deleteProgrammeModal")).hide();
            fetchProgrammes();
        } catch (error) {
            console.error("Error deleting programme:", error);
            alert("An error occurred while deleting the programme. Please try again.");
        }
    });

    fetchProgrammes();
});