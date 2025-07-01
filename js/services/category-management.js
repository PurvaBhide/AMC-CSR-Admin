// category-management.js

// Toast notification colors (professional version)
const TOAST_TYPES = {
  SUCCESS: 'primary',
  ERROR: 'danger',
  WARNING: 'warning',
  INFO: 'info'
};

// DOM Elements
const addCategoryForm = document.getElementById('addCategoryForm');
const editCategoryForm = document.getElementById('editCategoryForm');
const categoryNameInput = document.getElementById('categoryName');
const editCategoryNameInput = document.getElementById('editCategoryName');
const editCategoryIdInput = document.getElementById('editCategoryId');
const categoriesList = document.getElementById('categoriesList');
const editCategoryCard = document.getElementById('editCategoryCard');
const refreshBtn = document.getElementById('refreshCategoriesBtn');

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  loadCategories();
  
  // Event listeners
  refreshBtn.addEventListener('click', loadCategories);
  addCategoryForm.addEventListener('submit', handleAddCategory);
  editCategoryForm.addEventListener('submit', handleEditCategory);
  document.getElementById('cancelEditBtn').addEventListener('click', cancelEdit);
});

// Main functions
function loadCategories() {
  showLoadingState();
  
  Api.category.listAll()
    .then(response => {
      if (!isValidResponse(response)) {
        throw new Error('Invalid categories data format');
      }
      renderCategories(response.data);
    })
    .catch(error => {
      showErrorState(error);
    })
    .finally(() => {
      resetRefreshButton();
    });
}

function handleAddCategory(e) {
  e.preventDefault();
  const btn = document.getElementById('saveCategoryBtn');
  setButtonLoading(btn, true);

  const categoryData = {
    categoryName: categoryNameInput.value.trim()
  };

  Api.category.add(categoryData)
    .then(() => {
      showToast('Category added successfully', TOAST_TYPES.SUCCESS);
      resetForm(addCategoryForm);
      loadCategories();
    })
    .catch(error => {
      handleFormError(error, 'categoryName');
    })
    .finally(() => {
      setButtonLoading(btn, false);
    });
}

function handleEditCategory(e) {
  e.preventDefault();
  const btn = document.getElementById('updateCategoryBtn');
  setButtonLoading(btn, true);

  const categoryData = {
    categoryName: editCategoryNameInput.value.trim()
  };

  Api.category.update(editCategoryIdInput.value, categoryData)
    .then(() => {
      showToast('Category updated successfully', TOAST_TYPES.SUCCESS);
      editCategoryCard.classList.add('d-none');
      loadCategories();
    })
    .catch(error => {
      handleFormError(error, 'editCategoryName');
    })
    .finally(() => {
      setButtonLoading(btn, false);
    });
}

// Helper functions
function isValidResponse(response) {
  return response && response.data && Array.isArray(response.data);
}

function renderCategories(categories) {
  if (categories.length === 0) {
    categoriesList.innerHTML = noCategoriesFound();
    return;
  }

  categoriesList.innerHTML = categories.map(category => `
    <tr>
      <td>${category.categoryName || 'Unnamed Category'}</td>
      <td>
        <div class="d-flex gap-2">
          <button class="btn btn-sm btn-outline-primary edit-btn" 
                  data-id="${category.id}" 
                  data-name="${category.categoryName}">
            <i class="bx bx-edit"></i>
          </button>
          <button class="btn btn-sm btn-outline-danger delete-btn" 
                  data-id="${category.id}">
            <i class="bx bx-trash"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join('');

  attachCategoryEventListeners();
}

function attachCategoryEventListeners() {
  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      editCategoryIdInput.value = btn.dataset.id;
      editCategoryNameInput.value = btn.dataset.name;
      editCategoryCard.classList.remove('d-none');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });

  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (confirm('Are you sure you want to delete this category?')) {
        deleteCategory(btn.dataset.id);
      }
    });
  });
}

function deleteCategory(id) {
  const btn = document.querySelector(`.delete-btn[data-id="${id}"]`);
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status"></span>';
  }

  Api.category.delete(id)
    .then(() => {
      showToast('Category deleted successfully', TOAST_TYPES.SUCCESS);
      loadCategories();
    })
    .catch(error => {
      showToast(error.message || 'Failed to delete category', TOAST_TYPES.ERROR);
      if (btn) btn.disabled = false;
    });
}

// UI Helpers
function showLoadingState() {
  categoriesList.innerHTML = `
    <tr>
      <td colspan="2" class="text-center">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </td>
    </tr>
  `;
  refreshBtn.innerHTML = '<i class="bx bx-refresh bx-spin"></i>';
  refreshBtn.disabled = true;
}

function showErrorState(error) {
  console.error('Category loading error:', error);
  categoriesList.innerHTML = `
    <tr>
      <td colspan="2" class="text-center text-danger">
        ${error.message || 'Failed to load categories'}
      </td>
    </tr>
  `;
  showToast(error.message || 'Failed to load categories', TOAST_TYPES.ERROR);
}

function resetRefreshButton() {
  refreshBtn.innerHTML = '<i class="bx bx-refresh"></i>';
  refreshBtn.disabled = false;
}

function noCategoriesFound() {
  return `
    <tr>
      <td colspan="2" class="text-center text-muted">No categories found</td>
    </tr>
  `;
}

function setButtonLoading(button, isLoading) {
  button.disabled = isLoading;
  const spinner = button.querySelector('.spinner-border');
  if (spinner) spinner.classList.toggle('d-none', !isLoading);
}

function resetForm(form) {
  form.reset();
  const inputs = form.querySelectorAll('.is-invalid');
  inputs.forEach(input => input.classList.remove('is-invalid'));
}

function handleFormError(error, fieldName) {
  showToast(error.message || 'Operation failed', TOAST_TYPES.ERROR);
  const errorField = document.getElementById(`${fieldName}Error`);
  const inputField = document.getElementById(fieldName);
  
  if (errorField && inputField) {
    errorField.textContent = error.details?.errors?.[fieldName] || '';
    inputField.classList.add('is-invalid');
  }
}

function cancelEdit() {
  editCategoryCard.classList.add('d-none');
}

function showToast(message, type = TOAST_TYPES.INFO) {
  const toastContainer = document.getElementById('toastContainer') || createToastContainer();
  const toastId = `toast-${Date.now()}`;
  
  const toast = document.createElement('div');
  toast.className = `bs-toast toast fade show border-${type}`;
  toast.setAttribute('role', 'alert');
  toast.id = toastId;

  toast.innerHTML = `
    <div class="toast-header bg-white">
      <i class="bx ${type === TOAST_TYPES.SUCCESS ? 'bx-check-circle text-success' : 
                     type === TOAST_TYPES.ERROR ? 'bx-error-circle text-danger' : 
                     type === TOAST_TYPES.WARNING ? 'bx-error text-warning' : 'bx-info-circle text-info'} me-2"></i>
      <div class="me-auto fw-semibold">${type.charAt(0).toUpperCase() + type.slice(1)}</div>
      <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>
    <div class="toast-body">${message}</div>
  `;

  toastContainer.appendChild(toast);
  setTimeout(() => toast.remove(), 5000);
}

function createToastContainer() {
  const container = document.createElement('div');
  container.id = 'toastContainer';
  container.className = 'position-fixed top-0 end-0 p-3';
  container.style.zIndex = '9999';
  document.body.appendChild(container);
  return container;
}