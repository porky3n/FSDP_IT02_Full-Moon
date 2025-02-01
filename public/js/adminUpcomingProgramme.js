document.addEventListener('DOMContentLoaded', function() {
    getProgrammeInfo();
    // displayProgrammeInfo(programmes);
});

async function getProgrammeInfo() {
  try {
      const response = await fetch('/api/programme/upcoming');
      
      // Ensure the response is successful
      if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Ensure data is an array before calling the display function
      if (Array.isArray(data)) {
          displayProgrammeInfo(data);
      } else {
          console.error('Data is not an array:', data);
      }
  } catch (error) {
      console.error('Error fetching programme info:', error);
  }
}

function displayProgrammeInfo(programmes) {
  const container = document.querySelector('.upcoming-schedule'); 
  container.innerHTML = ''; // Clear previous content

  // Check if programmes is valid and not empty
  if (!Array.isArray(programmes) || programmes.length === 0) {
      container.innerHTML = '<p>No upcoming programmes found.</p>';
      return;
  }

  // Add header
  const h2 = document.createElement('h2');
  h2.innerHTML = 'Upcoming Classes';
  container.appendChild(h2);

  let row = document.createElement('div');
  row.classList.add('row');

  const currentTime = new Date();

  programmes.forEach((programme, index) => {
    console.log(programme);
      // Create a programme card
      const programmeInfo = document.createElement('div');
      programmeInfo.classList.add('col-md-4');

      const hasHostLink = programme.HostMeetingLink && programme.HostMeetingLink.trim() !== '';

      // Convert StartDateTime and EndDateTime to Date objects
      const startTime = parseDate(programme.StartDateTime);
      const endTime = parseDate(programme.EndDateTime);

      // Determine if the meeting should be enabled
      const isNear =
          ((startTime - currentTime) / (1000 * 60) <= 15) ||  // Within 5 minutes of start time
          ((currentTime < endTime) && (currentTime > startTime)); // Current time is between start and end


      // Build the inner HTML conditionally
      programmeInfo.innerHTML = `
          <div class="schedule-card p-3 mb-4">
              <h5 class="programme-name">${programme.ProgrammeName || 'No Name'}</h5>
              <p class="programme-description mb-2">${programme.Description || 'No description available'}</p>
              <p class="start-date-time mb-2"><i class="bi bi-calendar-event"></i> ${programme.StartDateTime || 'N/A'}</p>
              <p class="end-date-time mb-2"><i class="bi bi-calendar-check"></i> ${programme.EndDateTime || 'N/A'}</p>
              <p class="programme-level mb-2"><i class="bi bi-mortarboard-fill"></i> ${programme.ProgrammeLevel || 'N/A'}</p>
              <p class="programme-location mb-2"><i class="bi bi-geo-alt-fill"></i> ${programme.Location || 'N/A'}</p>
              ${hasHostLink ? `
                <div class="link-wrapper">
                    <label class="mb-1 d-block">Host Link</label>
                    <div class="d-flex align-items-center">
                        <input type="text" class="form-control flex-grow-1" value="${programme.HostMeetingLink || ''}" readonly>
                        <button class="btn btn-secondary ms-2 copy-btn">Copy</button>
                    </div>
                </div>
                <div class="link-wrapper">
                    <label class="mb-1 d-block">Viewer Link</label>
                    <div class="d-flex align-items-center">
                        <input type="text" class="form-control flex-grow-1" value="${programme.ViewerMeetingLink || ''}" readonly>
                        <button class="btn btn-secondary ms-2 copy-btn">Copy</button>
                    </div>
                </div>
                <button 
                    class="btn btn-danger mt-3 delete-meeting-btn" 
                    data-programme-class-id="${programme.ProgrammeClassID || ''}" 
                    data-instance-id="${programme.InstanceID || ''}" 
                    data-meeting-id="${programme.MeetingID || ''}"
                    data-end-date-time="${programme.EndDateTime || ''}">
                    Delete Meeting
                </button>
              ` : `
                  <button 
                      class="btn btn-primary mt-3 create-meeting-btn" 
                      data-programme-class-id="${programme.ProgrammeClassID || ''}"
                      data-instance-id="${programme.InstanceID || ''}"
                      data-end-date-time="${programme.EndDateTime || ''}"
                      ${isNear ? "" : "disabled"}>
                      Create Meeting
                  </button>
              `}
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

const parseDate = (dateStr) => {
    // Example: "20 January 2025 at 11:53 pm"
    const [day, month, year, hourMinute, period] = dateStr
      .replace(" at ", " ")
      .split(/[\s]+/); // Split by spaces only
  
    // Extract hours and minutes from hourMinute
    const [hour, minute] = hourMinute.split(":").map(Number);
  
    // Convert month name to zero-based index
    const monthIndex = new Date(`${month} 1, ${year}`).getMonth();
  
    // Adjust hours for 24-hour format
    const adjustedHour = hour + (period.toLowerCase() === "pm" && hour !== 12 ? 12 : 0);
  
    // Handle midnight case (12 am is hour 0)
    const finalHour = period.toLowerCase() === "am" && hour === 12 ? 0 : adjustedHour;
  
    // Return the Date object
    return new Date(year, monthIndex, parseInt(day, 10), finalHour, minute);
  };

document.addEventListener('click', function (event) {
    if (event.target.classList.contains('copy-btn')) {
        const input = event.target.previousElementSibling; // Get the associated input field
        input.select();
        document.execCommand('copy');
        alert('Link copied to clipboard!');
    }
});

document.querySelector('.upcoming-schedule').addEventListener('click', async (event) => {
    if (event.target.classList.contains('create-meeting-btn')) {
      const button = event.target;
  
      // Hide the create meeting button
      button.style.display = 'none';
  
      // Get the meeting details from the button's dataset
      const programmeClassID = button.dataset.programmeClassId;
      const instanceID = button.dataset.instanceId;
      const endDateTime = button.dataset.endDateTime;
  
      console.log("programmeClassID:", programmeClassID);
      console.log("instanceID:", instanceID);
      console.log("endDateTime:", endDateTime);
  
      // Call the backend API to create the meeting
      try {
        const response = await fetch('/api/meeting/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            programmeClassID,
            endDateTime,
            instanceID,
          }),
        });
  
        const data = await response.json();
  
        if (response.ok) {
          // Create the Host Link and Viewer Link textboxes with "Copy" buttons
          const parent = button.parentElement;
          const hostLinkWrapper = createLinkWrapper('Host Link', data.hostMeetingLink);
          const viewerLinkWrapper = createLinkWrapper('Viewer Link', data.viewerMeetingLink);
  
          // Append the textboxes to the card
          parent.appendChild(hostLinkWrapper);
          parent.appendChild(viewerLinkWrapper);
  
          // Add a delete meeting button dynamically
          const deleteButton = document.createElement('button');
          deleteButton.className = 'btn btn-danger mt-3 delete-meeting-btn';
          deleteButton.textContent = 'Delete Meeting';
          deleteButton.dataset.programmeClassId = programmeClassID;
          deleteButton.dataset.instanceId = instanceID;
          deleteButton.dataset.meetingId = data.meetingID; // Assuming the created meeting ID is returned in `data.meetingId`
  
          parent.appendChild(deleteButton);
        } else {
          console.error("Error creating meeting:", data.message);
          alert('Error creating meeting. Please try again.');
        }
      } catch (error) {
        console.error("Error creating meeting:", error);
        alert('Error creating meeting. Please try again.');
      }
    }
  
    // Handle delete meeting button clicks
    if (event.target.classList.contains('delete-meeting-btn')) {
        const button = event.target;
    
        const programmeClassID = button.dataset.programmeClassId;
        const instanceID = button.dataset.instanceId;
        const meetingID = button.dataset.meetingId;
        const endDateTime = button.dataset.endDateTime;

        if (!programmeClassID || !instanceID || !meetingID) {
            alert("Missing data attributes. Cannot delete meeting.");
            return;
        }
    
        const confirmation = confirm("Are you sure you want to delete this meeting?");
        if (!confirmation) return;
    
        try {
            const response = await fetch('/api/meeting/delete', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ programmeClassID, instanceID, meetingID }),
            });
    
            const result = await response.json();
    
            if (response.ok) {
                alert(result.message);
                
    
                const parentCard = button.closest('.schedule-card');
                if (!parentCard) {
                    console.error("Parent schedule card not found.");
                    return;
                }
    
                // Remove the Host Link and Viewer Link fields
                const hostLinkWrapper = parentCard.querySelector('.host-link-wrapper');
                const viewerLinkWrapper = parentCard.querySelector('.viewer-link-wrapper');
                if (hostLinkWrapper) hostLinkWrapper.remove();
                if (viewerLinkWrapper) viewerLinkWrapper.remove();

                button.remove();

                // Add the Create Meeting button dynamically
                const createMeetingBtn = document.createElement('button');
                createMeetingBtn.className = 'btn btn-primary mt-3 create-meeting-btn';
                createMeetingBtn.dataset.programmeClassId = programmeClassID;
                createMeetingBtn.dataset.instanceId = instanceID;
                createMeetingBtn.dataset.endDateTime = formatToISO8601(endDateTime);
                createMeetingBtn.textContent = 'Create Meeting';

                // Append the Create Meeting button to the card
                parentCard.appendChild(createMeetingBtn);

            } else {
                alert(`Failed to delete meeting: ${result.message}`);
            }
        } catch (error) {
            console.error("Error deleting meeting:", error);
            alert("An error occurred while trying to delete the meeting.");
        }
    }
    
  });





// Helper function to create link textboxes with copy button
function createLinkWrapper(label, defaultValue) {
    const wrapper = document.createElement('div');
    const uniqueClass = label === 'Host Link' ? 'host-link-wrapper' : 'viewer-link-wrapper';
    wrapper.classList.add('link-wrapper', uniqueClass, 'mt-3');

    wrapper.innerHTML = `
        <label class="mb-1 d-block">${label}</label>
        <div class="d-flex align-items-center">
            <input type="text" class="form-control flex-grow-1" value="${defaultValue}" readonly style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
            <button class="btn btn-secondary ms-2 copy-btn">Copy</button>
        </div>
    `;

    wrapper.querySelector('.copy-btn').addEventListener('click', function () {
        const input = wrapper.querySelector('input');
        input.select();
        document.execCommand('copy');
        alert(`${label} copied to clipboard!`);
    });

    return wrapper;
}


function formatToISO8601(dateString) {
    // Parse the input date
    const parsedDate = new Date(dateString);

    // Check if the date is valid
    if (isNaN(parsedDate)) {
        console.error("Invalid date format");
        return null;
    }

    // Convert to ISO 8601 format
    return parsedDate.toISOString();
}


// async function deleteMeeting(button) {
//     const programmeClassID = button.getAttribute("data-programme-class-iD");
//     const instanceID = button.getAttribute("data-instance-iD");
//     const meetingID = button.getAttribute("data-meeting-iD");
  
//     if (!programmeClassID || !instanceID || !meetingID) {
//       alert("Missing data attributes. Cannot delete meeting.");
//       return;
//     }
  
//     const confirmation = confirm("Are you sure you want to delete this meeting?");
//     if (!confirmation) return;
  
//     try {
//       const response = await fetch("/api/delete-meeting", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ programmeClassID, instanceID, meetingID }),
//       });
  
//       const result = await response.json();
  
//       if (response.ok) {
//         alert(result.message);
//         button.disabled = true; // Optionally disable the button after deletion
//       } else {
//         alert(`Failed to delete meeting: ${result.message}`);
//       }
//     } catch (error) {
//       console.error("Error deleting meeting:", error);
//       alert("An error occurred while trying to delete the meeting.");
//     }
//   }
  
// Add event listeners to "Create Meeting" buttons
// async function createAndJoinMeeting(programmeClassID, endDateTime, instanceID) {
//     try {
//       // Send request to the backend to create/update the meeting link
//       const response = await fetch('/api/meeting/create', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ programmeClassID, endDateTime, instanceID }),
//       });
  
//       // Handle the response
//       if (response.ok) {
//         const data = await response.json();
  
//         if (data.hostMeetingLink) {
//           console.log("Meeting created successfully. Redirecting to the meeting...");
  
//           // Automatically redirect the user to the meeting link
//           // window.location.href = data.hostMeetingLink;
//           // Open the meeting link in a new tab
//           window.open(data.hostMeetingLink, '_blank');
//         } else {
//           alert("Meeting link not returned. Please try again.");
//         }
//       } else {
//         console.error('Failed to create meeting:', response.statusText);
//         alert("Failed to create the meeting. Please contact support.");
//       }
//     } catch (error) {
//       console.error("Error creating/joining the meeting:", error);
//       alert("An error occurred while creating/joining the meeting.");
//     }
//   }
  
  // Example Usage
//   const programmeClassID = 1; // Replace with actual ID
//   const instanceID = 101; // Replace with actual instance ID
//   const endDateTime = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1-hour duration
  
  // Call the function
//   createAndJoinMeeting(programmeClassID, endDateTime, instanceID);
  