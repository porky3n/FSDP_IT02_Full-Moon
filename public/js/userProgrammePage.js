document.addEventListener("DOMContentLoaded", () => {
  initPage(); // Initialize featured, private coaching, and initial search results

  // Search input listener
  const searchInput = document.querySelector(".search-bar .input");
  searchInput.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
      const keyword = searchInput.value.trim();
      const category = getSelectedCategory(); // Get selected category from dropdown
      if (keyword) {
        populateSearchResults(keyword, 1, 6, category); // Call search with category
      } else {
        populateSearchResults("", 1, 6, category); // Call default results with category if input is empty
      }
    }
  });

  // Sort dropdown listener
  const sortDropdown = document.querySelector(".sort-dropdown select");
  sortDropdown.addEventListener("change", function () {
    const keyword = searchInput.value.trim();
    const category = getSelectedCategory(); // Get selected category from dropdown
    populateSearchResults(keyword, 1, 6, category); // Pass category to search
  });

  // Reset button listener
  const resetButton = document.getElementById("reset-button");
  resetButton.addEventListener("click", () => {
    searchInput.value = ""; // Clear the search input
    sortDropdown.selectedIndex = 0; // Reset the dropdown to the default option
    populateSearchResults("", 1); // Call search function with no keyword to reset
  });
});

// Caching variables
let featuredProgramsCache = null;
let privateCoachingCache = null;
let currentPage = 1; // Track the current page

// Initialize the page with dynamic content
async function initPage() {
  await populateFeaturedPrograms();
  await populatePrivateCoaching();
  await populateSearchResults("", 1); // Initialize with empty search to load all results
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
      stretch: -100,
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

// Populate the featured programs section with caching
async function populateFeaturedPrograms() {
  try {
    // Check cache first
    if (!featuredProgramsCache) {
      const response = await fetch("/api/programme/featured");
      featuredProgramsCache = await response.json();
    }

    const featuredSliderContainer = document.querySelector('.featured-slider .swiper-wrapper');
    const programmes = featuredProgramsCache.map(program => ({
      ProgrammeID: program.programmeID,
      ProgrammeName: program.programmeName,
      Description: program.description,
      Category: program.category,
      ProgrammePicture: program.programmePicture || 'https://via.placeholder.com/400x200'
    }));

    programmes.forEach((program) => {
      const slide = document.createElement('div');
      slide.classList.add('swiper-slide', 'featured-slide');
      slide.innerHTML = `
        <div class="card" onclick="location.href='userProgrammeInfoPage.html?programmeId=${encodeURIComponent(program.ProgrammeID)}'">
          <img src="${program.ProgrammePicture}" class="card-img-top" alt="${program.ProgrammeName}">
          <div class="card-body">
            <h5 class="card-title">${program.ProgrammeName}</h5>
            <p class="card-text">${program.Description}</p>
          </div>
        </div>
      `;
      featuredSliderContainer.appendChild(slide);
    });

    initFeaturedSlider(); // Initialize the slider after adding slides
  } catch (error) {
    console.error("Error fetching featured programs:", error);
  }
}

// Populate the private coaching section with caching
async function populatePrivateCoaching() {
  try {
    // Check cache first
    if (!privateCoachingCache) {
      const response = await fetch("/api/programme/category/Workshop");
      privateCoachingCache = await response.json();
    }

    const privateCoachingContainer = document.querySelector('.private .row.mt-4');
    privateCoachingContainer.innerHTML = ''; // Clear existing content if needed

    const programmes = privateCoachingCache.map(program => ({
      ProgrammeID: program.programmeID,
      ProgrammeName: program.programmeName,
      Description: program.description,
      Category: program.category,
      ProgrammePicture: program.programmePicture || 'https://via.placeholder.com/400x200'
    }));

    programmes.slice(0, 3).forEach((program) => { // Display first three items as an example
      const col = document.createElement('div');
      col.classList.add('col-md-4');

      col.innerHTML = `
        <div class="card" onclick="location.href='userProgrammeInfoPage.html?programmeId=${encodeURIComponent(program.ProgrammeID)}'">
          <img src="${program.ProgrammePicture}" class="card-img-top" alt="${program.ProgrammeName}">
          <div class="card-body">
            <div>
              <h5 class="card-title">${program.ProgrammeName}</h5>
              <p class="card-text">${program.Description}</p>
            </div>
          </div>
        </div>
      `;
      privateCoachingContainer.appendChild(col);
    });
  } catch (error) {
    console.error("Error fetching private coaching programs:", error);
  }
}

// Helper function to get selected category
function getSelectedCategory() {
  const sortDropdown = document.querySelector(".sort-dropdown select");
  return sortDropdown.value;
}

// Populate the search results section
// Populate the search results section
async function populateSearchResults(keyword, page = 1, limit = 6, category = "All") {
  try {
    currentPage = page; // Update the current page
    console.log(`Loading page: ${page}, Category: ${category}, Keyword: ${keyword}`); // Debug log

    const response = await fetch(`/api/programme/search?keyword=${encodeURIComponent(keyword)}&page=${page}&limit=${limit}&category=${encodeURIComponent(category)}`);
    const { programmes, total, totalPages } = await response.json();

    console.log("Total Pages:", totalPages); // Check if totalPages is correct

    const cardGridContainer = document.querySelector('.card-grid');
    cardGridContainer.innerHTML = ''; // Clear existing content

    let row;

    // Loop through programs and add them in a row structure
    programmes.forEach((program, index) => {
      if (index % 3 === 0) {
        row = document.createElement('div');
        row.classList.add('row', 'mt-5');
        cardGridContainer.appendChild(row);
      }

      const col = document.createElement('div');
      col.classList.add('col-md-4');

      col.innerHTML = `
        <div class="card" onclick="location.href='userProgrammeInfoPage.html?programmeId=${encodeURIComponent(program.programmeID)}'">
          <img src="${program.programmePicture || 'https://via.placeholder.com/400x200'}" class="card-img-top" alt="${program.programmeName}">
          <div class="card-body">
            <div>
              <h5 class="card-title">${program.programmeName}</h5>
              <p class="card-text">${program.description}</p>
            </div>
          </div>
        </div>
      `;
      row.appendChild(col);
    });

    // Render pagination controls with the current page, total pages, and keyword
    renderPaginationControls(currentPage, totalPages, keyword, category);
  } catch (error) {
    console.error("Error populating search results:", error);
  }
}

// Render pagination controls
function renderPaginationControls(currentPage, totalPages, keyword, category) {
  const paginationContainer = document.querySelector('.pagination-container');
  paginationContainer.innerHTML = ''; // Clear existing pagination controls

  if (totalPages > 1) { // Only show pagination if there is more than one page
    for (let page = 1; page <= totalPages; page++) {
      const button = document.createElement("button");
      button.classList.add("pagination-button", "btn", "btn-primary", "m-1");
      button.textContent = page;

      // Set active class for the current page button
      if (page === currentPage) {
        button.classList.add("active"); // Apply active styling
        button.disabled = true; // Disable the current page button
      } else {
        button.disabled = false; // Enable other page buttons
      }

      button.addEventListener("click", () => {
        console.log(`Button clicked for page: ${page}`); // Log the page button click
        populateSearchResults(keyword, page, 6, category); // Fetch selected page with category
      });

      paginationContainer.appendChild(button);
    }
  }
}