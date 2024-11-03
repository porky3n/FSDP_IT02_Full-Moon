// Fetch programs data from the API endpoint
async function getProgramsData(endpoint = "/api/programme") {
  try {
    const response = await fetch(endpoint); // Endpoint dynamically set by calling function
    const data = await response.json();
    return data.map((program) => ({
      ProgrammeName: program.programmeName,
      Description: program.description,
      StartDate: program.startDate,
      EndDate: program.endDate,
      Category: program.category,
      Location: program.location,
      Fee: program.fee,
      MaxSlots: program.maxSlots,
      ProgrammeLevel: program.programmeLevel,
      Image: program.image || 'images/default.png' // Assuming "image" is part of the response or set to a default
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
  const programs = await getProgramsData("/api/featuredProgramme");
  const featuredSliderContainer = document.querySelector('.featured-slider .swiper-wrapper');

  programs.forEach((program) => {
    const slide = document.createElement('div');
    slide.classList.add('swiper-slide', 'featured-slide');
    slide.innerHTML = `
      <div class="card">
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

// Populate the private coaching section
async function populatePrivateCoaching() {
  const programs = await getProgramsData("/api/programme/category/Workshop");
  const privateCoachingContainer = document.querySelector('.private .row.mt-4');
  privateCoachingContainer.innerHTML = ''; // Clear existing content if needed

  programs.slice(0, 3).forEach((program) => { // Display first three items as an example
    const col = document.createElement('div');
    col.classList.add('col-md-4');

    // Convert StartDate and EndDate to Date objects
    const startDate = new Date(program.StartDate);
    const endDate = new Date(program.EndDate);

    // Format month and day
    const startMonth = startDate.toLocaleString('default', { month: 'short' });
    const startDay = startDate.getDate();
    const endMonth = endDate.toLocaleString('default', { month: 'short' });
    const endDay = endDate.getDate();

    col.innerHTML = `
      <div class="card">
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
  });
}

// Populate the search results section
async function populateSearchResults(keyword) {
  const programs = await getProgramsData(`/api/searchProgramme?keyword=${encodeURIComponent(keyword)}`);
  const cardGridContainer = document.querySelector('.card-grid'); // Select only the card grid
  cardGridContainer.innerHTML = ''; // Clear existing card content

  let row;

  programs.forEach((program, index) => {
    // Create a new row for every 3 programs
    if (index % 3 === 0) {
      row = document.createElement('div');
      row.classList.add('row', 'mt-5');
      cardGridContainer.appendChild(row);
    }

    const col = document.createElement('div');
    col.classList.add('col-md-4');

    // Convert StartDate to Date object for formatting
    const startDate = new Date(program.StartDate);
    const startMonth = startDate.toLocaleString('default', { month: 'short' });
    const startDay = startDate.getDate();

    col.innerHTML = `
      <div class="card">
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
  });
}

// Initialize the page with dynamic content
async function initPage() {
  await populateFeaturedPrograms();
  await populatePrivateCoaching();
  await populateSearchResults(""); // Initialize with empty search to load all results
}

document.addEventListener("DOMContentLoaded", initPage);


