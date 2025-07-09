// project-management.js

document.addEventListener("DOMContentLoaded", function () {
  loadfundanideas();
});

let currentPage = 0;
const pageSize = 10;

function loadfundanideas(page = 0) {
  currentPage = page;

   fundanideaSrevices.listAll(page, pageSize)
    .then((response) => {
        console.log(response,"response");
      const fundanideas = response.data.content;
      const totalPages = response.data.totalPages;
      renderfundanideasTable(fundanideas);
      renderPagination(totalPages);
    })
    .catch((error) => {
      console.error("Error loading fundanideas:", error);
    });
}


function renderfundanideasTable(fundanideas) {
  const tbody = document.querySelector("tbody.table-border-bottom-0");
  tbody.innerHTML = ""; // Clear existing rows

  fundanideas.forEach((fundanideas, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
     <td>${index + 1 + currentPage * pageSize}</td>

      <td>${fundanideas.fundanideaprojectname}</td>
      <td>${fundanideas.fundanideadepartment}</td>
      <td>${fundanideas.fundanideacontactpersonname}</td>
      <td>${fundanideas.fundanideaestimateamount}</td>
      <td>${fundanideas.fundanideastatus || '-'}</td>
      
      <td>
        <div class="dropdown">
          <button class="btn p-0" type="button" data-bs-toggle="dropdown">
            <i class="bx bx-dots-vertical-rounded"></i>
          </button>
          <ul class="dropdown-menu">
            <li><a class="dropdown-item" href="fund-an-idea-form.html?id=${fundanideas.fundanideaid}">
              <i class="bx bx-edit me-1"></i> Edit</a></li>
            <li><a class="dropdown-item" href="javascript:void(0);" onclick="deleteFundAnIdea(${fundanideas.fundanideaid})">
              <i class="bx bx-trash me-1"></i> Delete</a></li>
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

  // Previous Button
  const prevDisabled = currentPage === 0 ? "disabled" : "";
  paginationUl.innerHTML += `
    <li class="page-item ${prevDisabled}">
      <a class="page-link" href="javascript:void(0);" onclick="loadfundanideas(${currentPage - 1})">
        <i class="tf-icon bx bx-chevron-left"></i>
      </a>
    </li>
  `;

  // Page Numbers
  for (let i = 0; i < totalPages; i++) {
    paginationUl.innerHTML += `
      <li class="page-item ${currentPage === i ? 'active' : ''}">
        <a class="page-link" href="javascript:void(0);" onclick="loadfundanideas(${i})">${i + 1}</a>
      </li>
    `;
  }

  // Next Button
  const nextDisabled = currentPage === totalPages - 1 ? "disabled" : "";
  paginationUl.innerHTML += `
    <li class="page-item ${nextDisabled}">
      <a class="page-link" href="javascript:void(0);" onclick="loadfundanideas(${currentPage + 1})">
        <i class="tf-icon bx bx-chevron-right"></i>
      </a>
    </li>
  `;
}

function deleteFundAnIdea(id) {
  const confirmDelete = confirm("Are you sure you want to delete this fund an idea?");
  if (!confirmDelete) return;

  fundanideaSrevices.delete(id)
    .then(() => {
      alert("Fund an idea deleted successfully.");
      loadfundanideas(); 
    })
    .catch((error) => {
      console.error("Failed to delete fund an idea:", error);
      alert("Failed to delete fund an idea. Please try again.");
    });
}
