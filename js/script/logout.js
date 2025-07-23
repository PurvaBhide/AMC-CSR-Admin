// logout.js

document.addEventListener("DOMContentLoaded", function () {
  // Redirect to login page if no user is logged in
  const userData = localStorage.getItem("userData");
  if (!userData) {
    window.location.href = "login.html"; // Adjust path as needed
    return;
  }

  // Logout functionality
  const logoutButton = document.querySelector(".logout-button");

  if (logoutButton) {
    logoutButton.addEventListener("click", function (e) {
      e.preventDefault();

      // Clear specific localStorage items
      localStorage.removeItem("userData");
      localStorage.removeItem("oglevel");

      // Optional: Clear all storage
      // localStorage.clear();
      // sessionStorage.clear();

      // Redirect to login
      window.location.href = "login.html";
    });
  }
});
