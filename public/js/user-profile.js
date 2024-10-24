// user-profile.js
document.addEventListener("DOMContentLoaded", function () {
  // Handle edit button click with correct class
  const editBtn = document.querySelector(".btn-edit");
  console.log(editBtn);
  if (editBtn) {
    editBtn.addEventListener("click", function () {
      window.location.href = "./edit-profile.html";
    });
  }

  // Load navbar
  fetch("navbar.html")
    .then((response) => response.text())
    .then((data) => {
      document.getElementById("navbar-placeholder").innerHTML = data;
    });

  // Load footer
  fetch("footer.html")
    .then((response) => response.text())
    .then((data) => {
      document.getElementById("footer-placeholder").innerHTML = data;
    });

  // Handle profile picture click/hover effects
  const profilePic = document.querySelector(".profile-picture");
  if (profilePic) {
    profilePic.addEventListener("mouseenter", function () {
      this.style.opacity = "0.8";
    });
    profilePic.addEventListener("mouseleave", function () {
      this.style.opacity = "1";
    });
  }

  // Handle programme card hover effects
  const programmeCards = document.querySelectorAll(".programme-card");
  programmeCards.forEach((card) => {
    card.addEventListener("mouseenter", function () {
      this.style.transform = "translateY(-5px)";
      this.style.boxShadow = "0 4px 15px rgba(0,0,0,0.1)";
    });
    card.addEventListener("mouseleave", function () {
      this.style.transform = "translateY(0)";
      this.style.boxShadow = "0 2px 10px rgba(0,0,0,0.1)";
    });
  });
});
