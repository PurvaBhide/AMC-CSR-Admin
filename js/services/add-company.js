// // company-form-handler.js
// document.addEventListener('DOMContentLoaded', function() {
//     // Initialize form elements
//     const companyForm = document.getElementById('companyForm');
//     const companyID = document.getElementById('companyID');
//     const companyName = document.getElementById('companyName');
//     const companyUrl = document.getElementById('companyUrl');
//     const status = document.getElementById('status');
//     const formTitle = document.getElementById('formTitle');
//     const companyCategory = document.getElementById('companyCategory');

//     // Check if we're editing an existing company
//     const urlParams = new URLSearchParams(window.location.search);
//     const editCompanyId = urlParams.get('id');

//     if (editCompanyId) {
//         formTitle.textContent = 'Edit Company';
//         loadCompanyData(editCompanyId);
//     } else {
//         formTitle.textContent = 'Add Company';
//     }

//     // Form submission handler
//     companyForm.addEventListener('submit', function(e) {
//         e.preventDefault();

//         // Validate form
//         if (!companyName.value || companyName.value.trim() === '') {
//             showError('Company name is required', companyName);
//             return;
//         }

//         // Prepare company data
//         const companyData = {
//             companyname: companyName.value.trim(),
//             companyurl: companyUrl.value.trim(),
//             status: status.value,
//             categoryId: companyCategory.value
//         };

//         // Remove empty or null values
//         Object.keys(companyData).forEach(key => {
//             if (companyData[key] === null || companyData[key] === '') {
//                 delete companyData[key];
//             }
//         });

//         if (editCompanyId) {
//             updateCompany(editCompanyId, companyData);
//         } else {
//             addCompany(companyData);
//         }
//     });

//   function loadCompanyData(id) {
//     toggleFormLoading(true);

//     CompanyService.getById(id)
//         .then(response => {
//             // Check if response is wrapped in a data property
//             const companyData = response.data ? response.data : response;

//             // Populate form fields
//             companyID.value = id;
//             companyName.value = companyData.companyname || companyData.name || '';
//             companyUrl.value = companyData.companyurl || companyData.websiteUrl || companyData.url || '';
//             status.value = companyData.status || 'ACTIVE';

//             // Set category if available
//             if (companyData.categoryId) {
//                 companyCategory.value = companyData.categoryId;
//             } else if (companyData.category && companyData.category.id) {
//                 companyCategory.value = companyData.category.id;
//             }
//         })
//         .catch(error => {
//             console.error('Error loading company:', error);
//             showError('Failed to load company data. Please try again.');
//             // Redirect to list if error occurs
//             setTimeout(() => {
//                 window.location.href = 'company-list.html';
//             }, 2000);
//         })
//         .finally(() => {
//             toggleFormLoading(false); // This ensures loading state is always cleared
//         });
// }

// function toggleFormLoading(isLoading) {
//     const submitButton = companyForm.querySelector('button[type="submit"]');
//     if (submitButton) {
//         submitButton.disabled = isLoading;
//         submitButton.innerHTML = isLoading
//             ? '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Processing...'
//             : editCompanyId ? 'Update Company' : 'Add Company';
//     }
// }

//     function addCompany(data) {
//         toggleFormLoading(true);

//         CompanyService.add(data)
//             .then(response => {
//                 showSuccess('Company added successfully!');
//                 // Redirect to list after delay to show success message
//                 setTimeout(() => {
//                     window.location.href = 'company-list.html?added=true';
//                 }, 1500);
//             })
//             .catch(error => {
//                 console.error('Add company error:', error);
//                 showError(error.response?.data?.message || 'Failed to add company. Please try again.');
//             })
//             .finally(() => {
//                 toggleFormLoading(false);
//             });
//     }

//     function updateCompany(id, data) {
//         toggleFormLoading(true);

//         CompanyService.update(id, data)
//             .then(response => {
//                 showSuccess('Company updated successfully!');
//                 // Redirect to list after delay to show success message
//                 setTimeout(() => {
//                     window.location.href = 'company-list.html?updated=true';
//                 }, 1500);
//             })
//             .catch(error => {
//                 console.error('Update company error:', error);
//                 showError(error.response?.data?.message || 'Failed to update company. Please try again.');
//             })
//             .finally(() => {
//                 toggleFormLoading(false);
//             });
//     }

//     function toggleFormLoading(isLoading) {
//         const submitButton = companyForm.querySelector('button[type="submit"]');
//         if (submitButton) {
//             submitButton.disabled = isLoading;
//             submitButton.innerHTML = isLoading
//                 ? '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Processing...'
//                 : editCompanyId ? 'Update Company' : 'Add Company';
//         }
//     }

//     function showError(message, element = null) {
//         // Create or use a better notification system
//         const notification = document.createElement('div');
//         notification.className = 'alert alert-danger position-fixed top-0 end-0 m-3';
//         notification.style.zIndex = '9999';
//         notification.style.minWidth = '300px';
//         notification.innerHTML = message;
//         document.body.appendChild(notification);

//         // Auto remove after 5 seconds
//         setTimeout(() => {
//             notification.remove();
//         }, 5000);

//         if (element) {
//             element.focus();
//             element.classList.add('is-invalid');
//             setTimeout(() => element.classList.remove('is-invalid'), 3000);
//         }
//     }

//     function showSuccess(message) {
//         // Create or use a better notification system
//         const notification = document.createElement('div');
//         notification.className = 'alert alert-success position-fixed top-0 end-0 m-3';
//         notification.style.zIndex = '9999';
//         notification.style.minWidth = '300px';
//         notification.innerHTML = message;
//         document.body.appendChild(notification);

//         // Auto remove after 5 seconds
//         setTimeout(() => {
//             notification.remove();
//         }, 5000);
//     }
// });

document.addEventListener('DOMContentLoaded', function() {
    // Form elements
    const companyForm = document.getElementById('companyForm');
    const companyID = document.getElementById('companyID');
    const companyName = document.getElementById('companyName');
    const companyUrl = document.getElementById('companyUrl');
    const status = document.getElementById('status');
    const companyCategory = document.getElementById('companyCategory');
    const formTitle = document.getElementById('formTitle');
    const submitButton = companyForm.querySelector('button[type="submit"]');

    // Check edit mode
    const urlParams = new URLSearchParams(window.location.search);
    const editCompanyId = urlParams.get('id');

    if (editCompanyId) {
        formTitle.textContent = 'Edit Company';
        submitButton.textContent = 'Update Company';
        loadCompanyData(editCompanyId);
    }

    // Form submission
    companyForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        if (!validateForm()) return;

        const companyData = {
            companyname: companyName.value.trim(),
            companyurl: companyUrl.value.trim(),
            status: status.value,
            categoryId: companyCategory.value
        };

        try {
            toggleFormLoading(true);

            if (editCompanyId) {
                await updateCompany(editCompanyId, companyData);
                showSuccess('Company updated successfully!');
            } else {
                await addCompany(companyData);
                showSuccess('Company added successfully!');
            }

            setTimeout(() => {
                window.location.href = 'company-list.html';
            }, 1500);
        } catch (error) {
            console.error('Error:', error);
            showError(error.message || 'Operation failed. Please try again.');
        } finally {
            toggleFormLoading(false);
        }
    });

    function validateForm() {
        if (!companyName.value.trim()) {
            showError('Company name is required', companyName);
            return false;
        }
        return true;
    }

    async function loadCompanyData(id) {
        try {
            toggleFormLoading(true);
            const response = await CompanyService.getById(id);
            const company = response.data || response;

            companyID.value = id;
            companyName.value = company.companyname || '';
            companyUrl.value = company.companyurl || '';
            status.value = company.status || 'ACTIVE';
            companyCategory.value = company.categoryId || '';

        } catch (error) {
            console.error('Load error:', error);
            showError('Failed to load company data');
            setTimeout(() => window.location.href = 'company-list.html', 2000);
        } finally {
            toggleFormLoading(false);
        }
    }

    async function addCompany(data) {
        const response = await CompanyService.add(data);
        return response;
    }

    async function updateCompany(id, data) {
        const response = await CompanyService.update(id, data);
        return response;
    }

    function toggleFormLoading(isLoading) {
        submitButton.disabled = isLoading;
        submitButton.innerHTML = isLoading
            ? '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Processing...'
            : editCompanyId ? 'Update Company' : 'Add Company';
    }

    function showError(message, element = null) {
        const alertDiv = document.createElement('div');
        alertDiv.className = 'alert alert-danger alert-dismissible fade show position-fixed top-0 end-0 m-3';
        alertDiv.style.zIndex = '9999';
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        document.body.appendChild(alertDiv);

        setTimeout(() => alertDiv.remove(), 5000);

        if (element) {
            element.focus();
            element.classList.add('is-invalid');
        }
    }

    function showSuccess(message) {
        const alertDiv = document.createElement('div');
        alertDiv.className = 'alert alert-success alert-dismissible fade show position-fixed top-0 end-0 m-3';
        alertDiv.style.zIndex = '9999';
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        document.body.appendChild(alertDiv);

        setTimeout(() => alertDiv.remove(), 5000);
    }
});
