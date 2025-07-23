document.addEventListener("DOMContentLoaded", function () {
  loadProjects();
  setupFilterListeners();
  loadCategoryOptions();
  loadNgoOptions();

  const clearFiltersButton = document.getElementById("clearFiltersButton");
  if (clearFiltersButton) {
    clearFiltersButton.addEventListener("click", clearFilters);
  }
});

// Global variables for filtering and pagination
let allFilteredProjects = [];
let allProjects = []; // Store all projects for client-side filtering
let currentPage = 0;
const pageSize = 10;
let lastFilterString = '';
let useClientSideFiltering = false; // Flag to determine filtering method
let serverPaginationInfo = null;

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
        console.log(`🔄 ${filterId} changed to:`, e.target.value);
        currentPage = 0; // Reset to first page on filter change
        loadProjects();
      });
    }
  });
}

function getFilterParams() {
  const params = new URLSearchParams();
  const filters = {};

  // Category filter
  const categoryEl = document.getElementById("categoryFilter");
  if (categoryEl && categoryEl.value && categoryEl.value !== "") {
    params.append('categoryId', categoryEl.value);
    filters.categoryId = categoryEl.value;
  }

  // NGO filter
  const ngoEl = document.getElementById("ngoFilter");
  if (ngoEl && ngoEl.value && ngoEl.value !== "") {
    params.append('ngoId', ngoEl.value);
    filters.ngoId = ngoEl.value;
  }

  // Budget filter with detailed logging
  const budgetEl = document.getElementById("budgetFilter");
  if (budgetEl && budgetEl.value && budgetEl.value !== "") {
    const budgetRange = budgetEl.value;
    console.log("💰 Selected budget range:", budgetRange);
    
    const [minBudget, maxBudget] = budgetRange.split('-');
    
    if (minBudget) {
      params.append('minBudget', minBudget);
      filters.minBudget = parseInt(minBudget);
      console.log("📊 Min budget:", minBudget);
    }
    
    if (maxBudget && maxBudget !== 'undefined' && maxBudget !== '') {
      params.append('maxBudget', maxBudget);
      filters.maxBudget = parseInt(maxBudget);
      console.log("📊 Max budget:", maxBudget);
    } else {
      filters.maxBudget = Infinity;
    }
  }

  // Status filter
  const statusEl = document.getElementById("statusFilter");
  if (statusEl && statusEl.value && statusEl.value !== "") {
    params.append('status', statusEl.value);
    filters.status = statusEl.value;
  }

  // Store current filters globally for client-side filtering
  window.currentFilters = filters;
  
  return params.toString();
}

// async function loadProjects() {
//   const filterParams = getFilterParams();
//   console.log("🚀 Loading projects with filters:", filterParams);

//   // Only refetch if filters have changed, not for pagination
//   if (filterParams !== lastFilterString) {
//     lastFilterString = filterParams;
    
//     // Try server-side filtering first
//     if (filterParams) {
//       await attemptServerSideFiltering(filterParams);
//     } else {
//       await loadAllProjects();
//     }
//   } else {
//     // Filters unchanged, handle pagination appropriately
//     if (useClientSideFiltering) {
//       console.log("🔄 Client-side pagination - no API call needed");
//       paginateFilteredResults();
//     } else if (filterParams) {
//       console.log("🔄 Server-side filtered pagination - no API call needed");
//       paginateFilteredResults();
//     } else {
//       console.log("🌐 Server-side pagination - making API call");
//       await loadAllProjects();
//     }
//   }
// }

// async function attemptServerSideFiltering(filterParams) {
//   try {
//     console.log("🌐 Attempting server-side filtering...");
    
//     const response = await fetch(`https://mumbailocal.org:8087/projects/filter?${filterParams}`);
    
//     if (!response.ok) {
//       throw new Error(`HTTP ${response.status}: ${response.statusText}`);
//     }
    
//     const apiResponse = await response.json();
//     console.log("📦 Server response:", apiResponse);
    
//     let projects = apiResponse.data || [];
//     console.log(`📊 Server returned ${projects.length} projects`);
    
//     // Validate server-side budget filtering
//     if (window.currentFilters.minBudget !== undefined || window.currentFilters.maxBudget !== undefined) {
//       const isServerFilteringCorrect = validateBudgetFiltering(projects);
      
//       if (!isServerFilteringCorrect) {
//         console.warn("⚠️ Server-side budget filtering appears incorrect, falling back to client-side");
//         await fallbackToClientSideFiltering();
//         return;
//       }
//     }
    
//     // Server filtering worked correctly
//     useClientSideFiltering = false;
//     allFilteredProjects = projects;
//     currentPage = 0;
//     paginateFilteredResults();
    
//   } catch (error) {
//     console.error("❌ Server-side filtering failed:", error);
//     console.log("🔄 Falling back to client-side filtering...");
//     await fallbackToClientSideFiltering();
//   }
// }

async function loadProjects() {
  const filterParams = getFilterParams();
  console.log("🚀 Loading projects with filters:", filterParams);

  // Reset server pagination info when filters change
  if (filterParams !== lastFilterString) {
    lastFilterString = filterParams;
    serverPaginationInfo = null; // Reset pagination info on filter change
    currentPage = 0; // Reset to first page on filter change
    
    // Try server-side filtering first
    if (filterParams) {
      await attemptServerSideFiltering(filterParams);
    } else {
      await loadAllProjects();
    }
  } else {
    // Filters unchanged, handle pagination appropriately
    if (useClientSideFiltering) {
      console.log("🔄 Client-side pagination - no API call needed");
      paginateFilteredResults();
    } else if (filterParams) {
      console.log("🌐 Server-side filtered pagination - making API call for page", currentPage + 1);
      await attemptServerSideFiltering(filterParams);
    } else {
      console.log("🌐 Server-side pagination - making API call");
      await loadAllProjects();
    }
  }
}

async function attemptServerSideFiltering(filterParams) {
  try {
    console.log("🌐 Attempting server-side filtering...");
    
    // Include pagination parameters in the request
    const paginatedParams = `${filterParams}&page=${currentPage}&size=${pageSize}`;
    const response = await fetch(`https://mumbailocal.org:8087/projects/filter?${paginatedParams}`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const apiResponse = await response.json();
    console.log("📦 Server response:", apiResponse);
    
    let projects = apiResponse.data || [];
    console.log(`📊 Server returned ${projects.length} projects`);
    
    // Validate server-side budget filtering (only check if budget filter is applied)
    if (window.currentFilters.minBudget !== undefined || window.currentFilters.maxBudget !== undefined) {
      const isServerFilteringCorrect = validateBudgetFiltering(projects);
      
      if (!isServerFilteringCorrect) {
        console.warn("⚠️ Server-side budget filtering appears incorrect, falling back to client-side");
        await fallbackToClientSideFiltering();
        return;
      }
    }
    
    // Server filtering worked correctly - store pagination info
    useClientSideFiltering = false;
    serverPaginationInfo = {
      totalItems: apiResponse.totalItems || 0,
      totalPages: apiResponse.totalPages || 1,
      currentPage: apiResponse.currentPage || 0,
      pageSize: apiResponse.pageSize || pageSize
    };
    
    console.log(`📄 Server pagination info:`, serverPaginationInfo);
    
    // Render current page results
    renderProjectsTable(projects);
    renderServerSidePagination();
    
  } catch (error) {
    console.error("❌ Server-side filtering failed:", error);
    console.log("🔄 Falling back to client-side filtering...");
    await fallbackToClientSideFiltering();
  }
}
function renderServerSidePagination() {
  if (!serverPaginationInfo) {
    console.error("❌ No server pagination info available");
    return;
  }
  
  const { totalPages, currentPage: serverCurrentPage } = serverPaginationInfo;
  
  // Sync our local currentPage with server's currentPage
  currentPage = serverCurrentPage;
  
  console.log(`🔢 Rendering server-side pagination: ${totalPages} total pages, current page: ${currentPage + 1}`);
  
  renderPagination(totalPages);
}

function validateBudgetFiltering(projects) {
  if (!window.currentFilters.minBudget && !window.currentFilters.maxBudget) {
    return true; // No budget filter applied
  }
  
  const { minBudget = 0, maxBudget = Infinity } = window.currentFilters;
  
  // Check if any project is outside the budget range
  const invalidProjects = projects.filter(project => {
    const budget = parseFloat(project.projectBudget) || 0;
    return budget < minBudget || budget > maxBudget;
  });
  
  if (invalidProjects.length > 0) {
    console.log("❌ Found projects outside budget range:", invalidProjects.map(p => ({
      name: p.projectName,
      budget: p.projectBudget,
      expected: `₹${minBudget.toLocaleString()} - ₹${maxBudget.toLocaleString()}`
    })));
    return false;
  }
  
  return true;
}

async function fallbackToClientSideFiltering() {
  try {
    useClientSideFiltering = true;
    
    // Load all projects if not already loaded
    if (allProjects.length === 0) {
      console.log("📥 Loading all projects for client-side filtering...");
      await loadAllProjectsForFiltering();
    }
    
    // Apply client-side filters
    applyClientSideFilters();
    
  } catch (error) {
    console.error("❌ Client-side filtering fallback failed:", error);
    showError("Error loading projects. Please try again.");
  }
}

async function loadAllProjectsForFiltering() {
  try {
    // Load all projects without pagination
    const response = await Api.project.listAll(0, 10000); // Large page size to get all
    allProjects = response.data.content || [];
    console.log(`📚 Loaded ${allProjects.length} total projects for client-side filtering`);
  } catch (error) {
    console.error("❌ Failed to load all projects:", error);
    throw error;
  }
}

function applyClientSideFilters() {
  console.log("🔧 Applying client-side filters...");
  
  let filteredProjects = [...allProjects];
  const filters = window.currentFilters || {};
  
  // Apply category filter
  if (filters.categoryId) {
    filteredProjects = filteredProjects.filter(project => 
      project.categoryId == filters.categoryId
    );
    console.log(`🏷️ Category filter applied: ${filteredProjects.length} projects remain`);
  }
  
  // Apply NGO filter
  if (filters.ngoId) {
    filteredProjects = filteredProjects.filter(project => 
      project.ngoInfo?.id == filters.ngoId
    );
    console.log(`🏢 NGO filter applied: ${filteredProjects.length} projects remain`);
  }
  
  // Apply budget filter
  if (filters.minBudget !== undefined || filters.maxBudget !== undefined) {
    const minBudget = filters.minBudget || 0;
    const maxBudget = filters.maxBudget || Infinity;
    
    const beforeBudgetFilter = filteredProjects.length;
    filteredProjects = filteredProjects.filter(project => {
      const budget = parseFloat(project.projectBudget) || 0;
      return budget >= minBudget && budget <= maxBudget;
    });
    
    console.log(`💰 Budget filter applied (₹${minBudget.toLocaleString()} - ₹${maxBudget.toLocaleString()}): ${beforeBudgetFilter} → ${filteredProjects.length} projects`);
  }
  
  // Apply status filter
  if (filters.status) {
    filteredProjects = filteredProjects.filter(project => 
      project.status === filters.status
    );
    console.log(`📊 Status filter applied: ${filteredProjects.length} projects remain`);
  }
  
  allFilteredProjects = filteredProjects;
  currentPage = 0;
  paginateFilteredResults();
}

async function loadAllProjects() {
  try {
    useClientSideFiltering = false;
    console.log("📋 Loading all projects (no filters)");
    
    const response = await Api.project.listAll(currentPage, pageSize);
    renderProjectsTable(response.data.content);
    renderPagination(response.data.totalPages);
    
  } catch (error) {
    console.error("❌ Error loading all projects:", error);
    showError("Error loading projects");
  }
}

// function paginateFilteredResults() {
//   const startIndex = currentPage * pageSize;
//   const endIndex = startIndex + pageSize;
//   const paginated = allFilteredProjects.slice(startIndex, endIndex);
//   const totalPages = Math.ceil(allFilteredProjects.length / pageSize);

//   console.log(`📄 Pagination: Page ${currentPage + 1}/${totalPages}, showing ${paginated.length} projects (${startIndex + 1}-${Math.min(endIndex, allFilteredProjects.length)} of ${allFilteredProjects.length})`);

//   renderProjectsTable(paginated);
//   renderPagination(totalPages);
// }
function paginateFilteredResults() {
  const startIndex = currentPage * pageSize;
  const endIndex = startIndex + pageSize;
  const paginated = allFilteredProjects.slice(startIndex, endIndex);
  const totalPages = Math.ceil(allFilteredProjects.length / pageSize);

  console.log(`📄 Client-side Pagination: Page ${currentPage + 1}/${totalPages}, showing ${paginated.length} projects (${startIndex + 1}-${Math.min(endIndex, allFilteredProjects.length)} of ${allFilteredProjects.length})`);

  renderProjectsTable(paginated);
  renderPagination(totalPages);
}

// Update clearFilters to reset server pagination info
function clearFilters() {
  console.log("🧹 Clearing all filters");
  
  // Clear all filter elements
  const filterElements = ['categoryFilter', 'ngoFilter', 'budgetFilter', 'statusFilter'];
  filterElements.forEach(id => {
    const element = document.getElementById(id);
    if (element) element.value = "";
  });

  // Reset state
  currentPage = 0;
  lastFilterString = '';
  allFilteredProjects = [];
  window.currentFilters = {};
  useClientSideFiltering = false;
  serverPaginationInfo = null; // Reset server pagination info
  
  // Reload projects
  loadProjects();
}
function renderProjectsTable(projects) {
  const tbody = document.querySelector("tbody.table-border-bottom-0");
  if (!tbody) {
    console.error("❌ Table body not found");
    return;
  }

  if (!projects?.length) {
    const filterInfo = window.currentFilters && Object.keys(window.currentFilters).length > 0 
      ? `<br><small class="text-muted">Active filters: ${getActiveFiltersText()}</small>`
      : '';
    
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center py-4">
          <i class="bx bx-search me-2"></i>
          No projects found matching the selected criteria
          ${filterInfo}
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = projects.map((project, i) => {
    const budget = parseFloat(project.projectBudget) || 0;
    const budgetFormatted = budget.toLocaleString('en-IN');
    
    // Highlight budget if budget filter is active
    const budgetClass = (window.currentFilters?.minBudget !== undefined || window.currentFilters?.maxBudget !== undefined) 
      ? 'bg-success-subtle fw-bold' : '';
    
    return `
      <tr data-project-id="${project.projectId}">
        <td>${i + 1 + currentPage * pageSize}</td>
        <td>${escapeHTML(project.projectName?.split(/\s+/).slice(0, 5).join(' ') + (project.projectName?.split(/\s+/).length > 5 ? '...' : ''))}</td>
        <td class="${budgetClass}">₹${budgetFormatted}</td>
        <td>${escapeHTML(project.categoryName || '-')}</td>
        <td>${escapeHTML(project.ngoInfo?.ngoname || project.ngoInfo?.organizationName || '-')}</td>
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
                    onclick="deleteProject(${project.projectId}, '${escapeHTML(project.projectName)}')">
                  <i class="bx bx-trash me-1"></i> Delete
                </a>
              </li>
            </ul>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function getActiveFiltersText() {
  const filters = window.currentFilters || {};
  const activeFilters = [];
  
  if (filters.categoryId) activeFilters.push('Category');
  if (filters.ngoId) activeFilters.push('NGO');
  if (filters.minBudget !== undefined || filters.maxBudget !== undefined) {
    const min = filters.minBudget || 0;
    const max = filters.maxBudget === Infinity ? '∞' : filters.maxBudget?.toLocaleString();
    activeFilters.push(`Budget (₹${min.toLocaleString()} - ₹${max})`);
  }
  if (filters.status) activeFilters.push('Status');
  
  return activeFilters.join(', ');
}

function renderPagination(totalPages) {
  const pagination = document.querySelector(".pagination");
  if (!pagination) {
    console.error("❌ Pagination container not found");
    return;
  }
  
  if (totalPages <= 1) {
    pagination.innerHTML = '';
    return;
  }

  console.log(`🔢 Rendering pagination: ${totalPages} total pages, current page: ${currentPage + 1}`);

  let html = `
    <li class="page-item ${currentPage === 0 ? 'disabled' : ''}">
      <a class="page-link" href="javascript:void(0);" onclick="changePage(${currentPage - 1})" aria-label="Previous">
        <i class="tf-icon bx bx-chevron-left"></i>
      </a>
    </li>
  `;

  // Calculate page range to show
  const maxPagesToShow = 5;
  let startPage = Math.max(0, currentPage - Math.floor(maxPagesToShow / 2));
  let endPage = Math.min(totalPages - 1, startPage + maxPagesToShow - 1);
  
  // Adjust start page if we're near the end
  if (endPage - startPage < maxPagesToShow - 1) {
    startPage = Math.max(0, endPage - maxPagesToShow + 1);
  }

  // Add first page if not in range
  if (startPage > 0) {
    html += `<li class="page-item"><a class="page-link" href="javascript:void(0);" onclick="changePage(0)">1</a></li>`;
    if (startPage > 1) {
      html += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
    }
  }

  // Add page range
  for (let i = startPage; i <= endPage; i++) {
    html += `
      <li class="page-item ${currentPage === i ? 'active' : ''}">
        <a class="page-link" href="javascript:void(0);" onclick="changePage(${i})" data-page="${i}">${i + 1}</a>
      </li>
    `;
  }

  // Add last page if not in range
  if (endPage < totalPages - 1) {
    if (endPage < totalPages - 2) {
      html += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
    }
    html += `<li class="page-item"><a class="page-link" href="javascript:void(0);" onclick="changePage(${totalPages - 1})">${totalPages}</a></li>`;
  }

  html += `
    <li class="page-item ${currentPage >= totalPages - 1 ? 'disabled' : ''}">
      <a class="page-link" href="javascript:void(0);" onclick="changePage(${currentPage + 1})" aria-label="Next">
        <i class="tf-icon bx bx-chevron-right"></i>
      </a>
    </li>
  `;

  pagination.innerHTML = html;
}


function changePage(newPage) {
  console.log(`📄 Changing to page ${newPage + 1}`);
  
  if (newPage < 0) return;
  
  // Calculate total pages based on current filtering state
  let totalPages;
  if (useClientSideFiltering) {
    totalPages = Math.ceil(allFilteredProjects.length / pageSize);
  } else if (serverPaginationInfo) {
    totalPages = serverPaginationInfo.totalPages;
  } else {
    totalPages = Infinity; 
  }

  if (newPage >= totalPages && totalPages !== Infinity) return;

  currentPage = newPage;
  
  // For client-side filtering, just repaginate locally
  if (useClientSideFiltering) {
    console.log(`🔄 Client-side pagination: going to page ${newPage + 1}`);
    paginateFilteredResults();
  } else {
    // For server-side pagination, make a new API call
    console.log(`🌐 Server-side pagination: loading page ${newPage + 1}`);
    loadProjects();
  }
  
  // Smooth scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
function showError(message) {
  const tbody = document.querySelector("tbody.table-border-bottom-0");
  if (tbody) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center py-4 text-danger">
          <i class="bx bx-error-circle me-2"></i>
          ${message}
        </td>
      </tr>
    `;
  }
}

function escapeHTML(str) {
  if (typeof str !== 'string' && typeof str !== 'number') return '';
  str = String(str);
  return str.replace(/[&<>"']/g, tag => ({
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
      console.log("📂 Category API Response:", res);
      const select = document.getElementById("categoryFilter");
      if (!select) {
        console.error("❌ Category filter element not found");
        return;
      }

      select.innerHTML = '<option value="">All Categories</option>';

      const categories = res.data || [];
      if (Array.isArray(categories)) {
        categories.forEach(cat => {
          if (cat.id !== undefined && cat.categoryName !== undefined) {
            const option = document.createElement("option");
            option.value = cat.id;
            option.textContent = cat.categoryName;
            select.appendChild(option);
          }
        });
        console.log(`✅ Loaded ${categories.length} categories`);
      } else {
        console.error("❌ Categories data is not an array:", res.data);
      }
    })
    .catch(error => {
      console.error("❌ Error loading categories:", error);
    });
}

function loadNgoOptions() {
  Api.ngo.listAll()
    .then((res) => {
      console.log("🏢 NGO API Response:", res);
      const select = document.getElementById("ngoFilter");
      if (!select) {
        console.error("❌ NGO filter element not found");
        return;
      }

      select.innerHTML = '<option value="">All NGOs</option>';

      const ngos = res.data?.content || [];
      if (Array.isArray(ngos)) {
        ngos.forEach(ngo => {
          if (ngo.id !== undefined && ngo.organizationName !== undefined) {
            const option = document.createElement("option");
            option.value = ngo.id;
            option.textContent = ngo.organizationName;
            select.appendChild(option);
          }
        });
        console.log(`✅ Loaded ${ngos.length} NGOs`);
      } else {
        console.error("❌ NGOs data is not an array:", res.data);
      }
    })
    .catch(error => {
      console.error("❌ Error loading NGOs:", error);
    });
}

function clearFilters() {
  console.log("🧹 Clearing all filters");
  
  // Clear all filter elements
  const filterElements = ['categoryFilter', 'ngoFilter', 'budgetFilter', 'statusFilter'];
  filterElements.forEach(id => {
    const element = document.getElementById(id);
    if (element) element.value = "";
  });

  // Reset state
  currentPage = 0;
  lastFilterString = '';
  allFilteredProjects = [];
  window.currentFilters = {};
  useClientSideFiltering = false;
  
  // Reload projects
  loadProjects();
}

function deleteProject(projectId, projectName) {
  console.log('🗑️ Deleting project:', projectId);
  
  const confirmMessage = projectName 
    ? `Are you sure you want to delete "${projectName}"?`
    : `Are you sure you want to delete this project?`;
  
  if (!confirm(confirmMessage)) {
    return;
  }

  ProjectService.delete(projectId)
    .then(response => {
      console.log('✅ Project deleted successfully:', response);
      alert('Project deleted successfully!');
      
      // Remove from all project arrays
      allFilteredProjects = allFilteredProjects.filter(p => p.projectId !== projectId);
      allProjects = allProjects.filter(p => p.projectId !== projectId);
      
      // Remove from DOM
      const projectRow = document.querySelector(`[data-project-id="${projectId}"]`);
      if (projectRow) {
        projectRow.remove();
      }
      
      // Reload projects
      loadProjects();
    })
    .catch(error => {
      console.error('❌ Error deleting project:', error);
      alert('Failed to delete project. Please try again.');
    });
}

// Debug function - call from browser console
function debugFilters() {
  console.log("🔍 Current Filter State:");
  console.log("useClientSideFiltering:", useClientSideFiltering);
  console.log("currentFilters:", window.currentFilters);
  console.log("allProjects.length:", allProjects.length);
  console.log("allFilteredProjects.length:", allFilteredProjects.length);
  console.log("currentPage:", currentPage);
  console.log("pageSize:", pageSize);
  console.log("lastFilterString:", lastFilterString);
  
  // Calculate and show pagination info
  const totalPages = Math.ceil(allFilteredProjects.length / pageSize);
  const startIndex = currentPage * pageSize;
  const endIndex = startIndex + pageSize;
  
  console.log("📄 Pagination Info:");
  console.log("totalPages:", totalPages);
  console.log("startIndex:", startIndex);
  console.log("endIndex:", endIndex);
  console.log("Current page items:", allFilteredProjects.slice(startIndex, endIndex).length);
  
  // Check budget filter specifically
  const budgetEl = document.getElementById("budgetFilter");
  if (budgetEl) {
    console.log("💰 Budget filter value:", budgetEl.value);
    const selectedOption = budgetEl.options[budgetEl.selectedIndex];
    console.log("Selected option text:", selectedOption.text);
  }

  // Show current visible projects
  console.log("👀 Currently visible projects:");
  const visibleProjects = allFilteredProjects.slice(startIndex, endIndex);
  visibleProjects.forEach((project, i) => {
    console.log(`${i + 1}. ${project.projectName} - ₹${parseFloat(project.projectBudget).toLocaleString()}`);
  });
}

// Test pagination manually
function testPagination() {
  console.log("🧪 Testing pagination...");
  console.log("Total filtered projects:", allFilteredProjects.length);
  console.log("Page size:", pageSize);
  console.log("Total pages should be:", Math.ceil(allFilteredProjects.length / pageSize));
  
  for (let page = 0; page < Math.ceil(allFilteredProjects.length / pageSize); page++) {
    const start = page * pageSize;
    const end = start + pageSize;
    const pageItems = allFilteredProjects.slice(start, end);
    console.log(`Page ${page + 1}: items ${start + 1}-${Math.min(end, allFilteredProjects.length)} (${pageItems.length} items)`);
  }
}




























// document.addEventListener("DOMContentLoaded", function () {
//   loadProjects();
//   setupFilterListeners();
//   loadCategoryOptions();
//   loadNgoOptions();

//   const clearFiltersButton = document.getElementById("clearFiltersButton");
//   if (clearFiltersButton) {
//     clearFiltersButton.addEventListener("click", clearFilters);
//   }
// });

// // Store filtered projects for client-side pagination
// let allFilteredProjects = [];
// let currentPage = 0;
// const pageSize = 10;
// let lastFilterString = '';

// function setupFilterListeners() {
//   const filters = [
//     "categoryFilter",
//     "ngoFilter",
//     "budgetFilter",
//     "statusFilter"
//   ];

//   filters.forEach(filterId => {
//     const element = document.getElementById(filterId);
//     if (element) {
//       element.addEventListener("change", (e) => {
//         console.log(`${filterId} changed to:`, e.target.value);
//         currentPage = 0; // Reset to first page on filter change
//         loadProjects();
//       });
//     }
//   });
// }

// function getFilterParams() {
//   const params = new URLSearchParams();

//   // Category filter
//   const categoryEl = document.getElementById("categoryFilter");
//   if (categoryEl && categoryEl.value && categoryEl.value !== "") {
//     params.append('categoryId', categoryEl.value);
//   }

//   // NGO filter
//   const ngoEl = document.getElementById("ngoFilter");
//   if (ngoEl && ngoEl.value && ngoEl.value !== "") {
//     params.append('ngoId', ngoEl.value);
//   }

//   // Budget filter - FIXED: Send to server instead of client-side filtering
//   const budgetEl = document.getElementById("budgetFilter");
//   if (budgetEl && budgetEl.value && budgetEl.value !== "") {
//     const [min, max] = budgetEl.value.split('-');
//     if (min) params.append('minBudget', min);
//     if (max && max !== 'undefined') params.append('maxBudget', max);
//   }

//   // Status filter
//   const statusEl = document.getElementById("statusFilter");
//   if (statusEl && statusEl.value && statusEl.value !== "") {
//     params.append('status', statusEl.value);
//   }

//   return params.toString();
// }

// function loadProjects() {
//   const filterParams = getFilterParams();

//   // Only refetch if filters have changed
//   if (filterParams !== lastFilterString) {
//     lastFilterString = filterParams;

//     if (filterParams) {
//       console.log("Fetching with filters:", filterParams);
      
//       // FIXED: Remove client-side budget filtering since server handles it
//       fetch(`https://mumbailocal.org:8087/projects/filter?${filterParams}`)
//         .then(response => {
//           if (!response.ok) throw new Error(`HTTP ${response.status}`);
//           return response.json();
//         })
//         .then(apiResponse => {
//           let projects = apiResponse.data || [];
          
//           // Store all filtered projects for pagination
//           allFilteredProjects = projects;
//           console.log(`Found ${projects.length} projects matching filters`);
          
//           paginateFilteredResults();
//         })
//         .catch(error => {
//           console.error("Filter error:", error);
//           showError("No projects found matching the selected filters.");
//         });

//     } else {
//       // Fetch all projects with server-side pagination
//       Api.project.listAll(currentPage, pageSize)
//         .then(response => {
//           renderProjectsTable(response.data.content);
//           renderPagination(response.data.totalPages);
//         })
//         .catch(error => {
//           console.error("API error:", error);
//           showError("Error loading projects");
//         });
//     }
//   } else {
//     // Filters unchanged, just repaginate
//     if (filterParams) {
//       paginateFilteredResults();
//     } else {
//       // Re-fetch for server-side pagination if no filters are applied but page changes
//       Api.project.listAll(currentPage, pageSize)
//         .then(response => {
//           renderProjectsTable(response.data.content);
//           renderPagination(response.data.totalPages);
//         })
//         .catch(showError);
//     }
//   }
// }

// function paginateFilteredResults() {
//   const startIndex = currentPage * pageSize;
//   const paginated = allFilteredProjects.slice(startIndex, startIndex + pageSize);
//   const totalPages = Math.ceil(allFilteredProjects.length / pageSize);

//   renderProjectsTable(paginated);
//   renderPagination(totalPages);
// }

// function renderProjectsTable(projects) {
//   const tbody = document.querySelector("tbody.table-border-bottom-0");
//   if (!tbody) {
//     console.error("Table body not found. Make sure you have <tbody class=\"table-border-bottom-0\"> in your HTML.");
//     return;
//   }

//   if (!projects?.length) {
//     tbody.innerHTML = `<tr><td colspan="7" class="text-center py-4">No projects found</td></tr>`;
//     return;
//   }

//   tbody.innerHTML = projects.map((project, i) => `
//     <tr data-project-id="${project.projectId}">
//       <td>${i + 1 + currentPage * pageSize}</td>
//       <td>${escapeHTML(project.projectName)}</td>
//       <td>₹${Number(project.projectBudget).toLocaleString('en-IN')}</td>
//       <td>${escapeHTML(project.categoryName || '-')}</td>
//       <td>${escapeHTML(project.ngoInfo?.ngoname || '-')}</td>
//       <td>${escapeHTML(project.projectDEpartmentName || '-')}</td>
//       <td>
//         <div class="dropdown">
//           <button class="btn p-0" type="button" data-bs-toggle="dropdown">
//             <i class="bx bx-dots-vertical-rounded"></i>
//           </button>
//           <ul class="dropdown-menu">
//             <li>
//               <a class="dropdown-item" href="project-form.html?id=${project.projectId}">
//                 <i class="bx bx-edit me-1"></i> Edit
//               </a>
//             </li>
//             <li>
//               <a class="dropdown-item" href="javascript:void(0);"
//                   onclick="deleteProject(${project.projectId}, '${escapeHTML(project.projectName)}')">
//                 <i class="bx bx-trash me-1"></i> Delete
//               </a>
//             </li>
//           </ul>
//         </div>
//       </td>
//     </tr>
//   `).join('');
// }

// function renderPagination(totalPages) {
//   const pagination = document.querySelector(".pagination");
//   if (!pagination) {
//      console.error("Pagination container not found. Make sure you have <ul class=\"pagination\"> in your HTML.");
//      return;
//   }
//   if (totalPages <= 1) {
//     pagination.innerHTML = '';
//     return;
//   }

//   let html = `
//     <li class="page-item ${currentPage === 0 ? 'disabled' : ''}">
//       <a class="page-link" href="javascript:void(0);"
//           onclick="changePage(${currentPage - 1})">
//         <i class="tf-icon bx bx-chevron-left"></i>
//       </a>
//     </li>
//   `;

//   const startPage = Math.max(0, currentPage - 2);
//   const endPage = Math.min(totalPages - 1, currentPage + 2);

//   for (let i = startPage; i <= endPage; i++) {
//     html += `
//       <li class="page-item ${currentPage === i ? 'active' : ''}">
//         <a class="page-link" href="javascript:void(0);"
//             onclick="changePage(${i})">${i + 1}</a>
//       </li>
//     `;
//   }

//   html += `
//     <li class="page-item ${currentPage >= totalPages - 1 ? 'disabled' : ''}">
//       <a class="page-link" href="javascript:void(0);"
//           onclick="changePage(${currentPage + 1})">
//         <i class="tf-icon bx bx-chevron-right"></i>
//       </a>
//     </li>
//   `;

//   pagination.innerHTML = html;
// }

// function changePage(newPage) {
//   if (newPage < 0) return;
//   const totalPages = allFilteredProjects.length > 0
//                        ? Math.ceil(allFilteredProjects.length / pageSize)
//                        : Infinity;

//   if (newPage >= totalPages && totalPages !== Infinity) return;

//   currentPage = newPage;
//   loadProjects();
//   window.scrollTo(0, 0);
// }

// function showError(message) {
//   const tbody = document.querySelector("tbody.table-border-bottom-0");
//   if (tbody) {
//     tbody.innerHTML = `
//       <tr>
//         <td colspan="7" class="text-center py-4 text-danger">
//           ${message}
//         </td>
//       </tr>
//     `;
//   }
// }

// function escapeHTML(str) {
//   if (typeof str !== 'string' && typeof str !== 'number') return '';
//   str = String(str);
//   return str.replace(/[&<>"']/g,
//     tag => ({
//       '&': '&amp;',
//       '<': '&lt;',
//       '>': '&gt;',
//       '"': '&quot;',
//       "'": '&#39;'
//     }[tag]));
// }

// function loadCategoryOptions() {
//   Api.category.listAll()
//     .then((res) => {
//       console.log("Category API Response:", res);
//       const select = document.getElementById("categoryFilter");
//       if (!select) {
//         console.error("Category filter element with ID 'categoryFilter' not found in HTML.");
//         return;
//       }

//       select.innerHTML = '<option value="">All Categories</option>';

//       const categories = res.data || [];

//       if (Array.isArray(categories)) {
//         categories.forEach(cat => {
//           if (cat.id !== undefined && cat.categoryName !== undefined) {
//             const option = document.createElement("option");
//             option.value = cat.id;
//             option.textContent = cat.categoryName;
//             select.appendChild(option);
//           } else {
//             console.warn("Category object missing 'id' or 'categoryName':", cat);
//           }
//         });
//       } else {
//         console.error("Category API response 'data' is not an array as expected:", res.data);
//       }
//     })
//     .catch(error => {
//       console.error("Error loading category options:", error);
//     });
// }

// function loadNgoOptions() {
//   Api.ngo.listAll()
//     .then((res) => {
//       console.log("NGO API Response:", res);
//       const select = document.getElementById("ngoFilter");
//       if (!select) {
//         console.error("NGO filter element with ID 'ngoFilter' not found in HTML.");
//         return;
//       }

//       select.innerHTML = '<option value="">All NGOs</option>';

//       const ngos = res.data?.content || [];

//       if (Array.isArray(ngos)) {
//         ngos.forEach(ngo => {
//           if (ngo.id !== undefined && ngo.organizationName !== undefined) {
//             const option = document.createElement("option");
//             option.value = ngo.id;
//             option.textContent = ngo.organizationName;
//             select.appendChild(option);
//           } else {
//             console.warn("NGO object missing 'id' or 'organizationName':", ngo);
//           }
//         });
//       } else {
//         console.error("NGO API response 'data.content' is not an array as expected:", res.data);
//       }
//     })
//     .catch(error => {
//       console.error("Error loading NGO options:", error);
//     });
// }

// // Clear filters function
// function clearFilters() {
//   const categoryFilter = document.getElementById("categoryFilter");
//   if (categoryFilter) categoryFilter.value = "";

//   const ngoFilter = document.getElementById("ngoFilter");
//   if (ngoFilter) ngoFilter.value = "";

//   const budgetFilter = document.getElementById("budgetFilter");
//   if (budgetFilter) budgetFilter.value = "";

//   const statusFilter = document.getElementById("statusFilter");
//   if (statusFilter) statusFilter.value = "";

//   currentPage = 0;
//   lastFilterString = '';
//   allFilteredProjects = [];
//   loadProjects();
// }

// // Add the deleteProject function to avoid the error
// function deleteProject(projectId, projectName) {
//     console.log('🗑️ Delete project called with ID:', projectId);
    
//     const confirmMessage = projectName 
//         ? `Are you sure you want to delete "${projectName}"?`
//         : `Are you sure you want to delete this project?`;
    
//     if (!confirm(confirmMessage)) {
//         return;
//     }

//     ProjectService.delete(projectId)
//         .then(response => {
//             console.log('✅ Project deleted successfully:', response);
//             alert('Project deleted successfully!');
            
//             // Remove from DOM
//             const projectRow = document.querySelector(`[data-project-id="${projectId}"]`);
//             if (projectRow) {
//                 projectRow.remove();
//             }
            
//             // Reload projects to refresh the list
//             loadProjects();
//         })
//         .catch(error => {
//             console.error('❌ Error deleting project:', error);
//             alert('Failed to delete project. Please try again.');
//         });
// }




























// document.addEventListener("DOMContentLoaded", function () {
//   loadProjects();
//   setupFilterListeners();
//   loadCategoryOptions(); // This will populate the category dropdown
//   loadNgoOptions();     // This will populate the NGO dropdown

//   // Add event listener for the Clear Filters button if you have one
//   const clearFiltersButton = document.getElementById("clearFiltersButton");
//   if (clearFiltersButton) {
//     clearFiltersButton.addEventListener("click", clearFilters);
//   }
// });

// // Store filtered projects for client-side pagination
// let allFilteredProjects = [];
// let currentPage = 0;
// const pageSize = 10;
// let lastFilterString = '';

// function setupFilterListeners() {
//   const filters = [
//     "categoryFilter",
//     "ngoFilter",
//     "budgetFilter",
//     "statusFilter"
//   ];

//   filters.forEach(filterId => {
//     const element = document.getElementById(filterId);
//     if (element) {
//       element.addEventListener("change", (e) => {
//         console.log(`${filterId} changed to:`, e.target.value);
//         currentPage = 0; // Reset to first page on filter change
//         loadProjects();
//       });
//     }
//   });
// }

// function getFilterParams() {
//   const params = new URLSearchParams();

//   // Category filter
//   const categoryEl = document.getElementById("categoryFilter");
//   if (categoryEl && categoryEl.value && categoryEl.value !== "") {
//     params.append('categoryId', categoryEl.value);
//   }

//   // NGO filter
//   const ngoEl = document.getElementById("ngoFilter");
//   if (ngoEl && ngoEl.value && ngoEl.value !== "") {
//     params.append('ngoId', ngoEl.value);
//   }

// const budgetEl = document.getElementById("budgetFilter");
// if (budgetEl && budgetEl.value && budgetEl.value !== "") {
//   const [min, max] = budgetEl.value.split('-');
//   if (min) params.append('minBudget', min);
//   if (max) params.append('maxBudget', max);
// }

//   // Status filter (assuming you have this element in your UI)
//   const statusEl = document.getElementById("statusFilter");
//   if (statusEl && statusEl.value && statusEl.value !== "") {
//     params.append('status', statusEl.value);
//   }

//   return params.toString();
// }

// function loadProjects() {
//   const filterParams = getFilterParams();

//   // Only refetch if filters have changed
//   if (filterParams !== lastFilterString) {
//     lastFilterString = filterParams;

//     if (filterParams) {
//       console.log("Fetching with filters:", filterParams);
//       // Fetch filtered projects
// fetch(`https://mumbailocal.org:8087/projects/filter?${filterParams}`)
//   .then(response => {
//     if (!response.ok) throw new Error(`HTTP ${response.status}`);
//     return response.json();
//   })
//   .then(apiResponse => {
//     let projects = apiResponse.data || [];

//     // Apply client-side budget filtering
//     const budgetEl = document.getElementById("budgetFilter");
//     if (budgetEl && budgetEl.value) {
//       const [minStr, maxStr] = budgetEl.value.split("-");
//       const min = parseInt(minStr);
//       const max = parseInt(maxStr);
//       projects = projects.filter(project => {
//         const budget = parseInt(project.projectBudget || 0);
//         return budget >= min && budget <= max;
//       });
//     }

//     allFilteredProjects = projects;
//     paginateFilteredResults();
//   })
//   .catch(error => {
//     console.error("Filter error:", error);
//     showError("No projects found matching the selected filters.");
//   });


//     } else {
//       // Fetch all projects with server-side pagination
//       Api.project.listAll(currentPage, pageSize)
//         .then(response => {
//           // Assuming Api.project.listAll also returns { data: { content: [...] } }
//           renderProjectsTable(response.data.content);
//           renderPagination(response.data.totalPages);
//         })
//         .catch(error => {
//           console.error("API error:", error);
//           showError("Error loading projects");
//         });
//     }
//   } else {
//     // Filters unchanged, just repaginate
//     if (filterParams) {
//       paginateFilteredResults();
//     } else {
//       // Re-fetch for server-side pagination if no filters are applied but page changes
//       Api.project.listAll(currentPage, pageSize)
//         .then(response => {
//           renderProjectsTable(response.data.content);
//           renderPagination(response.data.totalPages);
//         })
//         .catch(showError);
//     }
//   }
// }

// function paginateFilteredResults() {
//   const startIndex = currentPage * pageSize;
//   const paginated = allFilteredProjects.slice(startIndex, startIndex + pageSize);
//   const totalPages = Math.ceil(allFilteredProjects.length / pageSize);

//   renderProjectsTable(paginated);
//   renderPagination(totalPages);
// }

// function renderProjectsTable(projects) {
//   const tbody = document.querySelector("tbody.table-border-bottom-0");
//   if (!tbody) {
//     console.error("Table body not found. Make sure you have <tbody class=\"table-border-bottom-0\"> in your HTML.");
//     return;
//   }

//   if (!projects?.length) {
//     tbody.innerHTML = `<tr><td colspan="7" class="text-center py-4">No projects found</td></tr>`;
//     return;
//   }

//   tbody.innerHTML = projects.map((project, i) => `
//     <tr>
//       <td>${i + 1 + currentPage * pageSize}</td>
//       <td>${escapeHTML(project.projectName)}</td>
//       <td>${Number(project.projectBudget).toLocaleString('en-IN')}</td>
//       <td>${escapeHTML(project.categoryName || '-')}</td>
//       <td>${escapeHTML(project.ngoInfo?.ngoname || '-')}</td>
//       <td>${escapeHTML(project.projectDEpartmentName || '-')}</td>
//       <td>
//         <div class="dropdown">
//           <button class="btn p-0" type="button" data-bs-toggle="dropdown">
//             <i class="bx bx-dots-vertical-rounded"></i>
//           </button>
//           <ul class="dropdown-menu">
//             <li>
//               <a class="dropdown-item" href="project-form.html?id=${project.projectId}">
//                 <i class="bx bx-edit me-1"></i> Edit
//               </a>
//             </li>
//             <li>
//               <a class="dropdown-item" href="javascript:void(0);"
//                   onclick="deleteProject(${project.projectId})">
//                 <i class="bx bx-trash me-1"></i> Delete
//               </a>
//             </li>
//           </ul>
//         </div>
//       </td>
//     </tr>
//   `).join('');
// }

// function renderPagination(totalPages) {
//   const pagination = document.querySelector(".pagination");
//   if (!pagination) {
//      console.error("Pagination container not found. Make sure you have <ul class=\"pagination\"> in your HTML.");
//      return;
//   }
//   if (totalPages <= 1) {
//     pagination.innerHTML = '';
//     return;
//   }

//   let html = `
//     <li class="page-item ${currentPage === 0 ? 'disabled' : ''}">
//       <a class="page-link" href="javascript:void(0);"
//           onclick="changePage(${currentPage - 1})">
//         <i class="tf-icon bx bx-chevron-left"></i>
//       </a>
//     </li>
//   `;

//   const startPage = Math.max(0, currentPage - 2);
//   const endPage = Math.min(totalPages - 1, currentPage + 2);

//   for (let i = startPage; i <= endPage; i++) {
//     html += `
//       <li class="page-item ${currentPage === i ? 'active' : ''}">
//         <a class="page-link" href="javascript:void(0);"
//             onclick="changePage(${i})">${i + 1}</a>
//       </li>
//     `;
//   }

//   html += `
//     <li class="page-item ${currentPage >= totalPages - 1 ? 'disabled' : ''}">
//       <a class="page-link" href="javascript:void(0);"
//           onclick="changePage(${currentPage + 1})">
//         <i class="tf-icon bx bx-chevron-right"></i>
//       </a>
//     </li>
//   `;

//   pagination.innerHTML = html;
// }

// function changePage(newPage) {
//   if (newPage < 0) return;
//   const totalPages = allFilteredProjects.length > 0
//                        ? Math.ceil(allFilteredProjects.length / pageSize)
//                        : Infinity;

//   if (newPage >= totalPages && totalPages !== Infinity) return;

//   currentPage = newPage;
//   loadProjects();
//   window.scrollTo(0, 0);
// }

// function showError(message) {
//   const tbody = document.querySelector("tbody.table-border-bottom-0");
//   if (tbody) {
//     tbody.innerHTML = `
//       <tr>
//         <td colspan="7" class="text-center py-4 text-danger">
//           ${message}
//         </td>
//       </tr>
//     `;
//   }
// }

// function escapeHTML(str) {
//   if (typeof str !== 'string' && typeof str !== 'number') return '';
//   str = String(str);
//   return str.replace(/[&<>"']/g,
//     tag => ({
//       '&': '&amp;',
//       '<': '&lt;',
//       '>': '&gt;',
//       '"': '&quot;',
//       "'": '&#39;'
//     }[tag]));
// }

// function loadCategoryOptions() {
//   Api.category.listAll()
//     .then((res) => {
//       console.log("Category API Response:", res);
//       const select = document.getElementById("categoryFilter");
//       if (!select) {
//         console.error("Category filter element with ID 'categoryFilter' not found in HTML.");
//         return;
//       }

//       select.innerHTML = '<option value="">All Categories</option>';

//       // Access the array of categories from res.data
//       const categories = res.data || [];

//       if (Array.isArray(categories)) {
//         categories.forEach(cat => {
//           // 🚨 FIX: Your API returns 'id' for category ID, not 'categoryId'.
//           if (cat.id !== undefined && cat.categoryName !== undefined) {
//             const option = document.createElement("option");
//             option.value = cat.id; // Corrected: use cat.id
//             option.textContent = cat.categoryName;
//             select.appendChild(option);
//           } else {
//             console.warn("Category object missing 'id' or 'categoryName':", cat);
//           }
//         });
//       } else {
//         console.error("Category API response 'data' is not an array as expected:", res.data);
//       }
//     })
//     .catch(error => {
//       console.error("Error loading category options:", error);
//     });
// }

// function loadNgoOptions() {
//   Api.ngo.listAll()
//     .then((res) => {
//       console.log("NGO API Response:", res);
//       const select = document.getElementById("ngoFilter");
//       if (!select) {
//         console.error("NGO filter element with ID 'ngoFilter' not found in HTML.");
//         return;
//       }

//       select.innerHTML = '<option value="">All NGOs</option>';

//       // 🚨 FIX: Your NGO API response wraps the array in 'data.content'.
//       // Assume each item in 'content' is an NGO object with 'id' and 'organizationName'.
//       const ngos = res.data?.content || [];

//       if (Array.isArray(ngos)) {
//         ngos.forEach(ngo => {
//           // Assuming NGO objects have 'id' and 'organizationName' directly.
//           if (ngo.id !== undefined && ngo.organizationName !== undefined) {
//             const option = document.createElement("option");
//             option.value = ngo.id;
//             option.textContent = ngo.organizationName;
//             select.appendChild(option);
//           } else {
//             console.warn("NGO object missing 'id' or 'organizationName':", ngo);
//           }
//         });
//       } else {
//         console.error("NGO API response 'data.content' is not an array as expected:", res.data);
//       }
//     })
//     .catch(error => {
//       console.error("Error loading NGO options:", error);
//     });
// }

// // Clear filters function
// function clearFilters() {
//   const categoryFilter = document.getElementById("categoryFilter");
//   if (categoryFilter) categoryFilter.value = "";

//   const ngoFilter = document.getElementById("ngoFilter");
//   if (ngoFilter) ngoFilter.value = "";

//   const budgetFilter = document.getElementById("budgetFilter");
//   if (budgetFilter) budgetFilter.value = "";

//   const statusFilter = document.getElementById("statusFilter");
//   if (statusFilter) statusFilter.value = "";

//   currentPage = 0;
//   lastFilterString = '';
//   allFilteredProjects = [];
//   loadProjects();
// }


// function deleteProject(projectId, projectName) {
//     console.log('🗑️ Delete project called with ID:', projectId);
    
//     const confirmMessage = projectName 
//         ? `Are you sure you want to delete "${projectName}"?`
//         : `Are you sure you want to delete this project?`;
    
//     if (!confirm(confirmMessage)) {
//         return;
//     }

//     ProjectService.delete(projectId)
//         .then(response => {
//             console.log('✅ Project deleted successfully:', response);
//             alert('Project deleted successfully!');
            
//             // Remove from DOM or reload page
//             const projectRow = document.querySelector(`[data-project-id="${projectId}"]`);
//             if (projectRow) {
//                 projectRow.remove();
//             } else {
//                 window.location.reload(); // Fallback: reload the page
//             }
//         })
//         .catch(error => {
//             console.error('❌ Error deleting project:', error);
//             alert('Failed to delete project. Please try again.');
//         });
// }