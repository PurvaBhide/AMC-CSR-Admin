document.addEventListener('DOMContentLoaded', function () {
  const id = getUrlParam('id');
  console.log('Gallery form loaded with ID:', id);

  if (id) {
    console.log('Edit mode detected');
    setFormMode(true); // Edit mode
    // If you have a fetch function for gallery data, call it here
    // fetchGalleryData(id);
  } else {
    console.log('Create mode detected');
    setFormMode(false); // Create mode
    initializeEmptyForm();
  }
});

let uploadedFiles = []; // Array to store uploaded files
let isEditMode = false;
const MAX_FILES = 5;

function getUrlParam(key) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(key);
}

// Utility function to set element visibility
function setElementVisibility(elementId, isVisible) {
  const element = document.getElementById(elementId);
  if (element) {
    if (isVisible) {
      element.style.display = 'inline-block';
      element.style.visibility = 'visible';
      element.removeAttribute('hidden');
      element.classList.remove('d-none');
    } else {
      element.style.display = 'none';
      element.style.visibility = 'hidden';
      element.setAttribute('hidden', 'true');
      element.classList.add('d-none');
    }
    console.log(`${elementId} visibility set to: ${isVisible}`);
  }
}

// Function to set form mode
function setFormMode(isEdit) {
  console.log(`Setting form mode: ${isEdit ? 'Edit' : 'Create'}`);
  
  // Button visibility
  setElementVisibility('saveBtn', isEdit);
  setElementVisibility('submitBtn', !isEdit);
  
  isEditMode = isEdit;
}

function initializeEmptyForm() {
  // Clear form fields
  document.getElementById('fileType').value = '';
  document.getElementById('fileUrl').value = '';
  
  // Clear uploaded files array and preview
  uploadedFiles = [];
  updateFilePreview();
  
  isEditMode = false;
  console.log('Gallery form initialized for create mode');
}

// Handle form submission
document.getElementById('galleryform').addEventListener('submit', function (e) {
  e.preventDefault();
  console.log('Gallery form submitted');
  
  const id = getUrlParam('id');
  if (id) {
    updateGallery(id);
  } else {
    createGallery();
  }
});

// Add event listeners for buttons
document.addEventListener('DOMContentLoaded', function() {
  const saveBtn = document.getElementById('saveBtn');
  if (saveBtn) {
    saveBtn.addEventListener('click', function(e) {
      e.preventDefault();
      console.log('Save button clicked');
      const id = getUrlParam('id');
      if (id) {
        updateGallery(id);
      }
    });
  }

  const submitBtn = document.getElementById('submitBtn');
  if (submitBtn) {
    submitBtn.addEventListener('click', function(e) {
      e.preventDefault();
      console.log('Submit button clicked');
      createGallery();
    });
  }
});

// Upload and preview function
async function uploadAndSetDocument() {
  const fileInput = document.getElementById("fileUrl");
  const fileTypeSelect = document.getElementById("fileType");
  const file = fileInput.files[0];

  if (!file) {
    alert("Please select a file to upload.");
    return;
  }

  if (!fileTypeSelect.value || fileTypeSelect.value === 'select type') {
    alert("Please select a file type first.");
    fileTypeSelect.focus();
    return;
  }

  // Check if maximum files limit reached
  if (uploadedFiles.length >= MAX_FILES) {
    alert(`Maximum ${MAX_FILES} files allowed. Please remove some files before adding new ones.`);
    fileInput.value = ''; // Clear the input
    return;
  }

  // Validate file type
  const selectedType = fileTypeSelect.value;
  const isValidFile = validateFileType(file, selectedType);
  
  if (!isValidFile) {
    fileInput.value = ''; // Clear the input
    return;
  }

  // Show loading state
  showUploadProgress(true);

  try {
    let uploadPath = "";

    // Determine upload path based on file type
    if (selectedType === 'image') {
      uploadPath = "/upload/images";
    } else if (selectedType === 'document') {
      uploadPath = "/upload/documents";
    } else if (selectedType === 'video') {
      uploadPath = "/upload/videos";
    } else {
      alert("Unsupported file type!");
      showUploadProgress(false);
      return;
    }

    // Check if api exists
    if (typeof api === 'undefined') {
      console.error('api is not defined');
      alert('API service not available. Please check if the API is loaded.');
      showUploadProgress(false);
      return;
    }

    console.log(`Uploading ${selectedType} to ${uploadPath}:`, file.name);

    // Use the API's uploadFile method which handles FormData properly
    const response = await api.uploadFile(uploadPath, file, 'files');
    
    console.log("Upload response:", response);

    // Handle response structure - adjust based on your API response
    let uploadedUrl = null;
    
    // Try different possible response structures
    if (response.uploadedUrls && response.uploadedUrls[0]) {
      uploadedUrl = response.uploadedUrls[0];
    } else if (response.data && response.data.uploadedUrls && response.data.uploadedUrls[0]) {
      uploadedUrl = response.data.uploadedUrls[0];
    } else if (response.url) {
      uploadedUrl = response.url;
    } else if (response.data && response.data.url) {
      uploadedUrl = response.data.url;
    } else if (response.filePath) {
      uploadedUrl = response.filePath;
    } else if (response.data && response.data.filePath) {
      uploadedUrl = response.data.filePath;
    } else if (typeof response === 'string') {
      uploadedUrl = response;
    } else if (response.data && typeof response.data === 'string') {
      uploadedUrl = response.data;
    }

    console.log("Extracted uploaded URL:", uploadedUrl);

    if (uploadedUrl) {
      // Add to uploaded files array
      const fileData = {
        id: Date.now(), // Temporary ID for tracking
        url: uploadedUrl,
        type: selectedType,
        name: file.name,
        size: file.size
      };
      
      uploadedFiles.push(fileData);
      
      // Update preview
      updateFilePreview();
      
      // Clear form inputs for next upload
      fileInput.value = '';
      fileTypeSelect.value = '';
      
      console.log('File uploaded successfully:', fileData);
      
      // Show success message
      showUploadSuccess(file.name);
    } else {
      console.error("No upload URL found in response:", response);
      throw new Error("Upload successful but no file URL received. Please check server response format.");
    }

  } catch (error) {
    console.error("Error uploading file:", error);
    
    // More specific error messages with better error handling
    let errorMessage = "File upload failed. ";
    
    // Safely access error properties
    const errorStatus = error.status || (error.responseJSON && error.responseJSON.status) || 'unknown';
    const errorText = error.message || (error.responseJSON && error.responseJSON.message) || 'Unknown error';
    
    if (errorStatus === 500) {
      errorMessage += "Server error (500). Please check if the upload endpoint is working correctly.";
    } else if (errorStatus === 413) {
      errorMessage += "File too large. Please select a smaller file.";
    } else if (errorStatus === 404) {
      errorMessage += "Upload endpoint not found. Please check the server configuration.";
    } else if (errorText && errorText.toLowerCase().includes('network')) {
      errorMessage += "Network error. Please check your internet connection.";
    } else {
      errorMessage += errorText;
    }
    
    alert(errorMessage);
  } finally {
    showUploadProgress(false);
  }
}

// Validate file type against selected type
function validateFileType(file, selectedType) {
  const fileType = file.type;
  const fileName = file.name.toLowerCase();

  if (selectedType === 'image') {
    if (!fileType.startsWith('image/')) {
      alert('Please select a valid image file (JPG, PNG, GIF, etc.)');
      return false;
    }
    // Check file size (max 5MB for images)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image file size should be less than 5MB');
      return false;
    }
  } else if (selectedType === 'document') {
    const allowedDocTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    
    const allowedExtensions = ['.pdf', '.doc', '.docx', '.txt'];
    const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext));
    
    if (!allowedDocTypes.includes(fileType) && !hasValidExtension) {
      alert('Please select a valid document file (PDF, DOC, DOCX, TXT)');
      return false;
    }
    // Check file size (max 10MB for documents)
    if (file.size > 10 * 1024 * 1024) {
      alert('Document file size should be less than 10MB');
      return false;
    }
  } else if (selectedType === 'video') {
    const allowedVideoTypes = [
      'video/mp4',
      'video/avi',
      'video/mov',
      'video/wmv',
      'video/flv',
      'video/webm',
      'video/mkv',
      'video/3gp'
    ];
    
    const allowedVideoExtensions = ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv', '.3gp'];
    const hasValidVideoExtension = allowedVideoExtensions.some(ext => fileName.endsWith(ext));
    
    if (!allowedVideoTypes.includes(fileType) && !hasValidVideoExtension) {
      alert('Please select a valid video file (MP4, AVI, MOV, WMV, FLV, WEBM, MKV, 3GP)');
      return false;
    }
    // Check file size (max 50MB for videos)
    if (file.size > 50 * 1024 * 1024) {
      alert('Video file size should be less than 50MB');
      return false;
    }
  }

  return true;
}

// Show/hide upload progress
function showUploadProgress(show) {
  let progressDiv = document.getElementById('upload-progress');
  if (!progressDiv) {
    progressDiv = document.createElement('div');
    progressDiv.id = 'upload-progress';
    progressDiv.innerHTML = '<div class="spinner-border spinner-border-sm me-2"></div>Uploading...';
    progressDiv.className = 'text-primary mt-2';
    document.getElementById('fileUrl').parentNode.appendChild(progressDiv);
  }
  
  progressDiv.style.display = show ? 'block' : 'none';
}

// Show upload success message
function showUploadSuccess(fileName) {
  let successDiv = document.getElementById('upload-success');
  if (!successDiv) {
    successDiv = document.createElement('div');
    successDiv.id = 'upload-success';
    successDiv.className = 'alert alert-success mt-2';
    document.getElementById('fileUrl').parentNode.appendChild(successDiv);
  }
  
  successDiv.innerHTML = `<i class="fas fa-check-circle me-2"></i>File "${fileName}" uploaded successfully!`;
  successDiv.style.display = 'block';
  
  // Hide success message after 3 seconds
  setTimeout(() => {
    successDiv.style.display = 'none';
  }, 3000);
}

// Update file preview
function updateFilePreview() {
  let previewContainer = document.getElementById('file-preview-container');
  
  if (!previewContainer) {
    previewContainer = document.createElement('div');
    previewContainer.id = 'file-preview-container';
    previewContainer.className = 'mt-3';
    
    // Insert after the file input
    const fileInput = document.getElementById('fileUrl');
    fileInput.parentNode.appendChild(previewContainer);
  }

  if (uploadedFiles.length === 0) {
    previewContainer.innerHTML = '<p class="text-muted">No files uploaded yet.</p>';
    return;
  }

  let html = `
    <div class="card">
      <div class="card-header d-flex justify-content-between align-items-center">
        <h6 class="mb-0">Uploaded Files (${uploadedFiles.length}/${MAX_FILES})</h6>
        <small class="text-muted">Click × to remove | Each file will be submitted individually</small>
      </div>
      <div class="card-body">
        <div class="row">
  `;

  uploadedFiles.forEach((file, index) => {
    // Show what will be submitted for each file
    const submissionData = {
      fileUrl: file.url,
      fileType: file.type
    };

    html += `
      <div class="col-md-6 col-lg-4 mb-3">
        <div class="border rounded p-2 position-relative">
          <button type="button" class="btn-close position-absolute top-0 end-0 m-1" 
                  onclick="removeFile(${file.id})" 
                  title="Remove file"></button>
          
          <div class="text-center mb-2">
            ${getFilePreview(file)}
          </div>
          
          <div class="small">
            <div class="text-truncate fw-bold">${file.name}</div>
            <div class="text-muted mb-2">
              Type: ${file.type} | Size: ${formatFileSize(file.size)}
            </div>
            
            <!-- Show submission payload -->
            <div class="bg-light p-2 rounded">
              <div class="text-muted" style="font-size: 0.7rem;">Will submit:</div>
              <code style="font-size: 0.7rem; word-break: break-all;">
                ${JSON.stringify(submissionData, null, 2)}
              </code>
            </div>
          </div>
        </div>
      </div>
    `;
  });

  html += `
        </div>
        <div class="mt-3 p-2 bg-info bg-opacity-10 rounded">
          <small class="text-info">
            <i class="fas fa-info-circle me-1"></i>
            Each file will be submitted as a separate API call with the payload structure shown above.
          </small>
        </div>
      </div>
    </div>
  `;

  previewContainer.innerHTML = html;
}

// Get file preview based on type
function getFilePreview(file) {
  if (file.type === 'image') {
    return `<img src="${file.url}" alt="${file.name}" style="max-width: 100%; height: 80px; object-fit: cover;" class="rounded">`;
  } else if (file.type === 'document') {
    let icon = '📄';
    if (file.name.toLowerCase().endsWith('.pdf')) icon = '📕';
    else if (file.name.toLowerCase().includes('.doc')) icon = '📘';
    
    return `
      <div style="height: 80px;" class="d-flex align-items-center justify-content-center bg-light rounded">
        <div class="text-center">
          <div style="font-size: 2rem;">${icon}</div>
          <small>Document</small>
        </div>
      </div>
      <a href="${file.url}" target="_blank" class="btn btn-sm btn-outline-primary mt-1">View</a>
    `;
  } else if (file.type === 'video') {
    return `
      <div style="height: 80px;" class="d-flex align-items-center justify-content-center bg-light rounded">
        <div class="text-center">
          <div style="font-size: 2rem;">🎥</div>
          <small>Video</small>
        </div>
      </div>
      <video width="100%" height="80" controls class="rounded mt-1">
        <source src="${file.url}" type="video/mp4">
        <a href="${file.url}" target="_blank" class="btn btn-sm btn-outline-primary">Play Video</a>
      </video>
    `;
  }
  
  return `<div class="text-center p-3 bg-light rounded">Unknown file type</div>`;
}

// Remove file from uploaded files array
function removeFile(fileId) {
  if (confirm('Are you sure you want to remove this file?')) {
    uploadedFiles = uploadedFiles.filter(file => file.id !== fileId);
    updateFilePreview();
    console.log('File removed:', fileId);
  }
}

// Format file size for display
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Create gallery function
function createGallery() {
  console.log("Creating new gallery");

  // Validation
  if (uploadedFiles.length === 0) {
    alert('Please upload at least one file before submitting.');
    return;
  }

  // Check if service exists
  if (typeof galleryServices === 'undefined') {
    console.error('galleryServices is not defined');
    alert('Service not available. Please check if the service is loaded.');
    return;
  }

  // Submit each file individually to match expected payload format
  console.log(`Submitting ${uploadedFiles.length} files to gallery...`);
  
  const promises = uploadedFiles.map((file, index) => {
    const formdata = {
      fileUrl: file.url,
      fileType: file.type,
      fundanideaid: document.getElementById('fundanideaid')?.value || ''
    };

    console.log(`Submitting file ${index + 1}:`, formdata);
    
    return galleryServices.add(formdata);
  });

  // Submit all files and wait for all to complete
  Promise.all(promises)
    .then(responses => {
      console.log("All files submitted successfully:", responses);
      alert(`Gallery created successfully! ${uploadedFiles.length} files added.`);
      
      // Reset form
      uploadedFiles = [];
      updateFilePreview();
      initializeEmptyForm();
      
      // Optionally redirect
      // window.location.href = "galleryList.html";
    })
    .catch(err => {
      console.error("Some files failed to submit:", err);
      alert("Failed to create gallery. Some files may not have been saved. Error: " + (err.message || err));
    });
}

// Update gallery function
function updateGallery(id) {
  console.log('Starting update for ID:', id);
  
  // Validation
  if (uploadedFiles.length === 0) {
    alert('Please upload at least one file before updating.');
    return;
  }

  // Check if service exists
  if (typeof galleryServices === 'undefined' || !galleryServices.update) {
    console.error('galleryServices.update is not defined');
    alert('Update service not available.');
    return;
  }

  // For update, we might need to handle it differently
  // If updating means replacing all files, send them individually
  // If updating means adding to existing, same approach
  
  console.log(`Updating gallery with ${uploadedFiles.length} files...`);
  
  const promises = uploadedFiles.map((file, index) => {
    const formdata = {
      fileUrl: file.url,
      fileType: file.type,
      fundanideaid: document.getElementById('fundanideaid')?.value || id
    };

    console.log(`Updating with file ${index + 1}:`, formdata);
    
    // You might need to modify this based on your update API
    // Option 1: Update each file individually
    return galleryServices.add(formdata); // or use update method if available
    
    // Option 2: Use dedicated update method (uncomment if you have it)
    // return galleryServices.update(id, formdata);
  });

  Promise.all(promises)
    .then(responses => {
      console.log("Gallery update responses:", responses);
      alert(`Gallery updated successfully! ${uploadedFiles.length} files processed.`);
      
      // Optionally redirect
      // window.location.href = "galleryList.html";
    })
    .catch(err => {
      console.error("Update failed:", err);
      alert("Failed to update gallery. Error: " + (err.message || err));
    });
}