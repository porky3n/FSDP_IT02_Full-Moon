// Fetch programs data from the API endpoint
async function getProgramsData(endpoint = "/api/programme") {
  try {
    const response = await fetch(endpoint); // Endpoint dynamically set by calling function
    const data = await response.json();
    return data.map((program) => ({
      ProgrammeID: program.programmeID,
      ProgrammeName: program.programmeName,
      Description: program.description,
      StartDate: program.startDate,
      EndDate: program.endDate,
      Category: program.category,
      Location: program.location,
      Fee: program.fee,
      MaxSlots: program.maxSlots,
      ProgrammeLevel: program.programmeLevel,
      Image: program.image || 'https://via.placeholder.com/400x200' // Assuming "image" is part of the response or set to a default
    }));
  } catch (error) {
    console.error("Error fetching program data:", error);
    return [];
  }
}

// Initialize featured slider
function initFeaturedSlider() {
  return new Swiper('.featured-slider', {
    effect: 'coverflow',
    grabCursor: true,
    centeredSlides: true,
    loop: true,
    slidesPerView: 'auto',
    coverflowEffect: {
      rotate: 0,
      stretch: 0,
      depth: 100,
      modifier: 2.5,
    },
    pagination: {
      el: '.swiper-pagination',
      clickable: true,
    },
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    }
  });
}

// Populate the featured programs section
async function populateFeaturedPrograms() {
  const programs = await getProgramsData("/api/programme/featured");
  const featuredSliderContainer = document.querySelector('.featured-slider .swiper-wrapper');

  programs.forEach((program) => {
    const slide = document.createElement('div');
    slide.classList.add('swiper-slide', 'featured-slide');
    slide.innerHTML = `
      <div class="card" onclick="location.href='userProgrammeInfoPage.html?programmeId=${encodeURIComponent(program.ProgrammeID)}'">
        <img src="${program.Image}" class="card-img-top" alt="${program.ProgrammeName}">
        <div class="card-body">
          <h5 class="card-title">${program.ProgrammeName}</h5>
          <p class="card-text">${program.Description}</p>
        </div>
      </div>
    `;
    featuredSliderContainer.appendChild(slide);
  });

  initFeaturedSlider(); // Initialize the slider after adding slides
}


// Helper function to get the first schedule for a specific programme
async function getFirstSchedule(programmeID) {
  const response = await fetch(`/api/programmeSchedule/${programmeID}/first-schedule`);
  if (!response.ok) throw new Error(`Failed to fetch schedule for programme ID: ${programmeID}`);
  const schedule = await response.json();
  return schedule;
}

// Populate the private coaching section
async function populatePrivateCoaching() {
  const programs = await getProgramsData("/api/programme/category/Art");
  const privateCoachingContainer = document.querySelector('.private .row.mt-4');
  privateCoachingContainer.innerHTML = ''; // Clear existing content if needed

  // Loop through programs and get the first schedule date for each
  for (const program of programs.slice(0, 3)) { // Display first three items as an example
    const col = document.createElement('div');
    col.classList.add('col-md-4');

    // Fetch the first schedule date for the program
    const firstSchedule = await getFirstSchedule(program.ProgrammeID);
    const startDate = new Date(firstSchedule.startDateTime); // Use first schedule's StartDateTime

    // Format month and day from the start date
    const startMonth = startDate.toLocaleString('default', { month: 'short' });
    const startDay = startDate.getDate();

    col.innerHTML = `
      <div class="card" onclick="location.href='userProgrammeInfoPage.html?programmeId=${encodeURIComponent(program.ProgrammeID)}'">
        <img src="${program.Image}" class="card-img-top" alt="${program.ProgrammeName}">
        <div class="card-body">
          <h6>${startMonth} ${startDay}</h6>
          <div>
            <h5 class="card-title">${program.ProgrammeName}</h5>
            <p class="card-text">${program.Description}</p>
          </div>
        </div>
      </div>
    `;
    privateCoachingContainer.appendChild(col);
  }
}

// Populate the search results section
async function populateSearchResults(keyword) {
  const programs = await getProgramsData(`/api/programme/search?keyword=${encodeURIComponent(keyword)}`);
  const cardGridContainer = document.querySelector('.card-grid'); // Select only the card grid
  cardGridContainer.innerHTML = ''; // Clear existing card content

  let row;

  // Loop through programs and get the first schedule date for each
  for (const [index, program] of programs.entries()) {
    // Create a new row for every 3 programs
    if (index % 3 === 0) {
      row = document.createElement('div');
      row.classList.add('row', 'mt-5');
      cardGridContainer.appendChild(row);
    }

    const col = document.createElement('div');
    col.classList.add('col-md-4');

    // Fetch the first schedule date for the program
    const firstSchedule = await getFirstSchedule(program.ProgrammeID);
    const startDate = new Date(firstSchedule.startDateTime); // Use first schedule's StartDateTime

    // Format month and day from the start date
    const startMonth = startDate.toLocaleString('default', { month: 'short' });
    const startDay = startDate.getDate();

    col.innerHTML = `
      <div class="card" onclick="location.href='userProgrammeInfoPage.html?programmeId=${encodeURIComponent(program.ProgrammeID)}'">
        <img src="${program.Image}" class="card-img-top" alt="${program.ProgrammeName}">
        <div class="card-body">
          <h6>${startMonth} ${startDay}</h6>
          <div>
            <h5 class="card-title">${program.ProgrammeName}</h5>
            <p class="card-text">${program.Description}</p>
          </div>
        </div>
      </div>
    `;
    row.appendChild(col);
  }
}


// Initialize the page with dynamic content
async function initPage() {
  await populateFeaturedPrograms();
  await populatePrivateCoaching();
  await populateSearchResults(""); // Initialize with empty search to load all results
}

document.addEventListener("DOMContentLoaded", initPage);


