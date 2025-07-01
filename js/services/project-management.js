// project-management.js

document.addEventListener("DOMContentLoaded", function () {
  loadProjects();
});

function loadProjects() {
  if (!Api.project || typeof Api.project.listAll !== 'function') {
    console.error("Api.project.listAll() is not available");
    return;
  }

  Api.project.listAll()
    .then((response) => {
      const projects = response.data.content;
      renderProjectsTable(projects);
    })
    .catch((error) => {
      console.error("Error loading projects:", error);
    });
}

function renderProjectsTable(projects) {
  const tbody = document.querySelector("tbody.table-border-bottom-0");
  tbody.innerHTML = ""; // Clear existing rows

  projects.forEach((project, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
     <td>${index + 1}</td>
      <td>${project.projectName}</td>
      <td>${Number(project.projectBudget).toLocaleString()}</td>
      <td>${project.categoryName}</td>
      <td>${project.ngoInfo?.ngoname || '-'}</td>
      <td>${project.projectDEpartmentName || '-'}</td>
      <td>
        <div class="dropdown">
          <button class="btn p-0" type="button" data-bs-toggle="dropdown">
            <i class="bx bx-dots-vertical-rounded"></i>
          </button>
          <ul class="dropdown-menu">
            <li><a class="dropdown-item" href="project-form.html?id=${project.projectId}">
              <i class="bx bx-edit me-1"></i> Edit</a></li>
            <li><a class="dropdown-item" href="javascript:void(0);" onclick="deleteProject(${project.projectId})">
              <i class="bx bx-trash me-1"></i> Delete</a></li>
          </ul>
        </div>
      </td>
    `;
    tbody.appendChild(row);
  });
}

function deleteProject(id) {
  const confirmDelete = confirm("Are you sure you want to delete this project?");
  if (!confirmDelete) return;

  Api.project.delete(id)
    .then(() => {
      alert("Project deleted successfully.");
      loadProjects(); // Reload the table
    })
    .catch((error) => {
      console.error("Failed to delete project:", error);
      alert("Failed to delete project. Please try again.");
    });
}
