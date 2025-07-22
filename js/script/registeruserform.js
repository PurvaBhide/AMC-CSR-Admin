document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("userForm");
  const submitBtn = document.querySelector("#userForm button[type='submit']");

  // Create message container if not present
  let responseMessage = document.getElementById("responseMessage");
  if (!responseMessage) {
    responseMessage = document.createElement("div");
    responseMessage.id = "responseMessage";
    responseMessage.style.marginTop = "10px";
    form.appendChild(responseMessage);
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Collect form data
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const organizationname = document.getElementById("organizationname").value.trim();
    const departmentname = document.getElementById("departmentname").value.trim();
    const role = document.getElementById("role").value.trim();
    const phonenumber = document.getElementById("phonenumber").value.trim();
    const password = document.getElementById("password").value.trim();
    const confirmPassword = document.getElementById("confirmPassword").value.trim();

    // Validation
    if (!name || !email || !organizationname || !departmentname || !role || !phonenumber || !password || !confirmPassword) {
      showMessage("❌ All fields are required.", "text-danger");
      return;
    }

    if (password !== confirmPassword) {
      showMessage("❌ Password and Confirm Password do not match.", "text-danger");
      return;
    }

    const payload = {
      name,
      email,
      password,
      role,
      organizationname,
      departmentname,
      phonenumber,
    };

    // Disable submit button during request
    submitBtn.disabled = true;
    showMessage("⏳ Registering user...", "text-info");

    try {
      const response = await fetch("https://mumbailocal.org:8087/registeruser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok && result.status === 200) {
        showMessage("✅ " + result.message, "text-success");

        form.reset();
         setTimeout(() => {
        window.location.href = "users.html";
    }, 1000);
      } else if (result.status === 400 && result.message === "Email already registered") {
        showMessage("❌ Email already registered.", "text-danger");
      } else {
        showMessage("❌ " + (result.message || "Failed to register user."), "text-danger");
      }
    } catch (error) {
      console.error("Error:", error);
      showMessage("❌ Something went wrong.", "text-danger");
    } finally {
      submitBtn.disabled = false;
    }
  });

  function showMessage(msg, className) {
    responseMessage.textContent = msg;
    responseMessage.className = className;
  }
});


// Show/Hide Password
document.getElementById("togglePassword").addEventListener("click", function () {
  const passwordField = document.getElementById("password");
  const icon = this.querySelector("i");
  if (passwordField.type === "password") {
    passwordField.type = "text";
    icon.classList.remove("fa-eye");
    icon.classList.add("fa-eye-slash");
  } else {
    passwordField.type = "password";
    icon.classList.remove("fa-eye-slash");
    icon.classList.add("fa-eye");
  }
});

// Show/Hide Confirm Password
document.getElementById("toggleConfirmPassword").addEventListener("click", function () {
  const confirmPasswordField = document.getElementById("confirmPassword");
  const icon = this.querySelector("i");
  if (confirmPasswordField.type === "password") {
    confirmPasswordField.type = "text";
    icon.classList.remove("fa-eye");
    icon.classList.add("fa-eye-slash");
  } else {
    confirmPasswordField.type = "password";
    icon.classList.remove("fa-eye-slash");
    icon.classList.add("fa-eye");
  }
});
