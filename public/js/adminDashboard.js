// Initialize dashboard when document is ready
document.addEventListener("DOMContentLoaded", function () {
  initializeDashboard();
  // Refresh dashboard data every 5 minutes
  setInterval(initializeDashboard, 300000);
});

async function initializeDashboard(selectedMonth = new Date().getMonth()) {
  try {
    const metrics = await fetchDashboardMetrics(selectedMonth);
    renderDashboard(metrics, selectedMonth);
  } catch (error) {
    console.error("Error initializing dashboard:", error);
    showError("Failed to load dashboard data");
  }
}

// Fetch metrics from the server with month parameter
async function fetchDashboardMetrics(month) {
  try {
    const response = await fetch(
      `/api/admin/dashboard-metrics?month=${month}&includeTotal=true`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

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
function renderDashboard(metrics, selectedMonth) {
  const mainContent = document.querySelector("main");

  // Create a safe date object with the correct selected month
  const date = new Date(new Date().getFullYear(), selectedMonth, 1); // Use day 1 to avoid overflow
  const monthYear = date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  // Calculate total revenue for the selected month
  const totalMonthlyRevenue = metrics.monthlyRevenue.reduce(
    (sum, day) => sum + parseFloat(day.Revenue || 0),
    0
  );

  console.log("Monthly Revenue Data:", metrics.monthlyRevenue); // Debug log
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
            <div class="card-header">
              <div class="d-flex justify-content-between align-items-center">
                <h5 class="card-title mb-0">Monthly Revenue</h5>
                <div class="d-flex align-items-center">
                  <span class="text-muted me-3">Revenue in ${monthYear}: $${totalMonthlyRevenue.toLocaleString()}</span>
                  <div class="dropdown">
                    <button class="btn btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false" id="monthDropdown">
                      ${monthYear}
                    </button>
                    <ul class="dropdown-menu dropdown-menu-end">
                      ${renderMonthOptions(selectedMonth)}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            <div class="card-body">
              <canvas id="revenueChart" height="300"></canvas>
            </div>
          </div>
        </div>
      </div>

            <!-- Rest of the dashboard content -->
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
  initializeRevenueChart(metrics.monthlyRevenue, selectedMonth);

  // Add event listeners for month selection
  addMonthSelectionListeners();
}

// Function to render month options
function renderMonthOptions(selectedMonth) {
  const months = [];

  // Generate month names directly using the correct month indices (0-11)
  for (let i = 0; i < 12; i++) {
    const monthDate = new Date(new Date().getFullYear(), i, 1); // Use day 1 to avoid overflow issues
    months.push({
      index: i, // Zero-based index for consistency
      name: monthDate.toLocaleDateString("en-US", { month: "long" }),
    });
  }

  return months
    .map(
      (month) => `
        <li>
            <button class="dropdown-item ${
              month.index === selectedMonth ? "active" : ""
            }" 
               type="button"
               data-month="${month.index}">
                ${month.name}
            </button>
        </li>
    `
    )
    .join("");
}

// Function to add month selection listeners
function addMonthSelectionListeners() {
  const monthItems = document.querySelectorAll(".dropdown-item");
  monthItems.forEach((item) => {
    item.addEventListener("click", async (e) => {
      e.preventDefault();
      const button = e.target.closest(".dropdown-item");
      if (!button) return;

      const selectedMonth = parseInt(button.dataset.month);

      // Get the month name and year
      const date = new Date();
      date.setMonth(selectedMonth);
      const monthYear = date.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });

      // Update all month displays immediately
      document.querySelector("#monthDropdown").textContent = monthYear;
      const revenueText = document.querySelector(".text-muted.me-3");
      if (revenueText) {
        revenueText.textContent = `Revenue in ${monthYear}: $0`; // Will be updated when data loads
      }

      // Then initialize dashboard with selected month
      await initializeDashboard(selectedMonth);
    });
  });
}

// Render summary cards at the top of the dashboard
function renderSummaryCards(metrics) {
  // Check if totalRevenue exists and has data
  console.log("Total Revenue Data:", metrics.totalRevenue); // Debug log

  // Calculate total revenue from all payments
  const totalRevenue =
    metrics.totalRevenue && metrics.totalRevenue[0]
      ? parseFloat(metrics.totalRevenue[0].TotalRevenue || 0)
      : 0;

  const totalParticipants = metrics.activeParticipants.reduce(
    (sum, participant) => sum + parseInt(participant.ProgrammeCount),
    0
  );
  const averageRating =
    metrics.ratings.length > 0
      ? metrics.ratings.reduce(
          (sum, prog) => sum + parseFloat(prog.AverageRating || 0),
          0
        ) / metrics.ratings.length
      : 0;
  const membershipCounts = metrics.membershipCounts.reduce(
    (acc, item) => {
      acc[item.Membership] = parseInt(item.MemberCount);
      return acc;
    },
    {
      Gold: 0,
      Silver: 0,
      Bronze: 0,
      "Non-Membership": 0,
    }
  );

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
        <div class="col-sm-6 col-lg-3">
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title mb-4">Membership Status Count</h5>
                    <div class="membership-counts">
                        <div class="d-flex justify-content-between mb-2">
                            <span class="text-gold">Gold Members</span>
                            <span>${membershipCounts["Gold"]}</span>
                        </div>
                        <div class="d-flex justify-content-between mb-2">
                            <span class="text-silver">Silver Members</span>
                            <span>${membershipCounts["Silver"]}</span>
                        </div>
                        <div class="d-flex justify-content-between mb-2">
                            <span class="text-bronze">Bronze Members</span>
                            <span>${membershipCounts["Bronze"]}</span>
                        </div>
                        <div class="d-flex justify-content-between">
                            <span class="text-muted">Non-Member</span>
                            <span>${membershipCounts["Non-Membership"]}</span>
                        </div>
                    </div>
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
function initializeRevenueChart(revenueData, selectedMonth) {
  const ctx = document.getElementById("revenueChart").getContext("2d");

  // Use the explicitly passed selectedMonth for date calculations
  const date = new Date();
  date.setMonth(selectedMonth);

  const firstDay = new Date(date.getFullYear(), selectedMonth, 1);
  const lastDay = new Date(date.getFullYear(), selectedMonth + 1, 0);

  // Format the data with proper date handling
  const formattedData = [];
  let currentDay = new Date(firstDay);

  while (currentDay <= lastDay) {
    const currentDateStr = currentDay.toISOString().slice(0, 10);

    // Find matching data
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

  // Create the chart with the properly formatted data
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
              const date = formattedData[context.dataIndex].date;
              return `Revenue on ${date.toLocaleDateString()}: $${context.raw.toLocaleString()}`;
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
