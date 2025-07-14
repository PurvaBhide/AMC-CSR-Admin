// Complete JavaScript for letestupdatesform
let uploadedImageUrl = '';
let isEditMode = false;

// Safe DOM element getter
function safeGetElement(id) {
    const element = document.getElementById(id);
    if (!element) {
        console.warn(`Element with ID '${id}' not found`);
    }
    return element;
}

// ENHANCED Image upload handler - handles your API response format
async function handleImageUpload(input) {
    const file = input.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
        showToastMessage('Please select an image file', 'error');
        input.value = '';
        return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
        showToastMessage('File size must be less than 5MB', 'error');
        input.value = '';
        return;
    }

    try {
        // Show loader
        showUploadLoader();
        
        // Create FormData for upload
        const formData = new FormData();
        formData.append('files', file);

        console.log('Uploading image...');
        const response = await galleryServices.uploadimage(formData);
        
        console.log('Upload response:', response);
        
        // Handle your actual API response format
        // Your API returns: { status: 200, message: "...", uploadedUrls: ["https://..."] }
        if (response && response.status === 200 && response.uploadedUrls && response.uploadedUrls.length > 0) {
            // Get the first uploaded URL
            uploadedImageUrl = response.uploadedUrls[0];
            
            // Hide loader and show success
            hideUploadLoader();
            showImagePreview(file, uploadedImageUrl);
            
            console.log('Image uploaded successfully:', uploadedImageUrl);
            
            // Show green success message
            showToastMessage(response.message || 'Image uploaded successfully!', 'success');
            
        } else {
            // Handle different error cases
            let errorMessage = 'Upload failed';
            
            if (response && response.message) {
                errorMessage = response.message;
            } else if (response && response.status && response.status !== 200) {
                errorMessage = `Upload failed with status: ${response.status}`;
            } else if (response && !response.uploadedUrls) {
                errorMessage = 'No upload URLs received from server';
            }
            
            throw new Error(errorMessage);
        }
    } catch (error) {
        console.error('Image upload error:', error);
        
        // Hide loader and show error
        hideUploadLoader();
        
        // Show specific error message
        const errorMessage = error.message || 'Failed to upload image. Please try again.';
        showToastMessage(errorMessage, 'error');
        
        input.value = '';
    }
}

// Enhanced loader functions
function showUploadLoader() {
    // Find the file input container
    const fileInput = safeGetElement('letestupdateimage');
    const uploadContainer = fileInput ? fileInput.closest('.col-md-6') : null;
    
    if (uploadContainer) {
        // Remove any existing loader
        const existingLoader = uploadContainer.querySelector('.upload-loader-overlay');
        if (existingLoader) existingLoader.remove();
        
        // Create loader overlay
        const loaderOverlay = document.createElement('div');
        loaderOverlay.className = 'upload-loader-overlay';
        loaderOverlay.innerHTML = `
            <div class="upload-loader-content">
                <div class="spinner-border text-primary mb-2" role="status">
                    <span class="visually-hidden">Uploading...</span>
                </div>
                <p class="mb-0 text-primary fw-medium">Uploading image...</p>
                <small class="text-muted">Please wait while we upload your file</small>
            </div>
        `;
        
        // Add styles
        loaderOverlay.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(255, 255, 255, 0.95);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            border-radius: 8px;
            backdrop-filter: blur(2px);
        `;
        
        uploadContainer.style.position = 'relative';
        uploadContainer.appendChild(loaderOverlay);
    }
    
    // Disable file input during upload
    const fileInputElement = safeGetElement('letestupdateimage');
    if (fileInputElement) fileInputElement.disabled = true;
}

function hideUploadLoader() {
    // Remove loader overlay
    const loaderOverlay = document.querySelector('.upload-loader-overlay');
    if (loaderOverlay) {
        loaderOverlay.remove();
    }
    
    // Re-enable file input
    const fileInput = safeGetElement('letestupdateimage');
    if (fileInput) fileInput.disabled = false;
}

// Enhanced toast message system
function showToastMessage(message, type = 'info') {
    // Remove any existing toasts
    const existingToasts = document.querySelectorAll('.upload-toast');
    existingToasts.forEach(toast => toast.remove());
    
    // Create toast container if it doesn't exist
    let toastContainer = document.querySelector('.upload-toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'upload-toast-container';
        toastContainer.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            min-width: 300px;
        `;
        document.body.appendChild(toastContainer);
    }
    
    // Create toast
    const toast = document.createElement('div');
    toast.className = `upload-toast alert alert-${type === 'error' ? 'danger' : 'success'} alert-dismissible fade show`;
    toast.innerHTML = `
        <div class="d-flex align-items-center">
            <i class="bx bx-${type === 'error' ? 'error' : 'check'}-circle me-2 fs-5"></i>
            <div class="flex-grow-1">
                <strong>${type === 'error' ? 'Error' : 'Success'}!</strong>
                <div>${message}</div>
            </div>
            <button type="button" class="btn-close" onclick="this.closest('.upload-toast').remove()"></button>
        </div>
    `;
    
    // Add animation styles
    toast.style.cssText = `
        margin-bottom: 10px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        border: none;
        animation: slideInRight 0.3s ease-out;
    `;
    
    // Add CSS animation if not already added
    if (!document.querySelector('#toast-animations')) {
        const style = document.createElement('style');
        style.id = 'toast-animations';
        style.textContent = `
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOutRight {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
    
    toastContainer.appendChild(toast);
    
    // Auto-remove success messages after 4 seconds
    if (type === 'success') {
        setTimeout(() => {
            if (toast.parentElement) {
                toast.style.animation = 'slideOutRight 0.3s ease-in';
                setTimeout(() => toast.remove(), 300);
            }
        }, 4000);
    }
    
    // Log to console
    console.log(`${type.toUpperCase()}: ${message}`);
}

function showImagePreview(file, url) {
    // Create preview container if it doesn't exist
    let preview = document.querySelector('#imagePreview');
    if (!preview) {
        preview = document.createElement('div');
        preview.id = 'imagePreview';
        const fileInput = safeGetElement('letestupdateimage');
        if (fileInput && fileInput.parentElement) {
            fileInput.parentElement.appendChild(preview);
        }
    }
    
    const imageUrl = url || URL.createObjectURL(file);
    
    preview.innerHTML = `
        <div class="d-flex align-items-center mt-3 p-3 border rounded bg-light">
            <img src="${imageUrl}" alt="Preview" class="image-preview me-3" 
                 style="max-width: 80px; max-height: 60px; object-fit: cover; border-radius: 6px; border: 2px solid #28a745;">
            <div class="flex-grow-1">
                <p class="mb-1 fw-medium text-success">
                    <i class="bx bx-check-circle me-1"></i>
                    ${file?.name || 'Current Image'}
                </p>
                ${file ? `<small class="text-muted">Size: ${(file.size / 1024 / 1024).toFixed(2)} MB</small>` : ''}
                <div class="mt-2">
                    <button type="button" class="btn btn-sm btn-outline-danger" onclick="removeImage()">
                        <i class="bx bx-trash"></i> Remove
                    </button>
                </div>
            </div>
        </div>
    `;
}

function removeImage() {
    const fileInput = safeGetElement('letestupdateimage');
    
    if (fileInput) fileInput.value = '';
    
    uploadedImageUrl = '';
    
    // Clear preview
    const preview = document.querySelector('#imagePreview');
    if (preview) preview.innerHTML = '';
    
    // Show removal message
    showToastMessage('Image removed successfully', 'success');
}

// ENHANCED Form submission handler - FIXED for your form ID
async function handleFormSubmit(e) {
    console.log('Form submit event triggered');
    e.preventDefault();
    e.stopPropagation();
    
    const submitBtn = safeGetElement('submitBtn');
    
    // Validate required fields
    if (!validateForm()) {
        return;
    }
    
    // Show loading state
    setSubmitButtonLoading(true);
    
    try {
        // Prepare payload with uploaded image URL
        const payload = {
            letestupdatetitle: (safeGetElement('letestupdatetitle')?.value || '').trim(),
            letestupdatedesc: (safeGetElement('letestupdatedesc')?.value || '').trim(),
            letestupdateimage: uploadedImageUrl, // This contains the uploaded URL from API
            status: safeGetElement('status')?.value || ''
        };
        
        console.log('Form data collected:', payload);

        // Add ID if editing
        const idElement = safeGetElement('letestupdateid');
        const id = idElement?.value;
        if (id) {
            payload.letestupdateid = parseInt(id);
        }

        console.log('Final payload with uploaded image URL:', payload);

        // Check if newsService exists
        if (typeof newsService === 'undefined') {
            console.error('newsService is not defined!');
            showToastMessage('News service not available', 'error');
            return;
        }

        // Choose API method based on edit mode
        let response;
        if (isEditMode && id) {
            console.log('Calling newsService.update for ID:', id);
            // Use update API for editing existing news
            response = await newsService.update(id, payload);
        } else {
            console.log('Calling newsService.create...');
            // Use create API for new news
            response = await newsService.create(payload);
        }
        
        console.log('API Response:', response);
        
        if (response && (response.success !== false)) {
            const successMessage = isEditMode ? 'News updated successfully!' : 'News created successfully!';
            
            // Show success toast
            showToastMessage(successMessage, 'success');
            
            // Redirect after short delay
            setTimeout(() => {
                window.location.href = 'news.html';
            }, 2000);
        } else {
            throw new Error(response?.message || 'Failed to save news');
        }
    } catch (error) {
        console.error('Form submission error:', error);
        showToastMessage('Failed to save news. Please try again.', 'error');
    } finally {
        setSubmitButtonLoading(false);
    }
}

function validateForm() {
    const titleElement = safeGetElement('letestupdatetitle');
    const descElement = safeGetElement('letestupdatedesc');
    const statusElement = safeGetElement('status');
    
    const title = titleElement?.value?.trim() || '';
    const description = descElement?.value?.trim() || '';
    const status = statusElement?.value || '';
    
    if (!title) {
        showToastMessage('Please enter a title', 'error');
        titleElement?.focus();
        return false;
    }
    
    if (!description) {
        showToastMessage('Please enter a description', 'error');
        descElement?.focus();
        return false;
    }
    
    if (!status) {
        showToastMessage('Please select a status', 'error');
        statusElement?.focus();
        return false;
    }
    
    return true;
}

function setSubmitButtonLoading(loading) {
    const submitBtn = safeGetElement('submitBtn');
    
    if (!submitBtn) {
        console.log(loading ? 'Form submitting...' : 'Form submission complete');
        return;
    }
    
    if (loading) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
            <span class="spinner-border spinner-border-sm me-2" role="status"></span>
            ${isEditMode ? 'Updating...' : 'Submitting...'}
        `;
    } else {
        submitBtn.disabled = false;
        submitBtn.innerHTML = isEditMode ? 'Update' : 'Submit';
    }
}

// Load existing data for editing
async function loadNewsData(id) {
    try {
        console.log('Loading news data for ID:', id);
        
        const response = await newsService.getById(id);
        
        if (response && response.data) {
            const newsData = response.data;
            
            // Populate form fields safely
            const idElement = safeGetElement('letestupdateid');
            const titleElement = safeGetElement('letestupdatetitle');
            const descElement = safeGetElement('letestupdatedesc');
            const statusElement = safeGetElement('status');
            
            if (idElement) idElement.value = newsData.letestupdateid || id;
            if (titleElement) titleElement.value = newsData.letestupdatetitle || '';
            if (descElement) descElement.value = newsData.letestupdatedesc || '';
            if (statusElement) statusElement.value = newsData.status || '';
            
            if (newsData.letestupdateimage) {
                uploadedImageUrl = newsData.letestupdateimage;
                
                // Show existing image preview
                showImagePreview(null, newsData.letestupdateimage);
            }
            
            // Update form title and button text for edit mode
            const submitBtn = safeGetElement('submitBtn');
            if (submitBtn) submitBtn.textContent = 'Update';
            
            // Change page title or heading if exists
            const pageTitle = document.querySelector('h1, h2, h3, .card-title, .page-title');
            if (pageTitle) pageTitle.textContent = 'Edit News';
            
            isEditMode = true;
            
            console.log('Edit mode activated for ID:', id);
            showToastMessage('News data loaded for editing', 'success');
        }
    } catch (error) {
        console.error('Error loading news data:', error);
        showToastMessage('Failed to load news data', 'error');
    }
}

// Enhanced alert helper function (kept for compatibility)
function showAlert(message, type = 'info') {
    showToastMessage(message, type);
}

// Initialize form when DOM is loaded - FIXED for your form ID
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing news form...');
    
    // Set up form submission handler - FIXED ID
    const form = safeGetElement('letestupdatesform');
    if (form) {
        // Remove any existing event listeners
        form.removeEventListener('submit', handleFormSubmit);
        
        // Add event listener
        form.addEventListener('submit', handleFormSubmit);
        
        // Also add onclick to submit button as backup
        const submitBtn = safeGetElement('submitBtn');
        if (submitBtn) {
            submitBtn.onclick = function(e) {
                e.preventDefault();
                console.log('Submit button clicked');
                handleFormSubmit(e);
                return false;
            };
        }
        
        console.log('Form submission handler attached to letestupdatesform');
    } else {
        console.warn('Form with id="letestupdatesform" not found');
    }
    
    // Check if editing existing news
    const urlParams = new URLSearchParams(window.location.search);
    const newsId = urlParams.get('id');
    
    if (newsId) {
        loadNewsData(newsId);
    }
    
    // Set up file input change handler
    const fileInput = safeGetElement('letestupdateimage');
    if (fileInput) {
        fileInput.addEventListener('change', function() {
            handleImageUpload(this);
        });
        console.log('File input handler attached');
    } else {
        console.warn('File input not found - make sure it has id="letestupdateimage"');
    }
    
    
});

// Export functions for global access
window.handleImageUpload = handleImageUpload;
window.removeImage = removeImage;
window.handleFormSubmit = handleFormSubmit;























// // Complete JavaScript for letestupdatesform
// let uploadedImageUrl = '';
// let isEditMode = false;

// // Safe DOM element getter
// function safeGetElement(id) {
//     const element = document.getElementById(id);
//     if (!element) {
//         console.warn(`Element with ID '${id}' not found`);
//     }
//     return element;
// }

// // ENHANCED Image upload handler - handles your API response format
// async function handleImageUpload(input) {
//     const file = input.files[0];
//     if (!file) return;

//     // Validate file type
//     if (!file.type.startsWith('image/')) {
//         showToastMessage('Please select an image file', 'error');
//         input.value = '';
//         return;
//     }

//     // Validate file size (5MB)
//     if (file.size > 5 * 1024 * 1024) {
//         showToastMessage('File size must be less than 5MB', 'error');
//         input.value = '';
//         return;
//     }

//     try {
//         // Show loader
//         showUploadLoader();
        
//         // Create FormData for upload
//         const formData = new FormData();
//         formData.append('files', file);

//         console.log('Uploading image...');
//         const response = await galleryServices.uploadimage(formData);
        
//         console.log('Upload response:', response);
        
//         // Handle your actual API response format
//         // Your API returns: { status: 200, message: "...", uploadedUrls: ["https://..."] }
//         if (response && response.status === 200 && response.uploadedUrls && response.uploadedUrls.length > 0) {
//             // Get the first uploaded URL
//             uploadedImageUrl = response.uploadedUrls[0];
            
//             // Hide loader and show success
//             hideUploadLoader();
//             showImagePreview(file, uploadedImageUrl);
            
//             console.log('Image uploaded successfully:', uploadedImageUrl);
            
//             // Show green success message
//             showToastMessage(response.message || 'Image uploaded successfully!', 'success');
            
//         } else {
//             // Handle different error cases
//             let errorMessage = 'Upload failed';
            
//             if (response && response.message) {
//                 errorMessage = response.message;
//             } else if (response && response.status && response.status !== 200) {
//                 errorMessage = `Upload failed with status: ${response.status}`;
//             } else if (response && !response.uploadedUrls) {
//                 errorMessage = 'No upload URLs received from server';
//             }
            
//             throw new Error(errorMessage);
//         }
//     } catch (error) {
//         console.error('Image upload error:', error);
        
//         // Hide loader and show error
//         hideUploadLoader();
        
//         // Show specific error message
//         const errorMessage = error.message || 'Failed to upload image. Please try again.';
//         showToastMessage(errorMessage, 'error');
        
//         input.value = '';
//     }
// }

// // Enhanced loader functions
// function showUploadLoader() {
//     // Find the file input container
//     const fileInput = safeGetElement('letestupdateimage');
//     const uploadContainer = fileInput ? fileInput.closest('.col-md-6') : null;
    
//     if (uploadContainer) {
//         // Remove any existing loader
//         const existingLoader = uploadContainer.querySelector('.upload-loader-overlay');
//         if (existingLoader) existingLoader.remove();
        
//         // Create loader overlay
//         const loaderOverlay = document.createElement('div');
//         loaderOverlay.className = 'upload-loader-overlay';
//         loaderOverlay.innerHTML = `
//             <div class="upload-loader-content">
//                 <div class="spinner-border text-primary mb-2" role="status">
//                     <span class="visually-hidden">Uploading...</span>
//                 </div>
//                 <p class="mb-0 text-primary fw-medium">Uploading image...</p>
//                 <small class="text-muted">Please wait while we upload your file</small>
//             </div>
//         `;
        
//         // Add styles
//         loaderOverlay.style.cssText = `
//             position: absolute;
//             top: 0;
//             left: 0;
//             right: 0;
//             bottom: 0;
//             background: rgba(255, 255, 255, 0.95);
//             display: flex;
//             align-items: center;
//             justify-content: center;
//             z-index: 1000;
//             border-radius: 8px;
//             backdrop-filter: blur(2px);
//         `;
        
//         uploadContainer.style.position = 'relative';
//         uploadContainer.appendChild(loaderOverlay);
//     }
    
//     // Disable file input during upload
//     const fileInputElement = safeGetElement('letestupdateimage');
//     if (fileInputElement) fileInputElement.disabled = true;
// }

// function hideUploadLoader() {
//     // Remove loader overlay
//     const loaderOverlay = document.querySelector('.upload-loader-overlay');
//     if (loaderOverlay) {
//         loaderOverlay.remove();
//     }
    
//     // Re-enable file input
//     const fileInput = safeGetElement('letestupdateimage');
//     if (fileInput) fileInput.disabled = false;
// }

// // Enhanced toast message system
// function showToastMessage(message, type = 'info') {
//     // Remove any existing toasts
//     const existingToasts = document.querySelectorAll('.upload-toast');
//     existingToasts.forEach(toast => toast.remove());
    
//     // Create toast container if it doesn't exist
//     let toastContainer = document.querySelector('.upload-toast-container');
//     if (!toastContainer) {
//         toastContainer = document.createElement('div');
//         toastContainer.className = 'upload-toast-container';
//         toastContainer.style.cssText = `
//             position: fixed;
//             top: 20px;
//             right: 20px;
//             z-index: 9999;
//             min-width: 300px;
//         `;
//         document.body.appendChild(toastContainer);
//     }
    
//     // Create toast
//     const toast = document.createElement('div');
//     toast.className = `upload-toast alert alert-${type === 'error' ? 'danger' : 'success'} alert-dismissible fade show`;
//     toast.innerHTML = `
//         <div class="d-flex align-items-center">
//             <i class="bx bx-${type === 'error' ? 'error' : 'check'}-circle me-2 fs-5"></i>
//             <div class="flex-grow-1">
//                 <strong>${type === 'error' ? 'Error' : 'Success'}!</strong>
//                 <div>${message}</div>
//             </div>
//             <button type="button" class="btn-close" onclick="this.closest('.upload-toast').remove()"></button>
//         </div>
//     `;
    
//     // Add animation styles
//     toast.style.cssText = `
//         margin-bottom: 10px;
//         box-shadow: 0 4px 12px rgba(0,0,0,0.15);
//         border: none;
//         animation: slideInRight 0.3s ease-out;
//     `;
    
//     // Add CSS animation if not already added
//     if (!document.querySelector('#toast-animations')) {
//         const style = document.createElement('style');
//         style.id = 'toast-animations';
//         style.textContent = `
//             @keyframes slideInRight {
//                 from { transform: translateX(100%); opacity: 0; }
//                 to { transform: translateX(0); opacity: 1; }
//             }
//             @keyframes slideOutRight {
//                 from { transform: translateX(0); opacity: 1; }
//                 to { transform: translateX(100%); opacity: 0; }
//             }
//         `;
//         document.head.appendChild(style);
//     }
    
//     toastContainer.appendChild(toast);
    
//     // Auto-remove success messages after 4 seconds
//     if (type === 'success') {
//         setTimeout(() => {
//             if (toast.parentElement) {
//                 toast.style.animation = 'slideOutRight 0.3s ease-in';
//                 setTimeout(() => toast.remove(), 300);
//             }
//         }, 4000);
//     }
    
//     // Log to console
//     console.log(`${type.toUpperCase()}: ${message}`);
// }

// function showImagePreview(file, url) {
//     // Create preview container if it doesn't exist
//     let preview = document.querySelector('#imagePreview');
//     if (!preview) {
//         preview = document.createElement('div');
//         preview.id = 'imagePreview';
//         const fileInput = safeGetElement('letestupdateimage');
//         if (fileInput && fileInput.parentElement) {
//             fileInput.parentElement.appendChild(preview);
//         }
//     }
    
//     const imageUrl = url || URL.createObjectURL(file);
    
//     preview.innerHTML = `
//         <div class="d-flex align-items-center mt-3 p-3 border rounded bg-light">
//             <img src="${imageUrl}" alt="Preview" class="image-preview me-3" 
//                  style="max-width: 80px; max-height: 60px; object-fit: cover; border-radius: 6px; border: 2px solid #28a745;">
//             <div class="flex-grow-1">
//                 <p class="mb-1 fw-medium text-success">
//                     <i class="bx bx-check-circle me-1"></i>
//                     ${file?.name || 'Current Image'}
//                 </p>
//                 ${file ? `<small class="text-muted">Size: ${(file.size / 1024 / 1024).toFixed(2)} MB</small>` : ''}
//                 <div class="mt-2">
//                     <button type="button" class="btn btn-sm btn-outline-danger" onclick="removeImage()">
//                         <i class="bx bx-trash"></i> Remove
//                     </button>
//                 </div>
//             </div>
//         </div>
//     `;
// }

// function removeImage() {
//     const fileInput = safeGetElement('letestupdateimage');
    
//     if (fileInput) fileInput.value = '';
    
//     uploadedImageUrl = '';
    
//     // Clear preview
//     const preview = document.querySelector('#imagePreview');
//     if (preview) preview.innerHTML = '';
    
//     // Show removal message
//     showToastMessage('Image removed successfully', 'success');
// }

// // ENHANCED Form submission handler - FIXED for your form ID
// async function handleFormSubmit(e) {
//     console.log('Form submit event triggered');
//     e.preventDefault();
//     e.stopPropagation();
    
//     const submitBtn = safeGetElement('submitBtn');
    
//     // Validate required fields
//     if (!validateForm()) {
//         return;
//     }
    
//     // Show loading state
//     setSubmitButtonLoading(true);
    
//     try {
//         // Prepare payload with uploaded image URL
//         const payload = {
//             letestupdatetitle: (safeGetElement('letestupdatetitle')?.value || '').trim(),
//             letestupdatedesc: (safeGetElement('letestupdatedesc')?.value || '').trim(),
//             letestupdateimage: uploadedImageUrl, // This contains the uploaded URL from API
//             status: safeGetElement('status')?.value || ''
//         };
        
//         console.log('Form data collected:', payload);

//         // Add ID if editing
//         const idElement = safeGetElement('letestupdateid');
//         const id = idElement?.value;
//         if (id) {
//             payload.letestupdateid = parseInt(id);
//         }

//         console.log('Final payload with uploaded image URL:', payload);

//         // Check if newsService exists
//         if (typeof newsService === 'undefined') {
//             console.error('newsService is not defined!');
//             showToastMessage('News service not available', 'error');
//             return;
//         }

//         console.log('Calling newsService.create...');
        
//         // Submit to API
//         const response = await newsService.create(payload);
        
//         console.log('API Response:', response);
        
//         if (response && (response.success !== false)) {
//             const successMessage = isEditMode ? 'News updated successfully!' : 'News created successfully!';
            
//             // Show success toast
//             showToastMessage(successMessage, 'success');
            
//             // Redirect after short delay
//             setTimeout(() => {
//                 window.location.href = 'news.html';
//             }, 2000);
//         } else {
//             throw new Error(response?.message || 'Failed to save news');
//         }
//     } catch (error) {
//         console.error('Form submission error:', error);
//         showToastMessage('Failed to save news. Please try again.', 'error');
//     } finally {
//         setSubmitButtonLoading(false);
//     }
// }

// function validateForm() {
//     const titleElement = safeGetElement('letestupdatetitle');
//     const descElement = safeGetElement('letestupdatedesc');
//     const statusElement = safeGetElement('status');
    
//     const title = titleElement?.value?.trim() || '';
//     const description = descElement?.value?.trim() || '';
//     const status = statusElement?.value || '';
    
//     if (!title) {
//         showToastMessage('Please enter a title', 'error');
//         titleElement?.focus();
//         return false;
//     }
    
//     if (!description) {
//         showToastMessage('Please enter a description', 'error');
//         descElement?.focus();
//         return false;
//     }
    
//     if (!status) {
//         showToastMessage('Please select a status', 'error');
//         statusElement?.focus();
//         return false;
//     }
    
//     return true;
// }

// function setSubmitButtonLoading(loading) {
//     const submitBtn = safeGetElement('submitBtn');
    
//     if (!submitBtn) {
//         console.log(loading ? 'Form submitting...' : 'Form submission complete');
//         return;
//     }
    
//     if (loading) {
//         submitBtn.disabled = true;
//         submitBtn.innerHTML = `
//             <span class="spinner-border spinner-border-sm me-2" role="status"></span>
//             ${isEditMode ? 'Updating...' : 'Submitting...'}
//         `;
//     } else {
//         submitBtn.disabled = false;
//         submitBtn.innerHTML = isEditMode ? 'Update' : 'Submit';
//     }
// }

// // Load existing data for editing
// async function loadNewsData(id) {
//     try {
//         console.log('Loading news data for ID:', id);
        
//         const response = await newsService.getById(id);
        
//         if (response && response.data) {
//             const newsData = response.data;
            
//             // Populate form fields safely
//             const idElement = safeGetElement('letestupdateid');
//             const titleElement = safeGetElement('letestupdatetitle');
//             const descElement = safeGetElement('letestupdatedesc');
//             const statusElement = safeGetElement('status');
            
//             if (idElement) idElement.value = newsData.letestupdateid;
//             if (titleElement) titleElement.value = newsData.letestupdatetitle || '';
//             if (descElement) descElement.value = newsData.letestupdatedesc || '';
//             if (statusElement) statusElement.value = newsData.status || '';
            
//             if (newsData.letestupdateimage) {
//                 uploadedImageUrl = newsData.letestupdateimage;
                
//                 // Show existing image preview
//                 showImagePreview(null, newsData.letestupdateimage);
//             }
            
//             // Update form title and button text
//             const submitBtn = safeGetElement('submitBtn');
//             if (submitBtn) submitBtn.textContent = 'Update';
//             isEditMode = true;
            
//             showToastMessage('News data loaded for editing', 'success');
//         }
//     } catch (error) {
//         console.error('Error loading news data:', error);
//         showToastMessage('Failed to load news data', 'error');
//     }
// }

// // Enhanced alert helper function (kept for compatibility)
// function showAlert(message, type = 'info') {
//     showToastMessage(message, type);
// }

// // Initialize form when DOM is loaded - FIXED for your form ID
// document.addEventListener('DOMContentLoaded', function() {
//     console.log('Initializing news form...');
    
//     // Set up form submission handler - FIXED ID
//     const form = safeGetElement('letestupdatesform');
//     if (form) {
//         // Remove any existing event listeners
//         form.removeEventListener('submit', handleFormSubmit);
        
//         // Add event listener
//         form.addEventListener('submit', handleFormSubmit);
        
//         // Also add onclick to submit button as backup
//         const submitBtn = safeGetElement('submitBtn');
//         if (submitBtn) {
//             submitBtn.onclick = function(e) {
//                 e.preventDefault();
//                 console.log('Submit button clicked');
//                 handleFormSubmit(e);
//                 return false;
//             };
//         }
        
//         console.log('Form submission handler attached to letestupdatesform');
//     } else {
//         console.warn('Form with id="letestupdatesform" not found');
//     }
    
//     // Check if editing existing news
//     const urlParams = new URLSearchParams(window.location.search);
//     const newsId = urlParams.get('id');
    
//     if (newsId) {
//         loadNewsData(newsId);
//     }
    
//     // Set up file input change handler
//     const fileInput = safeGetElement('letestupdateimage');
//     if (fileInput) {
//         fileInput.addEventListener('change', function() {
//             handleImageUpload(this);
//         });
//         console.log('File input handler attached');
//     } else {
//         console.warn('File input not found - make sure it has id="letestupdateimage"');
//     }
    
   
// });

// // Export functions for global access
// window.handleImageUpload = handleImageUpload;
// window.removeImage = removeImage;
// window.handleFormSubmit = handleFormSubmit;









// // let isEditMode = false;

// // // Safe DOM element getter
// // function safeGetElement(id) {
// //     const element = document.getElementById(id);
// //     if (!element) {
// //         console.warn(`Element with ID '${id}' not found`);
// //     }
// //     return element;
// // }

// // // ENHANCED Image upload handler with proper loader and success flow
// // async function handleImageUpload(input) {
// //     const file = input.files[0];
// //     if (!file) return;

// //     // Validate file type
// //     if (!file.type.startsWith('image/')) {
// //         showToastMessage('Please select an image file', 'error');
// //         input.value = '';
// //         return;
// //     }

// //     // Validate file size (5MB)
// //     if (file.size > 5 * 1024 * 1024) {
// //         showToastMessage('File size must be less than 5MB', 'error');
// //         input.value = '';
// //         return;
// //     }

// //     try {
// //         // Show loader
// //         showUploadLoader();
        
// //         // Create FormData for upload
// //         const formData = new FormData();
// //         formData.append('files', file);

// //         console.log('Uploading image...');
// //         const response = await galleryServices.uploadimage(formData);
        
// //         console.log('Upload response:', response);
        
// //         // Handle your actual API response format
// //         if (response && response.status === 200 && response.uploadedUrls && response.uploadedUrls.length > 0) {
// //             // Get the first uploaded URL
// //             uploadedImageUrl = response.uploadedUrls[0];
            
// //             const uploadedImageInput = safeGetElement('uploadedImageUrl');
// //             if (uploadedImageInput) {
// //                 uploadedImageInput.value = uploadedImageUrl;
// //             }
            
// //             // Hide loader and show success
// //             hideUploadLoader();
// //             showImagePreview(file, uploadedImageUrl);
            
// //             console.log('Image uploaded successfully:', uploadedImageUrl);
            
// //             // Show green success message
// //             showToastMessage(response.message || 'Image uploaded successfully!', 'success');
            
// //         } else {
// //             // Handle different error cases
// //             let errorMessage = 'Upload failed';
            
// //             if (response && response.message) {
// //                 errorMessage = response.message;
// //             } else if (response && response.status && response.status !== 200) {
// //                 errorMessage = `Upload failed with status: ${response.status}`;
// //             } else if (response && !response.uploadedUrls) {
// //                 errorMessage = 'No upload URLs received from server';
// //             }
            
// //             throw new Error(errorMessage);
// //         }
// //     } catch (error) {
// //         console.error('Image upload error:', error);
        
// //         // Hide loader and show error
// //         hideUploadLoader();
        
// //         // Show specific error message
// //         const errorMessage = error.message || 'Failed to upload image. Please try again.';
// //         showToastMessage(errorMessage, 'error');
        
// //         resetUploadArea();
// //         input.value = '';
// //     }
// // }

// // // Enhanced loader functions
// // function showUploadLoader() {
// //     // Create and show a prominent loader overlay
// //     const uploadContainer = document.querySelector('.upload-container') || 
// //                            document.querySelector('.col-md-6:has(#letestupdateimage)') ||
// //                            document.querySelector('#letestupdateimage').closest('.col-md-6');
    
// //     if (uploadContainer) {
// //         // Remove any existing loader
// //         const existingLoader = uploadContainer.querySelector('.upload-loader-overlay');
// //         if (existingLoader) existingLoader.remove();
        
// //         // Create loader overlay
// //         const loaderOverlay = document.createElement('div');
// //         loaderOverlay.className = 'upload-loader-overlay';
// //         loaderOverlay.innerHTML = `
// //             <div class="upload-loader-content">
// //                 <div class="spinner-border text-primary mb-2" role="status">
// //                     <span class="visually-hidden">Uploading...</span>
// //                 </div>
// //                 <p class="mb-0 text-primary fw-medium">Uploading image...</p>
// //                 <small class="text-muted">Please wait while we upload your file</small>
// //             </div>
// //         `;
        
// //         // Add styles
// //         loaderOverlay.style.cssText = `
// //             position: absolute;
// //             top: 0;
// //             left: 0;
// //             right: 0;
// //             bottom: 0;
// //             background: rgba(255, 255, 255, 0.95);
// //             display: flex;
// //             align-items: center;
// //             justify-content: center;
// //             z-index: 1000;
// //             border-radius: 8px;
// //             backdrop-filter: blur(2px);
// //         `;
        
// //         uploadContainer.style.position = 'relative';
// //         uploadContainer.appendChild(loaderOverlay);
// //     }
    
// //     // Disable file input during upload
// //     const fileInput = safeGetElement('letestupdateimage');
// //     if (fileInput) fileInput.disabled = true;
// // }

// // function hideUploadLoader() {
// //     // Remove loader overlay
// //     const loaderOverlay = document.querySelector('.upload-loader-overlay');
// //     if (loaderOverlay) {
// //         loaderOverlay.remove();
// //     }
    
// //     // Re-enable file input
// //     const fileInput = safeGetElement('letestupdateimage');
// //     if (fileInput) fileInput.disabled = false;
// // }

// // // Enhanced toast message system
// // function showToastMessage(message, type = 'info') {
// //     // Remove any existing toasts
// //     const existingToasts = document.querySelectorAll('.upload-toast');
// //     existingToasts.forEach(toast => toast.remove());
    
// //     // Create toast container if it doesn't exist
// //     let toastContainer = document.querySelector('.upload-toast-container');
// //     if (!toastContainer) {
// //         toastContainer = document.createElement('div');
// //         toastContainer.className = 'upload-toast-container';
// //         toastContainer.style.cssText = `
// //             position: fixed;
// //             top: 20px;
// //             right: 20px;
// //             z-index: 9999;
// //             min-width: 300px;
// //         `;
// //         document.body.appendChild(toastContainer);
// //     }
    
// //     // Create toast
// //     const toast = document.createElement('div');
// //     toast.className = `upload-toast alert alert-${type === 'error' ? 'danger' : 'success'} alert-dismissible fade show`;
// //     toast.innerHTML = `
// //         <div class="d-flex align-items-center">
// //             <i class="bx bx-${type === 'error' ? 'error' : 'check'}-circle me-2 fs-5"></i>
// //             <div class="flex-grow-1">
// //                 <strong>${type === 'error' ? 'Error' : 'Success'}!</strong>
// //                 <div>${message}</div>
// //             </div>
// //             <button type="button" class="btn-close" onclick="this.closest('.upload-toast').remove()"></button>
// //         </div>
// //     `;
    
// //     // Add animation styles
// //     toast.style.cssText = `
// //         margin-bottom: 10px;
// //         box-shadow: 0 4px 12px rgba(0,0,0,0.15);
// //         border: none;
// //         animation: slideInRight 0.3s ease-out;
// //     `;
    
// //     // Add CSS animation if not already added
// //     if (!document.querySelector('#toast-animations')) {
// //         const style = document.createElement('style');
// //         style.id = 'toast-animations';
// //         style.textContent = `
// //             @keyframes slideInRight {
// //                 from { transform: translateX(100%); opacity: 0; }
// //                 to { transform: translateX(0); opacity: 1; }
// //             }
// //             @keyframes slideOutRight {
// //                 from { transform: translateX(0); opacity: 1; }
// //                 to { transform: translateX(100%); opacity: 0; }
// //             }
// //         `;
// //         document.head.appendChild(style);
// //     }
    
// //     toastContainer.appendChild(toast);
    
// //     // Auto-remove success messages after 4 seconds
// //     if (type === 'success') {
// //         setTimeout(() => {
// //             if (toast.parentElement) {
// //                 toast.style.animation = 'slideOutRight 0.3s ease-in';
// //                 setTimeout(() => toast.remove(), 300);
// //             }
// //         }, 4000);
// //     }
    
// //     // Log to console
// //     console.log(`${type.toUpperCase()}: ${message}`);
// // }

// // // Safe upload state management (kept for compatibility)
// // function showUploadProgress() {
// //     const uploadContent = safeGetElement('uploadContent');
// //     const uploadProgress = safeGetElement('uploadProgress');
// //     const uploadSuccess = safeGetElement('uploadSuccess');
// //     const uploadArea = document.querySelector('.upload-area');
    
// //     if (uploadContent) uploadContent.classList.add('d-none');
// //     if (uploadProgress) uploadProgress.classList.remove('d-none');
// //     if (uploadSuccess) uploadSuccess.classList.add('d-none');
// //     if (uploadArea) uploadArea.classList.add('uploading');
// // }

// // function showUploadSuccess() {
// //     const uploadContent = safeGetElement('uploadContent');
// //     const uploadProgress = safeGetElement('uploadProgress');
// //     const uploadSuccess = safeGetElement('uploadSuccess');
// //     const uploadArea = document.querySelector('.upload-area');
    
// //     if (uploadContent) uploadContent.classList.add('d-none');
// //     if (uploadProgress) uploadProgress.classList.add('d-none');
// //     if (uploadSuccess) uploadSuccess.classList.remove('d-none');
// //     if (uploadArea) uploadArea.classList.remove('uploading');
// // }

// // function resetUploadArea() {
// //     const uploadContent = safeGetElement('uploadContent');
// //     const uploadProgress = safeGetElement('uploadProgress');
// //     const uploadSuccess = safeGetElement('uploadSuccess');
// //     const uploadArea = document.querySelector('.upload-area');
// //     const imagePreview = safeGetElement('imagePreview');
    
// //     if (uploadContent) uploadContent.classList.remove('d-none');
// //     if (uploadProgress) uploadProgress.classList.add('d-none');
// //     if (uploadSuccess) uploadSuccess.classList.add('d-none');
// //     if (uploadArea) uploadArea.classList.remove('uploading');
// //     if (imagePreview) imagePreview.innerHTML = '';
// // }

// // function showImagePreview(file, url) {
// //     const preview = safeGetElement('imagePreview');
// //     if (!preview) {
// //         console.log('Image preview element not found, showing filename:', file?.name);
// //         return;
// //     }
    
// //     const imageUrl = url || URL.createObjectURL(file);
    
// //     preview.innerHTML = `
// //         <div class="d-flex align-items-center mt-3 p-3 border rounded bg-light">
// //             <img src="${imageUrl}" alt="Preview" class="image-preview me-3" 
// //                  style="max-width: 80px; max-height: 60px; object-fit: cover; border-radius: 6px; border: 2px solid #28a745;">
// //             <div class="flex-grow-1">
// //                 <p class="mb-1 fw-medium text-success">
// //                     <i class="bx bx-check-circle me-1"></i>
// //                     ${file?.name || 'Current Image'}
// //                 </p>
// //                 ${file ? `<small class="text-muted">Size: ${(file.size / 1024 / 1024).toFixed(2)} MB</small>` : ''}
// //                 <div class="mt-2">
// //                     <button type="button" class="btn btn-sm btn-outline-danger" onclick="removeImage()">
// //                         <i class="bx bx-trash"></i> Remove
// //                     </button>
// //                 </div>
// //             </div>
// //         </div>
// //     `;
// // }

// // function removeImage() {
// //     const fileInput = safeGetElement('letestupdateimage');
// //     const uploadedImageInput = safeGetElement('uploadedImageUrl');
    
// //     if (fileInput) fileInput.value = '';
// //     if (uploadedImageInput) uploadedImageInput.value = '';
    
// //     uploadedImageUrl = '';
// //     resetUploadArea();
    
// //     // Clear preview
// //     const preview = safeGetElement('imagePreview');
// //     if (preview) preview.innerHTML = '';
    
// //     // Show removal message
// //     showToastMessage('Image removed successfully', 'success');
// // }

// // // ENHANCED Form submission handler with proper upload URL handling
// // async function handleFormSubmit(e) {
// //     e.preventDefault();
    
// //     const submitBtn = safeGetElement('submitBtn');
    
// //     // Validate required fields
// //     if (!validateForm()) {
// //         return;
// //     }
    
// //     // Show loading state
// //     setSubmitButtonLoading(true);
    
// //     try {
// //         // Prepare payload with uploaded image URL
// //         const payload = {
// //             letestupdatetitle: (safeGetElement('letestupdatetitle')?.value || '').trim(),
// //             letestupdatedesc: (safeGetElement('letestupdatedesc')?.value || '').trim(),
// //             letestupdateimage: uploadedImageUrl, // This contains the uploaded URL from API
// //             status: safeGetElement('status')?.value || ''
// //         };
// // console.log(payload,"payload")
// //         // Add ID if editing
// //         const idElement = safeGetElement('letestupdateid');
// //         const id = idElement?.value;
// //         if (id) {
// //             payload.letestupdateid = parseInt(id);
// //         }

// //         console.log('Submitting payload with uploaded image URL:', payload);

// //         // Submit to API
// //         const response = await newsService.create(payload);
        
// //         if (response && (response.success !== false)) {
// //             const successMessage = isEditMode ? 'News updated successfully!' : 'News created successfully!';
            
// //             // Show success toast
// //             showToastMessage(successMessage, 'success');
            
// //             // Redirect after short delay
// //             setTimeout(() => {
// //                 window.location.href = 'listallnews.html';
// //             }, 2000);
// //         } else {
// //             throw new Error(response?.message || 'Failed to save news');
// //         }
// //     } catch (error) {
// //         console.error('Form submission error:', error);
// //         showToastMessage('Failed to save news. Please try again.', 'error');
// //     } finally {
// //         setSubmitButtonLoading(false);
// //     }
// // }

// // function validateForm() {
// //     const titleElement = safeGetElement('letestupdatetitle');
// //     const descElement = safeGetElement('letestupdatedesc');
// //     const statusElement = safeGetElement('status');
    
// //     const title = titleElement?.value?.trim() || '';
// //     const description = descElement?.value?.trim() || '';
// //     const status = statusElement?.value || '';
    
// //     if (!title) {
// //         showToastMessage('Please enter a title', 'error');
// //         titleElement?.focus();
// //         return false;
// //     }
    
// //     if (!description) {
// //         showToastMessage('Please enter a description', 'error');
// //         descElement?.focus();
// //         return false;
// //     }
    
// //     if (!status) {
// //         showToastMessage('Please select a status', 'error');
// //         statusElement?.focus();
// //         return false;
// //     }
    
// //     return true;
// // }

// // function setSubmitButtonLoading(loading) {
// //     const submitBtn = safeGetElement('submitBtn');
// //     const submitBtnText = safeGetElement('submitBtnText');
// //     const submitSpinner = safeGetElement('submitSpinner');
    
// //     if (!submitBtn) {
// //         console.log(loading ? 'Form submitting...' : 'Form submission complete');
// //         return;
// //     }
    
// //     if (loading) {
// //         submitBtn.disabled = true;
// //         if (submitBtnText) submitBtnText.textContent = isEditMode ? 'Updating...' : 'Submitting...';
// //         if (submitSpinner) submitSpinner.classList.remove('d-none');
// //     } else {
// //         submitBtn.disabled = false;
// //         if (submitBtnText) submitBtnText.textContent = isEditMode ? 'Update' : 'Submit';
// //         if (submitSpinner) submitSpinner.classList.add('d-none');
// //     }
// // }

// // // Load existing data for editing
// // async function loadNewsData(id) {
// //     try {
// //         console.log('Loading news data for ID:', id);
        
// //         const response = await newsService.getById(id);
        
// //         if (response && response.data) {
// //             const newsData = response.data;
            
// //             // Populate form fields safely
// //             const idElement = safeGetElement('letestupdateid');
// //             const titleElement = safeGetElement('letestupdatetitle');
// //             const descElement = safeGetElement('letestupdatedesc');
// //             const statusElement = safeGetElement('status');
            
// //             if (idElement) idElement.value = newsData.letestupdateid;
// //             if (titleElement) titleElement.value = newsData.letestupdatetitle || '';
// //             if (descElement) descElement.value = newsData.letestupdatedesc || '';
// //             if (statusElement) statusElement.value = newsData.status || '';
            
// //             if (newsData.letestupdateimage) {
// //                 uploadedImageUrl = newsData.letestupdateimage;
// //                 const uploadedImageInput = safeGetElement('uploadedImageUrl');
// //                 if (uploadedImageInput) {
// //                     uploadedImageInput.value = uploadedImageUrl;
// //                 }
                
// //                 // Show existing image preview
// //                 showImagePreview(null, newsData.letestupdateimage);
// //                 showUploadSuccess();
// //             }
            
// //             // Update form title and button text
// //             const cardHeader = document.querySelector('.card-header h4');
// //             const submitBtnText = safeGetElement('submitBtnText');
            
// //             if (cardHeader) cardHeader.textContent = 'Edit News';
// //             if (submitBtnText) submitBtnText.textContent = 'Update';
// //             isEditMode = true;
            
// //             showToastMessage('News data loaded for editing', 'success');
// //         }
// //     } catch (error) {
// //         console.error('Error loading news data:', error);
// //         showToastMessage('Failed to load news data', 'error');
// //     }
// // }

// // // Enhanced alert helper function (kept for compatibility)
// // function showAlert(message, type = 'info') {
// //     showToastMessage(message, type);
// // }

// // // Initialize form when DOM is loaded
// // document.addEventListener('DOMContentLoaded', function() {
// //     console.log('Initializing news form...');
    
// //     // Set up form submission handler
// //     const form = safeGetElement('newsform');
// //     if (form) {
// //         form.addEventListener('submit', handleFormSubmit);
// //         console.log('Form submission handler attached');
// //     } else {
// //         console.warn('News form not found - make sure the form has id="newsform"');
// //     }
    
// //     // Check if editing existing news
// //     const urlParams = new URLSearchParams(window.location.search);
// //     const newsId = urlParams.get('id');
    
// //     if (newsId) {
// //         loadNewsData(newsId);
// //     }
    
// //     // Set up file input change handler
// //     const fileInput = safeGetElement('letestupdateimage');
// //     if (fileInput) {
// //         fileInput.addEventListener('change', function() {
// //             handleImageUpload(this);
// //         });
// //         console.log('File input handler attached');
// //     } else {
// //         console.warn('File input not found - make sure it has id="letestupdateimage"');
// //     }
    
// //     // Show submit button (in case it's hidden by default)
// //     const submitBtn = safeGetElement('submitBtn');
// //     if (submitBtn) {
// //         submitBtn.style.display = 'inline-block';
// //     }
// // });

// // // Export functions for global access
// // window.handleImageUpload = handleImageUpload;
// // window.removeImage = removeImage;