document.addEventListener('DOMContentLoaded', function () {

 const userDataStr = localStorage.getItem("userData");

            if (!userDataStr) {
                console.warn("No user data in localStorage.");
                return;
            }

            const userData = JSON.parse(userDataStr);

  const departmentName = userData.user.departmentname|| 'Department Name';
  const name = userData.user.name || 'Admin User';

  const role =  userData.user.role || 'SUPERADMIN';




  // Select the container to update
  const userInfoContainer = document.querySelector('#userInfoContainer');

  if (userInfoContainer) {
    userInfoContainer.innerHTML = `
      <h6 class="mb-0">${role}</h6>
      <small class="text-muted">${name}</small>
    `;
  } else {
    console.error("User info container not found!");
  }
});
