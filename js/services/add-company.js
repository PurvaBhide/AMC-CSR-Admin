// company-form-handler.js
document.addEventListener('DOMContentLoaded', function() {
    // Initialize form elements
    const companyForm = document.getElementById('companyForm');
    const companyID = document.getElementById('companyID');
    const companyName = document.getElementById('companyName');
    const companyUrl = document.getElementById('companyUrl');
    const status = document.getElementById('status');
    const formTitle = document.getElementById('formTitle');
    const companyCategory = document.getElementById('companyCategory');


    // Check if we're editing an existing company
    const urlParams = new URLSearchParams(window.location.search);
    const editCompanyId = urlParams.get('id');

    if (editCompanyId) {
        loadCompanyData(editCompanyId);
    }

    // Form submission handler
    companyForm.addEventListener('submit', function(e) {
        e.preventDefault();

        // Validate form - ensure companyName has value
        if (!companyName.value || companyName.value.trim() === '') {
            showError('Company name is required', companyName);
            return;
        }

        // Prepare company data - ensure proper field names match API expectations
        const companyData = {
            companyname: companyName.value.trim(),  // Ensure this matches what your API expects
            companyurl: companyUrl.value.trim(), // Changed from 'url' to 'websiteUrl' if needed
            status: status.value,
            categoryId: companyCategory.value
        };

        // Remove empty or null values
        Object.keys(companyData).forEach(key => {
            if (companyData[key] === null || companyData[key] === '') {
                delete companyData[key];
            }
        });

        if (editCompanyId) {
            updateCompany(editCompanyId, companyData);
        } else {
            addCompany(companyData);
        }
    });

    function loadCompanyData(id) {
        toggleFormLoading(true);

        CompanyService.getById(id)
            .then(response => {
                formTitle.textContent = 'Edit Company';
                companyID.value = id;

                // Map API response to form fields - adjust field names as needed
                companyName.value = response.name || response.companyName || '';
                companyUrl.value = response.websiteUrl || response.url || '';
                status.value = response.status || 'ACTIVE';
            })
            .catch(error => {
                console.error('Error loading company:', error);
                showError('Failed to load company data');
                window.location.href = 'company-list.html';
            })
            .finally(() => {
                toggleFormLoading(false);
            });
    }

    function addCompany(data) {
        toggleFormLoading(true);

        // Debug: Log the data being sent
        console.log('Sending company data:', data);

        CompanyService.add(data)
            .then(response => {
                showSuccess('Company added successfully!');
                window.location.href = 'companylist.html?added=true';
            })
            .catch(error => {
                console.error('Add company error:', error);
                showError(`Failed to add company: ${error.message || 'Server error'}`);
            })
            .finally(() => {
                toggleFormLoading(false);
            });
    }

    function updateCompany(id, data) {
        toggleFormLoading(true);

        console.log('Updating company with:', data);

        CompanyService.update(id, data)
            .then(response => {
                showSuccess('Company updated successfully!');
                window.location.href = 'companylist.html?updated=true';
            })
            .catch(error => {
                console.error('Update company error:', error);
                showError(`Failed to update company: ${error.message || 'Server error'}`);
            })
            .finally(() => {
                toggleFormLoading(false);
            });
    }

    function toggleFormLoading(isLoading) {
        const submitButton = companyForm.querySelector('button[type="submit"]');
        submitButton.disabled = isLoading;
        submitButton.innerHTML = isLoading
            ? '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Processing...'
            : 'Save Company';
    }

    function showError(message, element = null) {
        alert(message); // Replace with toast notification if available
        if (element) {
            element.focus();
            element.classList.add('is-invalid');
            setTimeout(() => element.classList.remove('is-invalid'), 3000);
        }
    }

    function showSuccess(message) {
        alert(message); // Replace with toast notification if available
    }
});
