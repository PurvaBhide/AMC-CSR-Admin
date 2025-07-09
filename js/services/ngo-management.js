// ngo-management.js

document.addEventListener("DOMContentLoaded", function () {
  loadNGOs();
});

let currentPage = 0;
const pageSize = 10;

function loadNGOs(page = 0) {
  currentPage = page;

  if (!Api.ngo || typeof Api.ngo.listAll !== 'function') {
    console.error("Api.ngo.listAll() is not available");
    return;
  }

  Api.ngo.listAll(page, pageSize)
    .then((response) => {
      const ngos = response.data.content;
      const totalPages = response.data.totalPages;
      renderNGOTable(ngos);
      renderPagination(totalPages);
    })
    .catch((error) => {
      console.error("Error loading NGOs:", error);
    });
}

function renderNGOTable(ngos) {
  const tbody = document.querySelector("tbody.table-border-bottom-0");
  tbody.innerHTML = "";

  ngos.forEach((ngo, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${index + 1 + currentPage * pageSize}</td>
      <td>${ngo.organizationName}</td>
      <td>${ngo.emailId}</td>
      <td>${ngo.contactNumber}</td>
      <td>${ngo.nameOfContactPerson}</td>
      <td>${ngo.ageOfOrganization} yrs</td>
      <td>₹${Number(ngo.annualTurnover).toLocaleString()}</td>
      <td>${ngo.category?.categoryName || '-'}</td>
      <td>${ngo.status}</td>
      <td>
        <div class="dropdown">
          <button class="btn p-0" type="button" data-bs-toggle="dropdown">
            <i class="bx bx-dots-vertical-rounded"></i>
          </button>
          <ul class="dropdown-menu">
            <li>
              <a class="dropdown-item" href="ngo-form.html?id=${ngo.id}">
                <i class="bx bx-edit me-1"></i> Edit
              </a>
            </li>
            <li>
              <a class="dropdown-item" href="javascript:void(0);" onclick="deleteNGO(${ngo.id})">
                <i class="bx bx-trash me-1"></i> Delete
              </a>
            </li>
          </ul>
        </div>
      </td>
    `;
    tbody.appendChild(row);
  });
}

function renderPagination(totalPages) {
  const paginationUl = document.querySelector(".pagination");
  paginationUl.innerHTML = "";

  const prevDisabled = currentPage === 0 ? "disabled" : "";
  paginationUl.innerHTML += `
    <li class="page-item ${prevDisabled}">
      <a class="page-link" href="javascript:void(0);" onclick="loadNGOs(${currentPage - 1})">
        <i class="tf-icon bx bx-chevron-left"></i>
      </a>
    </li>
  `;

  for (let i = 0; i < totalPages; i++) {
    paginationUl.innerHTML += `
      <li class="page-item ${currentPage === i ? 'active' : ''}">
        <a class="page-link" href="javascript:void(0);" onclick="loadNGOs(${i})">${i + 1}</a>
      </li>
    `;
  }

  const nextDisabled = currentPage === totalPages - 1 ? "disabled" : "";
  paginationUl.innerHTML += `
    <li class="page-item ${nextDisabled}">
      <a class="page-link" href="javascript:void(0);" onclick="loadNGOs(${currentPage + 1})">
        <i class="tf-icon bx bx-chevron-right"></i>
      </a>
    </li>
  `;
}

function deleteNGO(id) {
  const confirmDelete = confirm("Are you sure you want to delete this NGO?");
  if (!confirmDelete) return;

  Api.ngo.delete(id)
    .then(() => {
      alert("NGO deleted successfully.");
      loadNGOs();
    })
    .catch((error) => {
      console.error("Failed to delete NGO:", error);
      alert("Failed to delete NGO. Please try again.");
    });
}
