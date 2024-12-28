document.addEventListener('DOMContentLoaded', function() {
    // let programmes = getProgrammeInfo();
    // displayProgrammeInfo(programmes);
});

async function getProgrammeInfo() {
    try {
        const response = await fetch('/api/programme');
        const data = await response.json();
        console.log(data);
    } catch (error) {
        console.error('Error fetching programme info:', error);
    }
}

function displayProgrammeInfo(programmes) {
    const container = document.querySelector('.upcoming-schedule'); // Correct container selector
    const h2 = document.createElement('h2');
    h2.innerHTML = 'Upcoming Classes';
    container.appendChild(h2);

    let row = document.createElement('div');
    row.classList.add('row');

    programmes.forEach((programme, index) => {
        // Create a programme card
        const programmeInfo = document.createElement('div');
        programmeInfo.classList.add('col-md-4');
        programmeInfo.innerHTML = `
            <div class="schedule-card p-3 mb-4">
                <h5 class="programme-name">${programme.programmeName}</h5>
                <p class="start-date-time mb-2"><i class="bi bi-calendar-event"></i> ${programme.startDate}</p>
                <p class="participants"><i class="bi bi-people-fill"></i> ${programme.participants}</p>
                <button class="btn btn-primary mt-3 create-meeting-btn">Create Meeting</button>
            </div>
        `;

        row.appendChild(programmeInfo);

        // Append the current row to the container and start a new row every 3 programmes
        if ((index + 1) % 3 === 0 || index === programmes.length - 1) {
            container.appendChild(row);
            row = document.createElement('div');
            row.classList.add('row');
        }
    });

}

// should be inside the function for displaying programme info
// Add event listeners to "Create Meeting" buttons
document.querySelectorAll('.create-meeting-btn').forEach((button) => {
    button.addEventListener('click', function () {
        // Hide the button
        this.style.display = 'none';

        // Create the Host Link and Viewer Link textboxes with "Copy" buttons
        const parent = this.parentElement;

        const hostLinkWrapper = createLinkWrapper('Host Link', 'https://hostlink.exampleexampleexampleexampleexampleexample.com');
        const viewerLinkWrapper = createLinkWrapper('Viewer Link', 'https://viewerlink.example.com');

        // Append the textboxes to the card
        parent.appendChild(hostLinkWrapper);
        parent.appendChild(viewerLinkWrapper);
    });
});


// Helper function to create link textboxes with copy button
function createLinkWrapper(label, defaultValue) {
    const wrapper = document.createElement('div');
    wrapper.classList.add('link-wrapper', 'mt-3');

    // Add label and textbox layout
    wrapper.innerHTML = `
        <label class="mb-1 d-block">${label}</label>
        <div class="d-flex align-items-center">
            <input type="text" class="form-control flex-grow-1" value="${defaultValue}" readonly style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
            <button class="btn btn-secondary ms-2 copy-btn">Copy</button>
        </div>
    `;

    // Add event listener to "Copy" button
    wrapper.querySelector('.copy-btn').addEventListener('click', function () {
        const input = wrapper.querySelector('input');
        input.select();
        document.execCommand('copy');
        alert(`${label} copied to clipboard!`);
    });

    return wrapper;
}

