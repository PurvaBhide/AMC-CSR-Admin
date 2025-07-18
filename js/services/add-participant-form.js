/**
 * participant-form-handler.js
 * Handles participant form functionality including project dropdown
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  // Initialize form
  initParticipantForm();

  // Load projects dropdown
  loadProjectsDropdown();

  // Check if we're in edit mode
  checkEditMode();
});

/**
 * Initialize participant form with event listeners
 */
function initParticipantForm() {
  const form = document.getElementById('AddparticipantForm');

  if (form) {
    form.addEventListener('submit', handleFormSubmit);

    // Add input validation
    addFormValidation();
  }
}

/**
 * Load projects into the dropdown
 */
function loadProjectsDropdown() {
  const projectSelect = document.getElementById('projectSelect');

  // Clear existing options except the default
  projectSelect.innerHTML = '<option value="" selected disabled>Select a project</option>';

  // Show loading state
  const loadingOption = document.createElement('option');
  loadingOption.textContent = 'Loading projects...';
  loadingOption.disabled = true;
  projectSelect.appendChild(loadingOption);
  projectSelect.disabled = true;

  // Fetch projects from API
  ProjectService.listAll(0, 100) // Get first 100 projects
    .then(response => {
      // Remove loading option
      projectSelect.remove(1);

     if (response && response.data && response.data.content && response.data.content.length > 0) {
  response.data.content.forEach(project => {
    const option = document.createElement('option');
    option.value = project.projectId;
    option.textContent = project.projectDEpartmentName || `Project ${project.projectId}`;
    projectSelect.appendChild(option);
  });
} else {
  const noProjectsOption = document.createElement('option');
  noProjectsOption.textContent = 'No projects available';
  noProjectsOption.disabled = true;
  projectSelect.appendChild(noProjectsOption);
}


      projectSelect.disabled = false;
    })
    .catch(error => {
      console.error('Failed to load projects:', error);
      projectSelect.innerHTML = '<option value="" selected disabled>Error loading projects</option>';
    });
}

/**
 * Handle form submission
 */
function handleFormSubmit(event) {
  event.preventDefault();

  const form = event.target;
  if (!form.checkValidity()) {
    event.stopPropagation();
    form.classList.add('was-validated');
    return;
  }

  const participantData = {
    participantName: document.getElementById('participantName').value,
    participantEmail: document.getElementById('participantEmail').value,
    participantMobileNumber: document.getElementById('participantMobileNumber').value,
    organizationName: document.getElementById('organizationName').value || null,
    projetcId: document.getElementById('projectSelect').value,
    amount: document.getElementById('amount').value || null,
    note: document.getElementById('note').value || null
  };

  const isEditMode = form.dataset.editMode === 'true';
  const participantId = isEditMode ? form.dataset.participantId : null;

  // Show loading state
  const submitButton = form.querySelector('button[type="submit"]');
  const originalButtonText = submitButton.innerHTML;
  submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Processing...';
  submitButton.disabled = true;

  // Call appropriate service method
  const serviceCall = isEditMode
    ? Api.participant.update(participantId, participantData)
    : Api.participant.create(participantData);

  serviceCall
    .then(response => {
      showToast('Success', 'Participant saved successfully!', 'success');
      setTimeout(() => {
        window.location.href = 'donationlist.html';
      }, 1500);
    })
    .catch(error => {
      console.error('Error saving participant:', error);
      showToast('Error', 'Failed to save participant: ' + (error.message || 'Unknown error'), 'danger');
    })
    .finally(() => {
      submitButton.innerHTML = originalButtonText;
      submitButton.disabled = false;
    });
}

/**
 * Check if we're in edit mode and load participant data
 */
function checkEditMode() {
  const urlParams = new URLSearchParams(window.location.search);
  const participantId = urlParams.get('id');

  if (participantId) {
    // Update form title
    const formTitle = document.getElementById('formTitle');
    if (formTitle) formTitle.textContent = 'Edit Participant';

    // Set edit mode on form
    const form = document.getElementById('AddparticipantForm');
    if (form) {
      form.dataset.editMode = 'true';
      form.dataset.participantId = participantId;
    }

    // Load participant data
    Api.participant.getById(participantId)
      .then(participant => {
        if (participant) {
          // Fill form fields
          document.getElementById('participantName').value = participant.name || '';
          document.getElementById('participantEmail').value = participant.email || '';
          document.getElementById('participantMobileNumber').value = participant.mobileNumber || '';
          document.getElementById('organizationName').value = participant.organization || '';

          // Set project selection after dropdown is loaded
          const projectSelect = document.getElementById('projectSelect');
          if (projectSelect && participant.projectId) {
            // Wait for options to be loaded
            const waitForOptions = setInterval(() => {
              if (projectSelect.options.length > 1) {
                clearInterval(waitForOptions);
                projectSelect.value = participant.projectId;
              }
            }, 100);
          }
        }
      })
      .catch(error => {
        console.error('Error loading participant data:', error);
        showToast('Error', 'Failed to load participant data', 'danger');
      });
  }
}

/**
 * Add Bootstrap validation to form
 */
function addFormValidation() {
  const form = document.getElementById('AddparticipantForm');
  if (!form) return;

  // Add validation listeners to all required fields
  const requiredFields = form.querySelectorAll('[required]');
  requiredFields.forEach(field => {
    field.addEventListener('input', () => {
      if (field.checkValidity()) {
        field.classList.remove('is-invalid');
        field.classList.add('is-valid');
      } else {
        field.classList.remove('is-valid');
      }
    });

    field.addEventListener('blur', () => {
      if (!field.checkValidity()) {
        field.classList.add('is-invalid');
      }
    });
  });
}

/**
 * Show toast notification
 */
function showToast(title, message, type = 'success') {
  // Implement or use your preferred notification system
  // This is a simple example using Bootstrap toasts
  const toastContainer = document.getElementById('toastContainer') || createToastContainer();
  const toastId = 'toast-' + Date.now();

  const toast = document.createElement('div');
  toast.className = `toast align-items-center text-white bg-${type} border-0`;
  toast.id = toastId;
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', 'assertive');
  toast.setAttribute('aria-atomic', 'true');

  toast.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">
        <strong>${title}</strong><br>${message}
      </div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>
  `;

  toastContainer.appendChild(toast);

  // Initialize and show toast
  const bsToast = new bootstrap.Toast(toast);
  bsToast.show();

  // Remove toast after it's hidden
  toast.addEventListener('hidden.bs.toast', () => {
    toast.remove();
  });
}

/**
 * Create toast container if it doesn't exist
 */
function createToastContainer() {
  const container = document.createElement('div');
  container.id = 'toastContainer';
  container.className = 'position-fixed bottom-0 end-0 p-3';
  container.style.zIndex = '11';
  document.body.appendChild(container);
  return container;
}
