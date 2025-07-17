
$(document).ready(function () {
  let currentPage = 1;
  const pageSize = 10; // Show only 10 company per page
  let allCompanies = [];

  // Load companies when page loads
  loadAllCompanies();

  // Function to load all companies
  function loadAllCompanies() {
    // Show loading state
    $('tbody').html('<tr><td colspan="4" class="text-center">Loading...</td></tr>');

    CompanyService.listAll()
      .then(function (response) {
        if (response && response.data && Array.isArray(response.data.content)) {
          allCompanies = response.data.content; // Store all companies
          currentPage = 1; // Reset to first page
          renderCompanies();
          renderPagination();
        } else {
          console.log('Invalid response format:', response);
          $('tbody').html('<tr><td colspan="4" class="text-center text-danger">Invalid data format</td></tr>');
        }
      })
      .catch(function (error) {
        console.error('Error loading companies:', error);
        $('tbody').html('<tr><td colspan="4" class="text-center text-danger">Error loading data. Please try again.</td></tr>');
      });
  }

  // Function to render paginated companies
  function renderCompanies() {
    const tbody = $('tbody');
    tbody.empty();

    if (allCompanies.length === 0) {
      tbody.html('<tr><td colspan="4" class="text-center">No companies found</td></tr>');
      return;
    }

    const startIndex = (currentPage - 1) * pageSize;
    const paginatedCompanies = allCompanies.slice(startIndex, startIndex + pageSize);

    paginatedCompanies.forEach(function (company, index) {
      const row = `
        <tr>
          <td>${startIndex + index + 1}</td>
          <td>${company.companyname || 'N/A'}</td>
          <td><a href="${company.companyurl || '#'}" target="_blank">${company.companyurl || 'N/A'}</a></td>
          <td>
            <div class="dropdown">
              <button class="btn p-0" type="button" data-bs-toggle="dropdown">
                <i class="bx bx-dots-vertical-rounded"></i>
              </button>
              <ul class="dropdown-menu">
                <li><a class="dropdown-item" href="company-form.html?id=${company.companieId}"><i class="bx bx-edit me-1"></i> Edit</a></li>
                <li><a class="dropdown-item" href="javascript:void(0);" onclick="deleteCompany(${company.companieId})"><i class="bx bx-trash me-1"></i> Delete</a></li>
              </ul>
            </div>
          </td>
        </tr>
      `;
      tbody.append(row);
    });
  }

  // Function to render pagination controls
  function renderPagination() {
    const totalPages = Math.ceil(allCompanies.length / pageSize);
    const paginationContainer = $('#pagination');
    paginationContainer.empty();

    if (totalPages <= 1) return;

    for (let i = 1; i <= totalPages; i++) {
      const pageBtn = $(`<button class="btn btn-sm ${i === currentPage ? 'btn-primary' : 'btn-outline-primary'} me-1">${i}</button>`);
      pageBtn.on('click', function () {
        currentPage = i;
        renderCompanies();
        renderPagination();
      });
      paginationContainer.append(pageBtn);
    }
  }

  // Function to delete a company
  window.deleteCompany = function (id) {
    if (confirm('Are you sure you want to delete this company?')) {
      CompanyService.delete(id)
        .then(function () {
          loadAllCompanies(); // Reload data after deletion
        })
        .catch(function (error) {
          console.error('Error deleting company:', error);
          alert('Error deleting company. Please try again.');
        });
    }
  };
});
