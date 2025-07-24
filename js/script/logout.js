// // logout.js

// document.addEventListener("DOMContentLoaded", function () {
//   // Redirect to login page if no user is logged in
//   const userData = localStorage.getItem("userData");
//   if (!userData) {
//     window.location.href = "login.html"; // Adjust path as needed
//     return;
//   }

//   // Logout functionality
//   const logoutButton = document.querySelector(".logout-button");

//   if (logoutButton) {
//     logoutButton.addEventListener("click", function (e) {
//       e.preventDefault();

//       // Clear specific localStorage items
//       localStorage.removeItem("userData");
//       localStorage.removeItem("oglevel");

//       // Optional: Clear all storage
//       // localStorage.clear();
//       // sessionStorage.clear();

//       // Redirect to login
//       window.location.href = "login.html";
//     });
//   }
// });
document.addEventListener("DOMContentLoaded", function () {
  // Redirect to login page if no user is logged in
  const userData = localStorage.getItem("userData");
  if (!userData) {
    window.location.href = "login.html";
    return;
  }

  // Logout functionality
  const logoutButton = document.querySelector(".logout-button");
  if (logoutButton) {
    logoutButton.addEventListener("click", function (e) {
      e.preventDefault();
      localStorage.removeItem("userData");
      localStorage.removeItem("oglevel");
      window.location.href = "login.html";
    });
  }

  // === Helper to show or remove error messages ===
  function showError(input, message) {
    const oldError = input.parentElement.querySelector(".phone-error");
    if (oldError) oldError.remove();

    const error = document.createElement("div");
    error.className = "phone-error text-danger mt-1";
    error.style.fontSize = "0.875rem";
    error.innerText = message;
    input.parentElement.appendChild(error);
  }

  function removeError(input) {
    const oldError = input.parentElement.querySelector(".phone-error");
    if (oldError) oldError.remove();
  }

  // === Enhanced Phone Number Validation ===
  const validatePhoneNumber = (input) => {
    const phoneNumber = input.value.trim();

    removeError(input);

    if (phoneNumber.length !== 10) {
      showError(input, "Phone number must be exactly 10 digits");
      return false;
    }

    const indianMobilePattern = /^[6-9]\d{9}$/;
    if (!indianMobilePattern.test(phoneNumber)) {
      showError(input, "Enter valid Indian mobile number starting with 6-9");
      return false;
    }

    if (/^(\d)\1{9}$/.test(phoneNumber)) {
      showError(input, "Repeated digits are not allowed");
      return false;
    }

    return true;
  };

  // === Centralized Form Validation ===
  const forms = document.querySelectorAll("form");

  forms.forEach(form => {
    form.addEventListener("submit", function (e) {
      let isValid = true;

      // Email validation
      const emailField = form.querySelector("input[type='email'], input[name='email']");
      if (emailField) {
        const email = emailField.value.trim();
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (email && !emailPattern.test(email)) {
          alert("Please enter a valid email address.");
          e.preventDefault();
          emailField.focus();
          isValid = false;
          return;
        }
      }

      // Phone number validation
      const phoneInputs = form.querySelectorAll(
        "input[id*='phone'], input[id*='mobile'], input[id*='editPhone'], input[name*='phone'], input[name*='mobile'], input[name*='editPhone']"
      );
      phoneInputs.forEach(input => {
        const isFieldValid = validatePhoneNumber(input);
        if (!isFieldValid) {
          isValid = false;
        }
      });

      if (!isValid) {
        e.preventDefault();
      }
    });
  });

  // === Real-time input restrictions and blur validation ===
  const allPhoneInputs = document.querySelectorAll(
  "input[id*='phone'], input[id*='mobile'], input[id*='editPhone'], input[id*='participantMobileNumber'], input[name*='phone'], input[name*='mobile'], input[name*='editPhone']"
);

  allPhoneInputs.forEach(input => {
    input.addEventListener("input", function () {
      this.value = this.value.replace(/\D/g, '');
      if (this.value.length > 10) {
        this.value = this.value.slice(0, 10);
      }
      removeError(this);
    });

    input.addEventListener("blur", function () {
      if (this.value.length > 0) {
        validatePhoneNumber(this);
      }
    });
  });
});
