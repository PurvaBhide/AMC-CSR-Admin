// company-management.js
$(document).ready(function() {
  // Load companies when page loads
  loadAllCompanies();

  // Function to load all companies
  function loadAllCompanies() {
    // Show loading state
    $('tbody').html('<tr><td colspan="4" class="text-center">Loading...</td></tr>');

    CompanyService.listAll() // Call listAll without pagination parameters
      .then(function(response) {
        // Check if response is valid and access the 'data.content' array
        // as per your API response structure: {"status": 200, "message": "...", "data": {"content": [...]}}
        if (response && response.data && Array.isArray(response.data.content)) {
          renderCompanies(response.data.content);
          console.log(response.data.content);
        } else {
          console.log('Invalid response format:', response);
          $('tbody').html('<tr><td colspan="4" class="text-center text-danger">Invalid data format</td></tr>');
        }
      })
      .catch(function(error) {
        console.error('Error loading companies:', error);
        $('tbody').html('<tr><td colspan="4" class="text-center text-danger">Error loading data. Please try again.</td></tr>');
      });
  }

  // Function to render companies in the table
  function renderCompanies(companies) {
    const tbody = $('tbody');
    tbody.empty();

    if (companies.length === 0) {
      tbody.html('<tr><td colspan="4" class="text-center">No companies found</td></tr>');
      return;
    }

    companies.forEach(function(company, index) {
      // Use company.companyname, company.companyurl, company.companieId based on your API response
      const row = `
        <tr>
          <td>${index + 1}</td>
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

  // Function to delete a company
  window.deleteCompany = function(id) {
    if (confirm('Are you sure you want to delete this company?')) {
      CompanyService.delete(id)
        .then(function() {
          loadAllCompanies(); // Reload the list after deletion
        })
        .catch(function(error) {
          console.error('Error deleting company:', error);
          alert('Error deleting company. Please try again.');
        });
    }
  };
});
