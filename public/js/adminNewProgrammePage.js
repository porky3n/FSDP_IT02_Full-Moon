document.addEventListener("DOMContentLoaded", function () {
    // Load external navbar and footer into the template
    fetch("navbar.html")
        .then(response => response.text())
        .then(data => {
            document.getElementById("navbar-container").innerHTML = data;
        });

    fetch("footer.html")
        .then(response => response.text())
        .then(data => {
            document.getElementById("footer-container").innerHTML = data;
        });

    // Add new class
    document.querySelector(".btn-add-class").addEventListener("click", function () {
        addClassItem();
    });

    // Function to add new class item
    function addClassItem() {
        const classesAccordion = document.querySelector("#classesAccordion");
        const classCount = classesAccordion.children.length + 1;

        const classItem = document.createElement("div");
        classItem.classList.add("accordion-item", "class-item", "border", "mb-3", "rounded");
        classItem.innerHTML = `
            <h2 class="accordion-header">
                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#class${classCount}">
                    Class ${classCount}
                </button>
                <button type="button" class="btn-delete-class">&times;</button>
            </h2>
            <div id="class${classCount}" class="accordion-collapse collapse" data-bs-parent="#classesAccordion">
                <div class="accordion-body">
                    <input type="text" class="custom-input mb-2" placeholder="Capacity">
                    <input type="text" class="custom-input mb-2" placeholder="Difficulty">
                    <input type="text" class="custom-input mb-2" placeholder="Time">
                    <div class="custom-input-group mb-2">
                        <input type="text" class="custom-input small-input" placeholder="Day">
                        <button class="btn-delete-day">&times;</button>
                    </div>
                    <button type="button" class="btn btn-add-day">+ Add Day</button>
                </div>
            </div>
        `;
        classesAccordion.appendChild(classItem);
        addDynamicEventListeners(classItem);
    }

    // Add new fee
    document.querySelector(".btn-add-fee").addEventListener("click", function () {
        addFeeItem();
    });

    // Function to add new fee item
    function addFeeItem() {
        const feesAccordion = document.querySelector("#feesAccordion");
        const feeCount = feesAccordion.children.length + 1;

        const feeItem = document.createElement("div");
        feeItem.classList.add("accordion-item", "fee-item", "border", "mb-3", "rounded");
        feeItem.innerHTML = `
            <h2 class="accordion-header">
                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#fee${feeCount}">
                    Fee ${feeCount}
                </button>
                <button type="button" class="btn-delete-fee">&times;</button>
            </h2>
            <div id="fee${feeCount}" class="accordion-collapse collapse" data-bs-parent="#feesAccordion">
                <div class="accordion-body">
                    <input type="text" class="custom-input mb-2" placeholder="Name">
                    <input type="text" class="custom-input mb-2" placeholder="Description">
                    <div class="additional-info mb-2">
                        <input type="text" class="custom-input small-input" placeholder="Info">
                        <button class="btn-delete-info">&times;</button>
                    </div>
                    <button type="button" class="btn btn-add-info">+ Add Info</button>
                </div>
            </div>
        `;
        feesAccordion.appendChild(feeItem);
        addDynamicEventListeners(feeItem);
    }

    // Function to add event listeners to dynamic elements
    function addDynamicEventListeners(element) {
        // Delete class or fee item
        const deleteClassButton = element.querySelector(".btn-delete-class");
        if (deleteClassButton) {
            deleteClassButton.addEventListener("click", function () {
                element.remove();
                updateClassNumbers();
            });
        }

        const deleteFeeButton = element.querySelector(".btn-delete-fee");
        if (deleteFeeButton) {
            deleteFeeButton.addEventListener("click", function () {
                element.remove();
            });
        }

        // Add new day
        const addDayButton = element.querySelector(".btn-add-day");
        if (addDayButton) {
            addDayButton.addEventListener("click", function () {
                const newDayInput = document.createElement("div");
                newDayInput.classList.add("custom-input-group", "mb-2");
                newDayInput.innerHTML = `
                    <input type="text" class="custom-input small-input" placeholder="Day">
                    <button class="btn-delete-day">&times;</button>
                `;
                addDayButton.insertAdjacentElement('beforebegin', newDayInput);

                newDayInput.querySelector(".btn-delete-day").addEventListener("click", function () {
                    newDayInput.remove();
                });
            });
        }

        // Add new info
        const addInfoButton = element.querySelector(".btn-add-info");
        if (addInfoButton) {
            addInfoButton.addEventListener("click", function () {
                const newInfoInput = document.createElement("div");
                newInfoInput.classList.add("additional-info", "mb-2");
                newInfoInput.innerHTML = `
                    <input type="text" class="custom-input small-input" placeholder="Info">
                    <button class="btn-delete-info">&times;</button>
                `;
                addInfoButton.insertAdjacentElement('beforebegin', newInfoInput);

                newInfoInput.querySelector(".btn-delete-info").addEventListener("click", function () {
                    newInfoInput.remove();
                });
            });
        }
    }

    // Function to update class numbers after deletion
    function updateClassNumbers() {
        const classesAccordion = document.querySelector("#classesAccordion");
        const classItems = classesAccordion.querySelectorAll(".class-item");

        classItems.forEach((classItem, index) => {
            const classNumber = index + 1;
            const headerButton = classItem.querySelector(".accordion-button");
            const collapseDiv = classItem.querySelector(".accordion-collapse");

            // Update the header and collapse target ID and data attribute
            headerButton.innerText = `Class ${classNumber}`;
            headerButton.setAttribute("data-bs-target", `#class${classNumber}`);
            collapseDiv.id = `class${classNumber}`;
        });
    }

    // Initialize event listeners for existing items
    document.querySelectorAll(".class-item, .fee-item").forEach(item => {
        addDynamicEventListeners(item);
    });
});
