document.addEventListener('DOMContentLoaded', function () {
  // Fetch user data from localStorage
  const departmentName = localStorage.getItem('departmentName') || 'Department Name';
  const role = localStorage.getItem('role') || 'Role';

  console.log(departmentName,"departmentNamedepartmentName");


  // Select the container to update
  const userInfoContainer = document.querySelector('#userInfoContainer');

  if (userInfoContainer) {
    userInfoContainer.innerHTML = `
      <h6 class="mb-0">${departmentName}</h6>
      <small class="text-muted">${role}</small>
    `;
  } else {
    console.error("User info container not found!");
  }
});
