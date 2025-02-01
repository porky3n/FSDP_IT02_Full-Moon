document.addEventListener("DOMContentLoaded", function () {
  const googleSignInButton = document.querySelector(".btn-google");

  googleSignInButton.addEventListener("click", function (e) {
      e.preventDefault();
      googleSignInButton.disabled = true;
      googleSignInButton.textContent = "Redirecting to Google...";
      window.location.href = "/auth/google";
  });
});
