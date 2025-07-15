// resources-management.js

document.addEventListener("DOMContentLoaded", function () {
  loadResources();

  const docTypeSelect = document.getElementById("documentTypeFilter");
  docTypeSelect.addEventListener("change", function () {
    const type = this.value;
    loadResources(type);
  });
});

let currentPage = 0;
const pageSize = 10;

function loadResources(documentType = "", page = 0) {
  currentPage = page;
  const endpoint = documentType ? `/documents/${encodeURIComponent(documentType)}` : "/listalldocuments";

  Api.document.getByType(endpoint, page, pageSize)
    .then((response) => {
      const documents = response.data?.content || [];
      const totalPages = response.data?.totalPages || 1;

      renderResourcesTable(documents);
      renderPagination(totalPages, documentType);
    })
    .catch((error) => {
      console.error("Error loading documents:", error);
      const statusCode = error?.details?.status || error?.status;
      const errorMessage = error?.details?.message || "Failed to load documents.";

      if (statusCode === 404) {
        showError("No documents found for the selected type.");
      } else {
        showError(errorMessage);
      }
    });
}


function renderResourcesTable(documents) {
  const tbody = document.querySelector("tbody.table-border-bottom-0");
  tbody.innerHTML = "";

  if (documents.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" class="text-center py-4 text-danger">No documents found.</td></tr>`;
    return;
  }

  documents.forEach((doc, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${doc.documenttitle}</td>
      <td><a href="${doc.documenturl}" target="_blank">View File</a></td>
      <td>
        <div class="dropdown">
          <button class="btn p-0" type="button" data-bs-toggle="dropdown">
            <i class="bx bx-dots-vertical-rounded"></i>
          </button>
          <ul class="dropdown-menu">
            <li><a class="dropdown-item" href="resources.html?id=${doc.id}"><i class="bx bx-edit me-1"></i>Edit</a></li>
            <li><a class="dropdown-item" href="javascript:void(0);" onclick="deleteResource(${doc.id})"><i class="bx bx-trash me-1"></i>Delete</a></li>
          </ul>
        </div>
      </td>
    `;
    tbody.appendChild(row);
  });
}

function deleteResource(id) {
  const confirmDelete = confirm("Are you sure you want to delete this resource?");
  if (!confirmDelete) return;

  Api.document.delete(id)
    .then(() => {
      alert("Document deleted successfully.");
      loadResources();
    })
    .catch((error) => {
      console.error("Failed to delete resource:", error);
      alert("Failed to delete resource. Please try again.");
    });
}

function showError(message) {
  const tbody = document.querySelector("tbody.table-border-bottom-0");
  tbody.innerHTML = `<tr><td colspan="4" class="text-center py-4 text-danger">${message}</td></tr>`;
}

function renderPagination(totalPages, documentType) {
  const paginationContainer = document.querySelector(".pagination");
  if (!paginationContainer) return;

  paginationContainer.innerHTML = "";

  const prevDisabled = currentPage === 0 ? "disabled" : "";
  paginationContainer.innerHTML += `
    <li class="page-item ${prevDisabled}">
      <a class="page-link" href="javascript:void(0);" onclick="loadResources('${documentType}', ${currentPage - 1})">
        <i class="tf-icon bx bx-chevron-left"></i>
      </a>
    </li>`;

  for (let i = 0; i < totalPages; i++) {
    paginationContainer.innerHTML += `
      <li class="page-item ${currentPage === i ? 'active' : ''}">
        <a class="page-link" href="javascript:void(0);" onclick="loadResources('${documentType}', ${i})">${i + 1}</a>
      </li>`;
  }

  const nextDisabled = currentPage === totalPages - 1 ? "disabled" : "";
  paginationContainer.innerHTML += `
    <li class="page-item ${nextDisabled}">
      <a class="page-link" href="javascript:void(0);" onclick="loadResources('${documentType}', ${currentPage + 1})">
        <i class="tf-icon bx bx-chevron-right"></i>
      </a>
    </li>`;
}
