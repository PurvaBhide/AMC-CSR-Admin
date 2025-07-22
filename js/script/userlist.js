// API endpoint to get all users
const API_URL = "https://mumbailocal.org:8087/users";
let usersList = [];

// Load Users and populate table
async function loadUsers() {
  try {
    const response = await fetch(API_URL);
    const result = await response.json();

    const tableBody = document.getElementById("userTableBody");
    tableBody.innerHTML = ""; // Clear table

    if (response.ok && result.status === 200 && Array.isArray(result.data)) {
      usersList = result.data.map(normalizeUser); // Store users
      usersList.forEach((user, index) => {
        const row = `
          <tr>
            <td>${index + 1}</td>
            <td>${user.name}</td>
            <td>${user.organizationname}</td>
            <td>${user.departmentname}</td>
            <td>${user.email}</td>
            <td>${user.phonenumber}</td>
            <td>
              <div class="dropdown">
                <button class="btn p-0" type="button" data-bs-toggle="dropdown">
                  <i class="bx bx-dots-vertical-rounded"></i>
                </button>
                <ul class="dropdown-menu">
                  <li>
                    <a class="dropdown-item" href="javascript:void(0);" onclick="openEditModal(${user.id})">
                      <i class="bx bx-edit me-1"></i> Edit
                    </a>
                  </li>
                  <li>
                    <a class="dropdown-item" href="javascript:void(0);" onclick="deleteUser(${user.id})">
                      <i class="bx bx-trash me-1"></i> Delete
                    </a>
                  </li>
                </ul>
              </div>
            </td>
          </tr>
        `;
        tableBody.innerHTML += row;
      });
    } else {
      tableBody.innerHTML = `<tr><td colspan="7" class="text-center">No users found</td></tr>`;
    }
  } catch (error) {
    console.error("Error loading users:", error);
    document.getElementById("userTableBody").innerHTML =
      `<tr><td colspan="7" class="text-center text-danger">Failed to load data</td></tr>`;
  }
}

// Normalize user data
function normalizeUser(u) {
  return {
    id: u.id ?? u.userId ?? null,
    name: u.name ?? "",
    email: u.email ?? "",
    password: u.password ?? "",
    organizationname: u.organizationname ?? "",
    departmentname: u.departmentname ?? "",
    phonenumber: u.phonenumber ?? "",
    role: (u.role || "").toUpperCase()
  };
}

// Delete user
async function deleteUser(id) {
  if (!confirm("Are you sure you want to delete this user?")) return;

  try {
    const response = await fetch(`https://mumbailocal.org:8087/user/${id}`, { method: "DELETE" });
    const result = await response.json();

    if (response.ok && result.status === 200) {
      alert("User deleted successfully!");
      loadUsers(); // Reload the table
    } else {
      alert("Failed to delete user: " + result.message);
    }
  } catch (error) {
    console.error("Error deleting user:", error);
    alert("Error deleting user.");
  }
}

// Open Edit Modal with Data
function openEditModal(userId) {
  const user = usersList.find(u => u.id == userId);
  if (!user) {
    console.error("User not found for ID:", userId);
    return;
  }

  // Fill modal fields
  document.getElementById("editUserId").value = user.id ?? "";
  document.getElementById("editName").value = user.name ?? "";
  document.getElementById("editEmail").value = user.email ?? "";
  document.getElementById("editPassword").value = user.password ?? "";
  document.getElementById("editOrganization").value = user.organizationname ?? "";
  document.getElementById("editDepartment").value = user.departmentname ?? "";
  document.getElementById("editPhone").value = user.phonenumber ?? "";
  document.getElementById("editRole").value = user.role ?? "";

  // Show modal
  const modal = new bootstrap.Modal(document.getElementById("editUserModal"));
  modal.show();
}

// Update User
document.getElementById("updateUserBtn").addEventListener("click", async () => {
  const id = document.getElementById("editUserId").value;
  const payload = {
    name: document.getElementById("editName").value.trim(),
    email: document.getElementById("editEmail").value.trim(),
    password: document.getElementById("editPassword").value.trim(),
    organizationname: document.getElementById("editOrganization").value.trim(),
    departmentname: document.getElementById("editDepartment").value.trim(),
    phonenumber: document.getElementById("editPhone").value.trim(),
    role: document.getElementById("editRole").value
  };

  try {
    const response = await fetch(`https://mumbailocal.org:8087/user/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (response.ok && result.status === 200) {
      alert("User updated successfully!");
      bootstrap.Modal.getInstance(document.getElementById("editUserModal")).hide();
      loadUsers(); // Refresh the table
    } else {
      alert("Failed to update user: " + result.message);
    }
  } catch (error) {
    console.error("Error updating user:", error);
    alert("Error updating user.");
  }
});

// Call function when page loads
document.addEventListener("DOMContentLoaded", loadUsers);


function togglePassword(inputId, toggleBtnId) {
  const input = document.getElementById(inputId);
  const toggleBtn = document.getElementById(toggleBtnId);

  toggleBtn.addEventListener("click", () => {
    if (input.type === "password") {
      input.type = "text";
      toggleBtn.innerHTML = '<i class="fa fa-eye-slash"></i>'; // Change icon
    } else {
      input.type = "password";
      toggleBtn.innerHTML = '<i class="fa fa-eye"></i>'; // Change back
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  togglePassword("editPassword", "editTogglePassword");
  togglePassword("editConfirmPassword", "editToggleConfirmPassword");
});


























// // API endpoint to get all users
// const API_URL = "https://mumbailocal.org:8087/users"; // Change this to your API endpoint

// async function loadUsers() {
//   try {
//     const response = await fetch(API_URL);
//     const result = await response.json();

//     const tableBody = document.getElementById("userTableBody");
//     tableBody.innerHTML = ""; // Clear table

//     if (response.ok && result.status === 200 && result.data) {
//       result.data.forEach((user, index) => {
//         const row = `
//           <tr>
//             <td>${index + 1}</td>
//             <td>${user.name}</td>
//             <td>${user.organizationname}</td>
//             <td>${user.departmentname}</td>
//             <td>${user.email}</td>
//             <td>${user.phonenumber}</td>
//             <td>
//               <div class="dropdown">
//                 <button class="btn p-0" type="button" data-bs-toggle="dropdown">
//                   <i class="bx bx-dots-vertical-rounded"></i>
//                 </button>
//                 <ul class="dropdown-menu">
//                   <li>
//                     <a class="dropdown-item" href="registeruser-form.html?id=${user.id}">
//                       <i class="bx bx-edit me-1"></i> Edit
//                     </a>
//                   </li>
//                   <li>
//                     <a class="dropdown-item" href="javascript:void(0);" onclick="deleteUser(${user.id})">
//                       <i class="bx bx-trash me-1"></i> Delete
//                     </a>
//                   </li>
//                 </ul>
//               </div>
//             </td>
//           </tr>
//         `;
//         tableBody.innerHTML += row;
//       });
//     } else {
//       tableBody.innerHTML = `<tr><td colspan="7" class="text-center">No users found</td></tr>`;
//     }
//   } catch (error) {
//     console.error("Error loading users:", error);
//     document.getElementById("userTableBody").innerHTML =
//       `<tr><td colspan="7" class="text-center text-danger">Failed to load data</td></tr>`;
//   }
// }


// async function deleteUser(id) {
//   if (!confirm("Are you sure you want to delete this user?")) return;

//   try {
//     const response = await fetch(`https://mumbailocal.org:8087/user/${id}`, { method: "DELETE" });
//     const result = await response.json();

//     if (response.ok && result.status === 200) {
//       alert("User deleted successfully!");
//       loadUsers(); // Reload the table
//     } else {
//       alert("Failed to delete user: " + result.message);
//     }
//   } catch (error) {
//     console.error("Error deleting user:", error);
//     alert("Error deleting user.");
//   }
// }
// // Call function when page loads
// document.addEventListener("DOMContentLoaded", loadUsers);
