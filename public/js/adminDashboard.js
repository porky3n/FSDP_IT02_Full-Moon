// Initialize dashboard when document is ready
document.addEventListener("DOMContentLoaded", function () {
  initializeDashboard();
  // Refresh dashboard data every 5 minutes
  setInterval(initializeDashboard, 300000);
});

async function initializeDashboard() {
  try {
    const metrics = await fetchDashboardMetrics();
    renderDashboard(metrics);
  } catch (error) {
    console.error("Error initializing dashboard:", error);
    showError("Failed to load dashboard data");
  }
}

// Fetch metrics from the server
async function fetchDashboardMetrics() {
  try {
    const response = await fetch("/api/admin/dashboard-metrics", {
      method: "GET",
      credentials: "include", // Important!
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching metrics:", error);
    throw error;
  }
}

// Main function to render the dashboard
function renderDashboard(metrics) {
  const mainContent = document.querySelector("main");
  const currentDate = new Date();
  const monthYear = currentDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  mainContent.innerHTML = `
        <div class="container py-4">
            <!-- Dashboard Header -->
            <div class="row mb-4">
                <div class="col">
                    <h1 class="display-5 fw-bold">Dashboard</h1>
                    <div class="text-muted">Overview of your business metrics</div>
                </div>
            </div>

            <!-- Summary Cards -->
            <div class="row g-4 mb-4">
                ${renderSummaryCards(metrics)}
            </div>

            <!-- Revenue Chart -->
            <div class="row mb-4">
                <div class="col-12">
                    <div class="card">
                        <div class="card-header d-flex justify-content-between align-items-center">
                            <h5 class="card-title mb-0">Monthly Revenue</h5>
                            <span class="text-muted">${monthYear}</span>
                        </div>
                        <div class="card-body">
                            <canvas id="revenueChart" height="300"></canvas>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Rest of the dashboard content remains the same -->
            <div class="row g-4">
                <div class="col-md-6 col-lg-4">
                    ${renderTopSpendersCard(metrics.topSpenders)}
                </div>
                <div class="col-md-6 col-lg-4">
                    ${renderActiveParticipantsCard(metrics.activeParticipants)}
                </div>
                <div class="col-md-6 col-lg-4">
                    ${renderPopularProgrammesCard(metrics.popularProgrammes)}
                </div>
            </div>
            <div class="row mt-4">
                <div class="col-12">
                    ${renderProgrammeRatingsCard(metrics.ratings)}
                </div>
            </div>
        </div>
    `;

  // Initialize the revenue chart
  initializeRevenueChart(metrics.monthlyRevenue);
}

// Render summary cards at the top of the dashboard
function renderSummaryCards(metrics) {
  const totalRevenue = metrics.monthlyRevenue.reduce(
    (sum, day) => sum + parseFloat(day.Revenue || 0),
    0
  );
  const totalParticipants = metrics.activeParticipants.reduce(
    (sum, participant) => sum + parseInt(participant.ProgrammeCount),
    0
  );
  const averageRating =
    metrics.ratings.reduce(
      (sum, prog) => sum + parseFloat(prog.AverageRating),
      0
    ) / metrics.ratings.length;

  return `
        <div class="col-sm-6 col-lg-3">
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title mb-4">Total Revenue</h5>
                    <h2 class="mt-2 mb-0">$${totalRevenue.toLocaleString()}</h2>
                </div>
            </div>
        </div>
        <div class="col-sm-6 col-lg-3">
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title mb-4">Total Participants</h5>
                    <h2 class="mt-2 mb-0">${totalParticipants}</h2>
                </div>
            </div>
        </div>
        <div class="col-sm-6 col-lg-3">
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title mb-4">Average Rating</h5>
                    <h2 class="mt-2 mb-0">${averageRating.toFixed(1)}/5.0</h2>
                </div>
            </div>
        </div>
        <div class="col-sm-6 col-lg-3">
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title mb-4">Total Programs</h5>
                    <h2 class="mt-2 mb-0">${
                      metrics.popularProgrammes.length
                    }</h2>
                </div>
            </div>
        </div>
    `;
}

// Render top spenders card
function renderTopSpendersCard(spenders) {
  const spendersList = spenders
    .map(
      (spender) => `
        <div class="d-flex justify-content-between align-items-center mb-3">
            <span>${spender.FullName}</span>
            <span class="badge bg-success">$${parseFloat(
              spender.TotalSpent
            ).toLocaleString()}</span>
        </div>
    `
    )
    .join("");

  return `
        <div class="card h-100">
            <div class="card-header">
                <h5 class="card-title mb-0">Top Spenders</h5>
            </div>
            <div class="card-body">
                ${spendersList}
            </div>
        </div>
    `;
}

// Render active participants card
function renderActiveParticipantsCard(participants) {
  const participantsList = participants
    .map(
      (participant) => `
        <div class="d-flex justify-content-between align-items-center mb-3">
            <span>${participant.FullName}</span>
            <span class="badge bg-primary">${participant.ProgrammeCount} programs</span>
        </div>
    `
    )
    .join("");

  return `
        <div class="card h-100">
            <div class="card-header">
                <h5 class="card-title mb-0">Most Active Participants</h5>
            </div>
            <div class="card-body">
                ${participantsList}
            </div>
        </div>
    `;
}

// Render popular programmes card
function renderPopularProgrammesCard(programmes) {
  const programmesList = programmes
    .map(
      (programme) => `
        <div class="d-flex justify-content-between align-items-center mb-3">
            <span>${programme.ProgrammeName}</span>
            <span class="badge bg-info">${programme.EnrollmentCount} enrolled</span>
        </div>
    `
    )
    .join("");

  return `
        <div class="card h-100">
            <div class="card-header">
                <h5 class="card-title mb-0">Popular Programmes</h5>
            </div>
            <div class="card-body">
                ${programmesList}
            </div>
        </div>
    `;
}

// Render programme ratings card
function renderProgrammeRatingsCard(ratings) {
  console.log("Ratings data:", ratings); // Debug log
  if (!Array.isArray(ratings)) {
    console.error("Ratings is not an array:", ratings);
    return '<div class="card"><div class="card-body">No ratings data available</div></div>';
  }
  const ratingsList = ratings
    .map((programme) => {
      // Convert AverageRating to number and handle null/undefined
      const rating = parseFloat(programme.AverageRating) || 0;

      return `
          <div class="col-md-6 col-lg-4 mb-3">
              <div class="card h-100">
                  <div class="card-body">
                      <h6 class="card-title">${programme.ProgrammeName}</h6>
                      <div class="mb-2">
                          ${renderStarRating(rating)}
                      </div>
                      <small class="text-muted">${
                        programme.ReviewCount
                      } reviews</small>
                  </div>
              </div>
          </div>
        `;
    })
    .join("");

  return `
          <div class="card">
              <div class="card-header">
                  <h5 class="card-title mb-0">Programme Ratings</h5>
              </div>
              <div class="card-body">
                  <div class="row">
                      ${ratingsList}
                  </div>
              </div>
          </div>
      `;
}

// Helper function to render star ratings
function renderStarRating(rating) {
  // Convert rating to number and handle null/undefined cases
  const numericRating = parseFloat(rating) || 0;

  const fullStars = Math.floor(numericRating);
  const hasHalfStar = numericRating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return `
          ${'<i class="fas fa-star text-warning"></i>'.repeat(fullStars)}
          ${
            hasHalfStar
              ? '<i class="fas fa-star-half-alt text-warning"></i>'
              : ""
          }
          ${'<i class="far fa-star text-warning"></i>'.repeat(emptyStars)}
          <span class="ms-2">${numericRating.toFixed(1)}</span>
      `;
}

// Initialize revenue chart using Chart.js
function initializeRevenueChart(revenueData) {
  const ctx = document.getElementById("revenueChart").getContext("2d");

  // Create an array of dates for the current month
  const currentDate = new Date();
  const firstDay = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  );
  const lastDay = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  );

  // Format the data with proper date handling
  const formattedData = [];
  let currentDay = new Date(firstDay);

  while (currentDay <= lastDay) {
    // Format both dates to YYYY-MM-DD for comparison
    const currentDateStr = currentDay.toISOString().slice(0, 10);

    // Find matching data by comparing dates without time
    const matchingData = revenueData.find((item) => {
      const itemDate = new Date(item.Date);
      return itemDate.toISOString().slice(0, 10) === currentDateStr;
    });

    formattedData.push({
      date: new Date(currentDay),
      revenue: matchingData ? parseFloat(matchingData.Revenue) : 0,
    });

    currentDay.setDate(currentDay.getDate() + 1);
  }

  new Chart(ctx, {
    type: "line",
    data: {
      labels: formattedData.map((item) => item.date.getDate()),
      datasets: [
        {
          label: "Daily Revenue",
          data: formattedData.map((item) => item.revenue),
          borderColor: "#0d6efd",
          tension: 0.3,
          fill: false,
          pointRadius: 4,
          pointHoverRadius: 6,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          title: {
            display: true,
            text: "Day of Month",
          },
          grid: {
            display: false,
          },
        },
        y: {
          beginAtZero: true,
          ticks: {
            callback: function (value) {
              return "$" + value.toLocaleString();
            },
          },
        },
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              return "Revenue: $" + context.raw.toLocaleString();
            },
          },
        },
      },
    },
  });
}

// Show error message
function showError(message) {
  const mainContent = document.querySelector("main");
  mainContent.innerHTML = `
        <div class="container py-4">
            <div class="alert alert-danger" role="alert">
                ${message}
            </div>
        </div>
    `;
}
