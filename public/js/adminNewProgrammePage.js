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

    // Add new fee
    document.querySelector(".btn-add-fee").addEventListener("click", function () {
        const feesContainer = document.querySelector(".fees-container");
        const feeItem = document.createElement("div");
        feeItem.classList.add("fee-item", "border", "p-3", "mb-3", "rounded");

        feeItem.innerHTML = `
            <div class="fee-inputs-group">
                <input type="text" class="fee-input custom-input" placeholder="Fee">
                <input type="text" class="fee-input custom-input" placeholder="Name">
                <input type="text" class="fee-input custom-input" placeholder="Description">
            </div>
            <div class="additional-info mb-2">
                <input type="text" class="custom-input small-input" placeholder="Info 1">
                <button class="btn-delete">&times;</button>
            </div>
            <button type="button" class="btn btn-add-info">+ Add Info</button>
        `;

        // Append the new fee item to the container
        feesContainer.appendChild(feeItem);

        // Add event listeners to the new buttons
        addDynamicEventListeners(feeItem);
    });

    // Add new class
    document.querySelector(".btn-add-class").addEventListener("click", function () {
        const classesContainer = document.querySelector(".classes-container");
        const classItem = document.createElement("div");
        classItem.classList.add("class-item", "border", "p-3", "mb-3", "rounded");

        classItem.innerHTML = `
            <div class="class-inputs-group">
                <input type="text" class="class-input custom-input" placeholder="Class">
                <input type="text" class="class-input custom-input" placeholder="Capacity">
                <input type="text" class="class-input custom-input" placeholder="Difficulty">
                <input type="text" class="class-input custom-input" placeholder="Time">
            </div>
            <div class="custom-input-group mb-2">
                <input type="text" class="custom-input small-input" placeholder="Day 1">
                <button class="btn-delete">&times;</button>
            </div>
            <button type="button" class="btn btn-add-day">+ Add Day</button>
        `;

        // Append the new class item to the container
        classesContainer.appendChild(classItem);

        // Add event listeners to the new buttons
        addDynamicEventListeners(classItem);
    });

    // Function to add event listeners to dynamic elements
    function addDynamicEventListeners(element) {
        // Add event listener for delete buttons
        element.querySelectorAll(".btn-delete").forEach(button => {
            button.addEventListener("click", function () {
                this.parentElement.remove();
            });
        });

        // Add event listener for adding new info inputs
        const addInfoButton = element.querySelector(".btn-add-info");
        if (addInfoButton) {
            addInfoButton.addEventListener("click", function () {
                const existingInfoItems = element.querySelectorAll(".additional-info");
                const newInfoNumber = existingInfoItems.length + 1; // Get the next info number (e.g., Info 2)

                const newInfoInput = document.createElement("div");
                newInfoInput.classList.add("additional-info", "mb-2");
                newInfoInput.innerHTML = `
                    <input type="text" class="custom-input small-input" placeholder="Info ${newInfoNumber}">
                    <button class="btn-delete">&times;</button>
                `;

                // Insert the new additional-info after the first info item
                const firstInfoItem = element.querySelector(".additional-info");
                firstInfoItem.insertAdjacentElement('afterend', newInfoInput);

                // Add event listener to the delete button of the new info
                newInfoInput.querySelector(".btn-delete").addEventListener("click", function () {
                    newInfoInput.remove();
                });
            });
        }

        // Add event listener for adding new day inputs
        const addDayButton = element.querySelector(".btn-add-day");
        if (addDayButton) {
            addDayButton.addEventListener("click", function () {
                const newDayInput = document.createElement("div");
                newDayInput.classList.add("custom-input-group", "mb-2");
                newDayInput.innerHTML = `
                    <input type="text" class="custom-input small-input" placeholder="Day">
                    <button class="btn-delete">&times;</button>
                `;
                addDayButton.insertAdjacentElement('beforebegin', newDayInput);

                // Add event listener to the delete button of the new day
                newDayInput.querySelector(".btn-delete").addEventListener("click", function () {
                    newDayInput.remove();
                });
            });
        }
    }
});
