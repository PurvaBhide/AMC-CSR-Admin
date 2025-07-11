document.addEventListener("DOMContentLoaded", function () {
  loadProjects();
  setupFilterListeners();
  loadCategoryOptions(); // This will populate the category dropdown
  loadNgoOptions();     // This will populate the NGO dropdown

  // Add event listener for the Clear Filters button if you have one
  const clearFiltersButton = document.getElementById("clearFiltersButton");
  if (clearFiltersButton) {
    clearFiltersButton.addEventListener("click", clearFilters);
  }
});

// Store filtered projects for client-side pagination
let allFilteredProjects = [];
let currentPage = 0;
const pageSize = 10;
let lastFilterString = '';

function setupFilterListeners() {
  const filters = [
    "categoryFilter",
    "ngoFilter",
    "budgetFilter",
    "statusFilter"
  ];

  filters.forEach(filterId => {
    const element = document.getElementById(filterId);
    if (element) {
      element.addEventListener("change", (e) => {
        console.log(`${filterId} changed to:`, e.target.value);
        currentPage = 0; // Reset to first page on filter change
        loadProjects();
      });
    }
  });
}

function getFilterParams() {
  const params = new URLSearchParams();

  // Category filter
  const categoryEl = document.getElementById("categoryFilter");
  if (categoryEl && categoryEl.value && categoryEl.value !== "") {
    params.append('categoryId', categoryEl.value);
  }

  // NGO filter
  const ngoEl = document.getElementById("ngoFilter");
  if (ngoEl && ngoEl.value && ngoEl.value !== "") {
    params.append('ngoId', ngoEl.value);
  }

  // Budget filter
  const budgetEl = document.getElementById("budgetFilter");
  if (budgetEl && budgetEl.value && budgetEl.value !== "") {
    params.append('projectBudget', budgetEl.value);
  }

  // Status filter (assuming you have this element in your UI)
  const statusEl = document.getElementById("statusFilter");
  if (statusEl && statusEl.value && statusEl.value !== "") {
    params.append('status', statusEl.value);
  }

  return params.toString();
}

function loadProjects() {
  const filterParams = getFilterParams();

  // Only refetch if filters have changed
  if (filterParams !== lastFilterString) {
    lastFilterString = filterParams;

    if (filterParams) {
      console.log("Fetching with filters:", filterParams);
      // Fetch filtered projects
      fetch(`https://mumbailocal.org:8087/projects/filter?${filterParams}`)
        .then(response => {
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          return response.json();
        })
        .then(apiResponse => {
          // The API response for filtered projects seems to have a 'data' array
          allFilteredProjects = apiResponse.data || []; // Ensure it's an array
          paginateFilteredResults();
        })
        .catch(error => {
          console.error("Filter error:", error);
          showError("Error loading filtered projects");
        });
    } else {
      // Fetch all projects with server-side pagination
      Api.project.listAll(currentPage, pageSize)
        .then(response => {
          // Assuming Api.project.listAll also returns { data: { content: [...] } }
          renderProjectsTable(response.data.content);
          renderPagination(response.data.totalPages);
        })
        .catch(error => {
          console.error("API error:", error);
          showError("Error loading projects");
        });
    }
  } else {
    // Filters unchanged, just repaginate
    if (filterParams) {
      paginateFilteredResults();
    } else {
      // Re-fetch for server-side pagination if no filters are applied but page changes
      Api.project.listAll(currentPage, pageSize)
        .then(response => {
          renderProjectsTable(response.data.content);
          renderPagination(response.data.totalPages);
        })
        .catch(showError);
    }
  }
}

function paginateFilteredResults() {
  const startIndex = currentPage * pageSize;
  const paginated = allFilteredProjects.slice(startIndex, startIndex + pageSize);
  const totalPages = Math.ceil(allFilteredProjects.length / pageSize);

  renderProjectsTable(paginated);
  renderPagination(totalPages);
}

function renderProjectsTable(projects) {
  const tbody = document.querySelector("tbody.table-border-bottom-0");
  if (!tbody) {
    console.error("Table body not found. Make sure you have <tbody class=\"table-border-bottom-0\"> in your HTML.");
    return;
  }

  if (!projects?.length) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center py-4">No projects found</td></tr>`;
    return;
  }

  tbody.innerHTML = projects.map((project, i) => `
    <tr>
      <td>${i + 1 + currentPage * pageSize}</td>
      <td>${escapeHTML(project.projectName)}</td>
      <td>${Number(project.projectBudget).toLocaleString('en-IN')}</td>
      <td>${escapeHTML(project.categoryName || '-')}</td>
      <td>${escapeHTML(project.ngoInfo?.ngoname || '-')}</td>
      <td>${escapeHTML(project.projectDEpartmentName || '-')}</td>
      <td>
        <div class="dropdown">
          <button class="btn p-0" type="button" data-bs-toggle="dropdown">
            <i class="bx bx-dots-vertical-rounded"></i>
          </button>
          <ul class="dropdown-menu">
            <li>
              <a class="dropdown-item" href="project-form.html?id=${project.projectId}">
                <i class="bx bx-edit me-1"></i> Edit
              </a>
            </li>
            <li>
              <a class="dropdown-item" href="javascript:void(0);"
                  onclick="deleteProject(${project.projectId})">
                <i class="bx bx-trash me-1"></i> Delete
              </a>
            </li>
          </ul>
        </div>
      </td>
    </tr>
  `).join('');
}

function renderPagination(totalPages) {
  const pagination = document.querySelector(".pagination");
  if (!pagination) {
     console.error("Pagination container not found. Make sure you have <ul class=\"pagination\"> in your HTML.");
     return;
  }
  if (totalPages <= 1) {
    pagination.innerHTML = '';
    return;
  }

  let html = `
    <li class="page-item ${currentPage === 0 ? 'disabled' : ''}">
      <a class="page-link" href="javascript:void(0);"
          onclick="changePage(${currentPage - 1})">
        <i class="tf-icon bx bx-chevron-left"></i>
      </a>
    </li>
  `;

  const startPage = Math.max(0, currentPage - 2);
  const endPage = Math.min(totalPages - 1, currentPage + 2);

  for (let i = startPage; i <= endPage; i++) {
    html += `
      <li class="page-item ${currentPage === i ? 'active' : ''}">
        <a class="page-link" href="javascript:void(0);"
            onclick="changePage(${i})">${i + 1}</a>
      </li>
    `;
  }

  html += `
    <li class="page-item ${currentPage >= totalPages - 1 ? 'disabled' : ''}">
      <a class="page-link" href="javascript:void(0);"
          onclick="changePage(${currentPage + 1})">
        <i class="tf-icon bx bx-chevron-right"></i>
      </a>
    </li>
  `;

  pagination.innerHTML = html;
}

function changePage(newPage) {
  if (newPage < 0) return;
  const totalPages = allFilteredProjects.length > 0
                       ? Math.ceil(allFilteredProjects.length / pageSize)
                       : Infinity;

  if (newPage >= totalPages && totalPages !== Infinity) return;

  currentPage = newPage;
  loadProjects();
  window.scrollTo(0, 0);
}

function showError(message) {
  const tbody = document.querySelector("tbody.table-border-bottom-0");
  if (tbody) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center py-4 text-danger">
          ${message}
        </td>
      </tr>
    `;
  }
}

function escapeHTML(str) {
  if (typeof str !== 'string' && typeof str !== 'number') return '';
  str = String(str);
  return str.replace(/[&<>"']/g,
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[tag]));
}

function loadCategoryOptions() {
  Api.category.listAll()
    .then((res) => {
      console.log("Category API Response:", res);
      const select = document.getElementById("categoryFilter");
      if (!select) {
        console.error("Category filter element with ID 'categoryFilter' not found in HTML.");
        return;
      }

      select.innerHTML = '<option value="">All Categories</option>';

      // Access the array of categories from res.data
      const categories = res.data || [];

      if (Array.isArray(categories)) {
        categories.forEach(cat => {
          // 🚨 FIX: Your API returns 'id' for category ID, not 'categoryId'.
          if (cat.id !== undefined && cat.categoryName !== undefined) {
            const option = document.createElement("option");
            option.value = cat.id; // Corrected: use cat.id
            option.textContent = cat.categoryName;
            select.appendChild(option);
          } else {
            console.warn("Category object missing 'id' or 'categoryName':", cat);
          }
        });
      } else {
        console.error("Category API response 'data' is not an array as expected:", res.data);
      }
    })
    .catch(error => {
      console.error("Error loading category options:", error);
    });
}

function loadNgoOptions() {
  Api.ngo.listAll()
    .then((res) => {
      console.log("NGO API Response:", res);
      const select = document.getElementById("ngoFilter");
      if (!select) {
        console.error("NGO filter element with ID 'ngoFilter' not found in HTML.");
        return;
      }

      select.innerHTML = '<option value="">All NGOs</option>';

      // 🚨 FIX: Your NGO API response wraps the array in 'data.content'.
      // Assume each item in 'content' is an NGO object with 'id' and 'organizationName'.
      const ngos = res.data?.content || [];

      if (Array.isArray(ngos)) {
        ngos.forEach(ngo => {
          // Assuming NGO objects have 'id' and 'organizationName' directly.
          if (ngo.id !== undefined && ngo.organizationName !== undefined) {
            const option = document.createElement("option");
            option.value = ngo.id;
            option.textContent = ngo.organizationName;
            select.appendChild(option);
          } else {
            console.warn("NGO object missing 'id' or 'organizationName':", ngo);
          }
        });
      } else {
        console.error("NGO API response 'data.content' is not an array as expected:", res.data);
      }
    })
    .catch(error => {
      console.error("Error loading NGO options:", error);
    });
}

// Clear filters function
function clearFilters() {
  const categoryFilter = document.getElementById("categoryFilter");
  if (categoryFilter) categoryFilter.value = "";

  const ngoFilter = document.getElementById("ngoFilter");
  if (ngoFilter) ngoFilter.value = "";

  const budgetFilter = document.getElementById("budgetFilter");
  if (budgetFilter) budgetFilter.value = "";

  const statusFilter = document.getElementById("statusFilter");
  if (statusFilter) statusFilter.value = "";

  currentPage = 0;
  lastFilterString = '';
  allFilteredProjects = [];
  loadProjects();
}