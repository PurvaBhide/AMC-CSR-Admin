document.addEventListener("DOMContentLoaded", function () {
  loadNGOs();
  setupSearch();
});

let currentPage = 0;
const pageSize = 10;
let allNGOs = [];
let filteredNGOs = [];

function setupSearch() {
  const searchInput = document.getElementById("ngoSearchInput");

  if (!searchInput) {
    console.warn("Search input not found.");
    return;
  }

  let debounceTimer;
  searchInput.addEventListener("input", function () {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      const query = this.value.trim().toLowerCase();
      applySearch(query);
    }, 300);
  });
}

function applySearch(query) {
  if (!query) {
    filteredNGOs = [...allNGOs];
  } else {
    filteredNGOs = allNGOs.filter(ngo => {
      return (
        ngo.organizationName?.toLowerCase().includes(query) ||
        ngo.nameOfContactPerson?.toLowerCase().includes(query) ||
        ngo.emailId?.toLowerCase().includes(query) ||
        ngo.contactNumber?.toLowerCase().includes(query) ||
        ngo.category?.categoryName?.toLowerCase().includes(query) ||
        ngo.status?.toLowerCase().includes(query)
      );
    });
  }
  currentPage = 0;
  renderNGOTable(filteredNGOs.slice(0, pageSize));
  renderPagination(Math.ceil(filteredNGOs.length / pageSize));
}

function loadNGOs() {
  if (!Api.ngo || typeof Api.ngo.listAll !== "function") {
    console.error("Api.ngo.listAll() is not available");
    return;
  }

  // Fetching more records for full list (you can change 1000 to suitable number)
  Api.ngo.listAll(0, 1000)
    .then((response) => {
      allNGOs = response.data.content || [];
      filteredNGOs = [...allNGOs]; // Initial full list
      renderNGOTable(filteredNGOs.slice(0, pageSize));
      renderPagination(Math.ceil(filteredNGOs.length / pageSize));
    })
    .catch((error) => {
      console.error("Error loading NGOs:", error);
    });
}

function renderNGOTable(ngos) {
  const tbody = document.querySelector("tbody.table-border-bottom-0");
  tbody.innerHTML = "";

  if (!ngos.length) {
    tbody.innerHTML = `<tr><td colspan="10" class="text-center text-muted">No NGOs found.</td></tr>`;
    return;
  }

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
      <td>${ngo.status || '-'}</td>
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

  if (totalPages <= 1) return;

  const prevDisabled = currentPage === 0 ? "disabled" : "";
  paginationUl.innerHTML += `
    <li class="page-item ${prevDisabled}">
      <a class="page-link" href="javascript:void(0);" onclick="goToPage(${currentPage - 1})">
        <i class="tf-icon bx bx-chevron-left"></i>
      </a>
    </li>
  `;

  for (let i = 0; i < totalPages; i++) {
    paginationUl.innerHTML += `
      <li class="page-item ${currentPage === i ? "active" : ""}">
        <a class="page-link" href="javascript:void(0);" onclick="goToPage(${i})">${i + 1}</a>
      </li>
    `;
  }

  const nextDisabled = currentPage === totalPages - 1 ? "disabled" : "";
  paginationUl.innerHTML += `
    <li class="page-item ${nextDisabled}">
      <a class="page-link" href="javascript:void(0);" onclick="goToPage(${currentPage + 1})">
        <i class="tf-icon bx bx-chevron-right"></i>
      </a>
    </li>
  `;
}

function goToPage(page) {
  currentPage = page;
  const start = page * pageSize;
  const end = start + pageSize;
  renderNGOTable(filteredNGOs.slice(start, end));
  renderPagination(Math.ceil(filteredNGOs.length / pageSize));
}

function deleteNGO(id) {
  const confirmDelete = confirm("Are you sure you want to delete this NGO?");
  if (!confirmDelete) return;

  fetch(`https://mumbailocal.org:8087/deleteNgo/${id}`, {
    method: 'DELETE',
  })
  .then(response => {
    if (response.ok) {
      alert("NGO deleted successfully");
    
      window.location.reload(); // or update specific elements
    } else {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  })
  .catch(error => {
    console.error('Error deleting NGO:', error);
    alert("Failed to delete NGO. Please try again.");
  });
}