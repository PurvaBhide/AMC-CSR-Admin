// Success Story Form Management with Enhanced Debug - Fixed Version
document.addEventListener("DOMContentLoaded", function() {
    console.log('DOM Content Loaded - Starting initialization');
    
    // Add small delay to ensure all elements are rendered
    setTimeout(() => {
        initializeForm();
        loadDropdownData();
    }, 100);
});

let isEditMode = false;
let currentSuccessStoryId = null;
let uploadedImageUrl = '';

// Initialize form with enhanced debugging
function initializeForm() {
    console.log('=== INITIALIZING FORM ===');
    
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    console.log('URL ID:', id);
    
    // Check if buttons exist with detailed logging
    const submitBtn = document.getElementById('submitBtn');
    const saveBtn = document.getElementById('saveBtn');
    
    console.log('Submit button found:', !!submitBtn);
    console.log('Save button found:', !!saveBtn);
    
    if (submitBtn) {
        console.log('Submit button current display:', window.getComputedStyle(submitBtn).display);
        console.log('Submit button inline style:', submitBtn.style.display);
    }
    
    if (saveBtn) {
        console.log('Save button current display:', window.getComputedStyle(saveBtn).display);
        console.log('Save button inline style:', saveBtn.style.display);
    }
    
    if (!submitBtn || !saveBtn) {
        console.error('CRITICAL ERROR: Buttons not found!');
        console.log('Available elements with IDs:', 
            Array.from(document.querySelectorAll('[id]')).map(el => el.id)
        );
        return;
    }
    
    if (id) {
        console.log('=== EDIT MODE ===');
        // Edit mode
        isEditMode = true;
        currentSuccessStoryId = id;
        
        // Force hide submit button
        submitBtn.style.display = 'none';
        submitBtn.style.visibility = 'hidden';
        submitBtn.hidden = true;
        
        // Force show save button
        saveBtn.style.display = 'inline-block';
        saveBtn.style.visibility = 'visible';
        saveBtn.hidden = false;
        
        console.log('After setting edit mode:');
        console.log('Submit button display:', submitBtn.style.display);
        console.log('Save button display:', saveBtn.style.display);
        
        loadSuccessStoryData(id);
    } else {
        console.log('=== CREATE MODE ===');
        // Add mode
        isEditMode = false;
        
        // Force show submit button
        submitBtn.style.display = 'inline-block';
        submitBtn.style.visibility = 'visible';
        submitBtn.hidden = false;
        
        // Force hide save button
        saveBtn.style.display = 'none';
        saveBtn.style.visibility = 'hidden';
        saveBtn.hidden = true;
        
        console.log('After setting create mode:');
        console.log('Submit button display:', submitBtn.style.display);
        console.log('Save button display:', saveBtn.style.display);
    }
    
    // Final verification after 500ms
    setTimeout(() => {
        console.log('=== FINAL VERIFICATION ===');
        console.log('Submit button computed display:', window.getComputedStyle(submitBtn).display);
        console.log('Save button computed display:', window.getComputedStyle(saveBtn).display);
        console.log('Submit button visible:', submitBtn.offsetWidth > 0 && submitBtn.offsetHeight > 0);
        console.log('Save button visible:', saveBtn.offsetWidth > 0 && saveBtn.offsetHeight > 0);
    }, 500);

    // Setup form submission
    const form = document.getElementById('successStoriesform');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
        console.log('Form event listener added');
    } else {
        console.error('Form not found!');
    }
    
    // Setup image upload
    const imageInput = document.getElementById('successstoryImage');
    if (imageInput) {
        imageInput.addEventListener('change', handleImageUpload);
        console.log('Image input event listener added');
    } else {
        console.error('Image input not found!');
    }
}

// Alternative button control function - call this manually if needed
function forceButtonVisibility() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    const submitBtn = document.getElementById('submitBtn');
    const saveBtn = document.getElementById('saveBtn');
    
    if (!submitBtn || !saveBtn) {
        console.error('Buttons still not found!');
        return;
    }
    
    if (id) {
        // Edit mode - force hide submit, show save
        submitBtn.className = submitBtn.className.replace(/\bd-none\b/g, '').trim();
        saveBtn.className = saveBtn.className.replace(/\bd-none\b/g, '').trim();
        
        submitBtn.style.cssText = 'display: none !important;';
        saveBtn.style.cssText = 'display: inline-block !important;';
        
        console.log('FORCED Edit mode button visibility');
    } else {
        // Create mode - force show submit, hide save
        submitBtn.className = submitBtn.className.replace(/\bd-none\b/g, '').trim();
        saveBtn.className = saveBtn.className.replace(/\bd-none\b/g, '').trim();
        
        submitBtn.style.cssText = 'display: inline-block !important;';
        saveBtn.style.cssText = 'display: none !important;';
        
        console.log('FORCED Create mode button visibility');
    }
}

// Load dropdown data (Categories and NGOs)
function loadDropdownData() {
    loadCategories();
    loadNGOs();
}

// Load categories
function loadCategories() {
    if (typeof CategoryService === 'undefined') {
        console.error('CategoryService not found');
        return;
    }

    CategoryService.listAll()
        .then(response => {
            console.log('Categories loaded:', response);
            populateCategoryDropdown(response);
        })
        .catch(error => {
            console.error('Error loading categories:', error);
            alert('Failed to load categories. Please refresh the page.');
        });
}

// Load NGOs
function loadNGOs() {
    if (typeof NgoService === 'undefined') {
        console.error('NgoService not found');
        return;
    }

    NgoService.listAll(0, 100) // Load first 100 NGOs
        .then(response => {
            console.log('NGOs loaded:', response);
            populateNGODropdown(response);
        })
        .catch(error => {
            console.error('Error loading NGOs:', error);
            alert('Failed to load NGOs. Please refresh the page.');
        });
}

// Populate category dropdown
function populateCategoryDropdown(response) {
    const categorySelect = document.getElementById('categoryId');
    if (!categorySelect) {
        console.error('Category select not found');
        return;
    }
    
    categorySelect.innerHTML = '<option value="">Select Category</option>';

    let categories = [];
    
    // Handle different response structures
    if (response && response.data && Array.isArray(response.data)) {
        categories = response.data;
    } else if (response && Array.isArray(response)) {
        categories = response;
    } else if (response && response.data && response.data.content && Array.isArray(response.data.content)) {
        categories = response.data.content;
    }

    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id || category.categoryId;
        option.textContent = category.name || category.categoryName || category.title;
        categorySelect.appendChild(option);
    });
}

// Populate NGO dropdown
function populateNGODropdown(response) {
    const ngoSelect = document.getElementById('ngoId');
    if (!ngoSelect) {
        console.error('NGO select not found');
        return;
    }
    
    ngoSelect.innerHTML = '<option value="">Select NGO</option>';

    let ngos = [];
    
    // Handle different response structures
    if (response && response.data && Array.isArray(response.data)) {
        ngos = response.data;
    } else if (response && Array.isArray(response)) {
        ngos = response;
    } else if (response && response.data && response.data.content && Array.isArray(response.data.content)) {
        ngos = response.data.content;
    }

    ngos.forEach(ngo => {
        const option = document.createElement('option');
        option.value = ngo.id || ngo.ngoId;
        option.textContent = ngo.name || ngo.ngoName || ngo.organizationName;
        ngoSelect.appendChild(option);
    });
}

// Handle image upload
function handleImageUpload(event) {
    const file = event.target.files[0];
    
    // If no file selected and we're in edit mode with existing image, that's okay
    if (!file && isEditMode && document.getElementById('successstoryImage').dataset.existingUrl) {
        return;
    }
    
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file.');
        event.target.value = '';
        return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        alert('File size should be less than 5MB.');
        event.target.value = '';
        return;
    }

    // Show loading state
    showImageUploadLoading();

    // Create FormData for upload
    const formData = new FormData();
    formData.append('files', file);

    // Upload image using galleryServices
    if (typeof galleryServices === 'undefined') {
        console.error('galleryServices not found');
        alert('Image upload service not available.');
        hideImageUploadLoading();
        return;
    }

    galleryServices.uploadimage(formData)
        .then(response => {
            console.log('Image uploaded successfully:', response);
            
            // Extract image URL from response
            let imageUrl = '';
            if (response && response.data && response.data.uploadedUrls) {
                imageUrl = response.data.uploadedUrls;
            } else if (response && response.uploadedUrls) {
                imageUrl = response.uploadedUrls;
            } else if (response && typeof response === 'string') {
                imageUrl = response;
            }

            if (imageUrl) {
                // Ensure imageUrl is always a string, not an array
                if (Array.isArray(imageUrl)) {
                    uploadedImageUrl = imageUrl[0];
                } else {
                    uploadedImageUrl = imageUrl;
                }
                
                console.log('Image URL stored (cleaned):', uploadedImageUrl);
                console.log('Image URL type:', typeof uploadedImageUrl);
                
                showImagePreview(uploadedImageUrl);
                hideImageUploadLoading();
            } else {
                console.error('Could not extract image URL from response');
                alert('Image uploaded but URL not found. Please try again.');
                hideImageUploadLoading();
            }
        })
        .catch(error => {
            console.error('Error uploading image:', error);
            alert('Failed to upload image. Please try again.');
            hideImageUploadLoading();
            event.target.value = '';
        });
}

// Show image upload loading state
function showImageUploadLoading() {
    const fileInput = document.getElementById('successstoryImage');
    if (!fileInput) return;
    
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'imageUploadLoading';
    loadingDiv.innerHTML = `
        <div class="d-flex align-items-center mt-2">
            <div class="spinner-border spinner-border-sm text-primary me-2" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <small class="text-muted">Uploading image...</small>
        </div>
    `;
    fileInput.parentNode.appendChild(loadingDiv);
}

// Hide image upload loading state
function hideImageUploadLoading() {
    const loadingDiv = document.getElementById('imageUploadLoading');
    if (loadingDiv) {
        loadingDiv.remove();
    }
}

// Show image preview
function showImagePreview(imageUrl) {
    const fileInput = document.getElementById('successstoryImage');
    if (!fileInput) return;
    
    let previewDiv = document.getElementById('imagePreview');
    
    if (!previewDiv) {
        previewDiv = document.createElement('div');
        previewDiv.id = 'imagePreview';
        fileInput.parentNode.appendChild(previewDiv);
    }

    previewDiv.innerHTML = `
        <div class="mt-2">
            <img src="${imageUrl}" alt="Success Story Image" 
                 style="max-width: 200px; max-height: 150px; object-fit: cover;" 
                 class="rounded border">
            <div class="mt-1">
                <small class="text-success">
                    <i class="bx bx-check-circle"></i> Image uploaded successfully
                </small>
            </div>
        </div>
    `;
}

// Handle form submission
function handleFormSubmit(event) {
    event.preventDefault();

    if (!validateForm()) {
        return;
    }

    const formData = collectFormData();
    
    if (isEditMode) {
        updateSuccessStory(formData);
    } else {
        createSuccessStory(formData);
    }
}

// Validate form - FIXED VERSION
function validateForm() {
    const requiredFields = [
        { id: 'successStoryTitle', name: 'Success Story Title' },
        { id: 'successstoryDate', name: 'Success Story Date' },
        { id: 'successstoryDescription', name: 'Success Story Description' },
        // { id: 'categoryId', name: 'Category' },
        // { id: 'ngoId', name: 'NGO' }
    ];

    for (const field of requiredFields) {
        const element = document.getElementById(field.id);
        if (!element || !element.value.trim()) {
            alert(`Please fill in the ${field.name} field.`);
            if (element) element.focus();
            return false;
        }
    }

    // Check if image is required
    if (!isEditMode) {
        // For new success story, image is required
        if (!uploadedImageUrl) {
            alert('Please upload a success story image.');
            const imageInput = document.getElementById('successstoryImage');
            if (imageInput) imageInput.focus();
            return false;
        }
    } else {
        // For edit mode, image is optional
        // If user uploaded new image, use it
        // If no new image uploaded, keep existing image
        const imageInput = document.getElementById('successstoryImage');
        const hasExistingImage = imageInput && imageInput.dataset.existingUrl;
        if (!uploadedImageUrl && !hasExistingImage) {
            alert('Please upload a success story image.');
            if (imageInput) imageInput.focus();
            return false;
        }
    }

    return true;
}

// Collect form data - FIXED VERSION
function collectFormData() {
    // Determine the image URL to use
    let imageUrl = '';
    
    if (uploadedImageUrl) {
        // New image was uploaded
        imageUrl = Array.isArray(uploadedImageUrl) ? uploadedImageUrl[0] : uploadedImageUrl;
    } else if (isEditMode) {
        // In edit mode, use existing image if no new upload
        const imageInput = document.getElementById('successstoryImage');
        const existingUrl = imageInput ? imageInput.dataset.existingUrl : '';
        imageUrl = existingUrl ? (Array.isArray(existingUrl) ? existingUrl[0] : existingUrl) : '';
    }
    
    // Helper functions for safe element access
    const getElementValue = (id) => {
        const element = document.getElementById(id);
        return element ? element.value.trim() : '';
    };
    
    const getElementIntValue = (id) => {
        const element = document.getElementById(id);
        const value = element ? element.value : '';
        return value ? parseInt(value) : null;
    };
    
    return {
        successstoryTitle: getElementValue('successStoryTitle'),
        successstoryDescription: getElementValue('successstoryDescription'),
        successstoryImage: imageUrl,
        categoryId: getElementIntValue('categoryId'),
        ngoId: getElementIntValue('ngoId'),
        successstoryDate: getElementValue('successstoryDate')
    };
}

// Create success story
function createSuccessStory(formData) {
    if (typeof SuccessStoryService === 'undefined') {
        console.error('SuccessStoryService not found');
        alert('Success Story service not available.');
        return;
    }

    // Show loading state
    showSubmitLoading();

    console.log('Creating success story with data:', formData);

    SuccessStoryService.create(formData)
        .then(response => {
            console.log('Success story created successfully:', response);
            hideSubmitLoading();
            alert('Success story created successfully!');
            
            // Redirect to success stories list page
            window.location.href = 'successStories.html';
        })
        .catch(error => {
            console.error('Error creating success story:', error);
            hideSubmitLoading();
            alert('Failed to create success story. Please try again.');
        });
}

// Update success story
function updateSuccessStory(formData) {
    if (typeof SuccessStoryService === 'undefined') {
        console.error('SuccessStoryService not found');
        alert('Success Story service not available.');
        return;
    }

    // Show loading state
    showSubmitLoading();

    console.log('Updating success story with data:', formData);

    SuccessStoryService.update(currentSuccessStoryId, formData)
        .then(response => {
            console.log('Success story updated successfully:', response);
            hideSubmitLoading();
            alert('Success story updated successfully!');
            
            // Redirect to success stories list page
            window.location.href = 'successStories.html';
        })
        .catch(error => {
            console.error('Error updating success story:', error);
            hideSubmitLoading();
            alert('Failed to update success story. Please try again.');
        });
}

// Load success story data for editing
function loadSuccessStoryData(id) {
    if (typeof SuccessStoryService === 'undefined') {
        console.error('SuccessStoryService not found');
        return;
    }

    SuccessStoryService.getById(id)
        .then(response => {
            console.log('Success story data loaded:', response);
            populateFormWithData(response);
        })
        .catch(error => {
            console.error('Error loading success story data:', error);
            alert('Failed to load success story data.');
        });
}

// Populate form with existing data - UPDATED VERSION
function populateFormWithData(response) {
    let data = response;
    if (response && response.data) {
        data = response.data;
    }

    // Helper function to safely set element values
    const setElementValue = (id, value) => {
        const element = document.getElementById(id);
        if (element) {
            element.value = value || '';
        } else {
            console.warn(`Element with id '${id}' not found`);
        }
    };

    setElementValue('successStoryTitle', data.successstoryTitle);
    setElementValue('successstoryDate', data.successstoryDate);
    setElementValue('successstoryDescription', data.successstoryDescription);
    setElementValue('categoryId', data.categoryId);
    setElementValue('ngoId', data.ngoId);

    // Handle existing image - CRITICAL FIX
    if (data.successstoryImage) {
        // Store existing image URL in dataset for reference
        let existingImageUrl = data.successstoryImage;
        if (Array.isArray(existingImageUrl)) {
            existingImageUrl = existingImageUrl[0];
        }
        
        const imageInput = document.getElementById('successstoryImage');
        if (imageInput) {
            imageInput.dataset.existingUrl = existingImageUrl;
        }
        
        // Show preview of existing image
        showImagePreview(existingImageUrl);
        
        // Don't set uploadedImageUrl yet - only set it when user uploads new image
        console.log('Existing image URL stored in dataset:', existingImageUrl);
    }
}

// Show submit loading state
function showSubmitLoading() {
    const submitBtn = document.getElementById('submitBtn');
    const saveBtn = document.getElementById('saveBtn');
    
    if (submitBtn && submitBtn.style.display !== 'none') {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Creating...';
    }
    
    if (saveBtn && saveBtn.style.display !== 'none') {
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Updating...';
    }
}

// Hide submit loading state
function hideSubmitLoading() {
    const submitBtn = document.getElementById('submitBtn');
    const saveBtn = document.getElementById('saveBtn');
    
    if (submitBtn && submitBtn.style.display !== 'none') {
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Submit';
    }
    
    if (saveBtn && saveBtn.style.display !== 'none') {
        saveBtn.disabled = false;
        saveBtn.innerHTML = 'Save';
    }
}

// Make functions globally available
window.handleImageUpload = handleImageUpload;
window.createSuccessStory = createSuccessStory;
window.updateSuccessStory = updateSuccessStory;
window.forceButtonVisibility = forceButtonVisibility;














// // Success Story Form Management with Image Upload - Fixed Version
// document.addEventListener("DOMContentLoaded", function() {
//     initializeForm();
//     loadDropdownData();
// });

// let isEditMode = false;
// let currentSuccessStoryId = null;
// let uploadedImageUrl = '';

// // Initialize form
// function initializeForm() {
//     const urlParams = new URLSearchParams(window.location.search);
//     const id = urlParams.get('id');
    
//     if (id) {
//         // Edit mode
//         isEditMode = true;
//         currentSuccessStoryId = id;
//         document.getElementById('submitBtn').style.display = 'none';
//         document.getElementById('saveBtn').style.display = 'inline-block';
//         loadSuccessStoryData(id);
//     } else {
//         // Add mode
//         isEditMode = false;
//         document.getElementById('submitBtn').style.display = 'inline-block';
//         document.getElementById('saveBtn').style.display = 'none';
//     }

//     // Setup form submission
//     document.getElementById('successStoriesform').addEventListener('submit', handleFormSubmit);
    
//     // Setup image upload
//     document.getElementById('successstoryImage').addEventListener('change', handleImageUpload);
// }

// // Load dropdown data (Categories and NGOs)
// function loadDropdownData() {
//     loadCategories();
//     loadNGOs();
// }

// // Load categories
// function loadCategories() {
//     if (typeof CategoryService === 'undefined') {
//         console.error('CategoryService not found');
//         return;
//     }

//     CategoryService.listAll()
//         .then(response => {
//             console.log('Categories loaded:', response);
//             populateCategoryDropdown(response);
//         })
//         .catch(error => {
//             console.error('Error loading categories:', error);
//             alert('Failed to load categories. Please refresh the page.');
//         });
// }

// // Load NGOs
// function loadNGOs() {
//     if (typeof NgoService === 'undefined') {
//         console.error('NgoService not found');
//         return;
//     }

//     NgoService.listAll(0, 100) // Load first 100 NGOs
//         .then(response => {
//             console.log('NGOs loaded:', response);
//             populateNGODropdown(response);
//         })
//         .catch(error => {
//             console.error('Error loading NGOs:', error);
//             alert('Failed to load NGOs. Please refresh the page.');
//         });
// }

// // Populate category dropdown
// function populateCategoryDropdown(response) {
//     const categorySelect = document.getElementById('categoryId');
//     categorySelect.innerHTML = '<option value="">Select Category</option>';

//     let categories = [];
    
//     // Handle different response structures
//     if (response && response.data && Array.isArray(response.data)) {
//         categories = response.data;
//     } else if (response && Array.isArray(response)) {
//         categories = response;
//     } else if (response && response.data && response.data.content && Array.isArray(response.data.content)) {
//         categories = response.data.content;
//     }

//     categories.forEach(category => {
//         const option = document.createElement('option');
//         option.value = category.id || category.categoryId;
//         option.textContent = category.name || category.categoryName || category.title;
//         categorySelect.appendChild(option);
//     });
// }

// // Populate NGO dropdown
// function populateNGODropdown(response) {
//     const ngoSelect = document.getElementById('ngoId');
//     ngoSelect.innerHTML = '<option value="">Select NGO</option>';

//     let ngos = [];
    
//     // Handle different response structures
//     if (response && response.data && Array.isArray(response.data)) {
//         ngos = response.data;
//     } else if (response && Array.isArray(response)) {
//         ngos = response;
//     } else if (response && response.data && response.data.content && Array.isArray(response.data.content)) {
//         ngos = response.data.content;
//     }

//     ngos.forEach(ngo => {
//         const option = document.createElement('option');
//         option.value = ngo.id || ngo.ngoId;
//         option.textContent = ngo.name || ngo.ngoName || ngo.organizationName;
//         ngoSelect.appendChild(option);
//     });
// }

// // Handle image upload
// function handleImageUpload(event) {
//     const file = event.target.files[0];
    
//     // If no file selected and we're in edit mode with existing image, that's okay
//     if (!file && isEditMode && document.getElementById('successstoryImage').dataset.existingUrl) {
//         return;
//     }
    
//     if (!file) return;

//     // Validate file type
//     if (!file.type.startsWith('image/')) {
//         alert('Please select a valid image file.');
//         event.target.value = '';
//         return;
//     }

//     // Validate file size (max 5MB)
//     if (file.size > 5 * 1024 * 1024) {
//         alert('File size should be less than 5MB.');
//         event.target.value = '';
//         return;
//     }

//     // Show loading state
//     showImageUploadLoading();

//     // Create FormData for upload
//     const formData = new FormData();
//     formData.append('files', file);

//     // Upload image using galleryServices
//     if (typeof galleryServices === 'undefined') {
//         console.error('galleryServices not found');
//         alert('Image upload service not available.');
//         hideImageUploadLoading();
//         return;
//     }

//     galleryServices.uploadimage(formData)
//         .then(response => {
//             console.log('Image uploaded successfully:', response);
            
//             // Extract image URL from response
//             let imageUrl = '';
//             if (response && response.data && response.data.uploadedUrls) {
//                 imageUrl = response.data.uploadedUrls;
//             } else if (response && response.uploadedUrls) {
//                 imageUrl = response.uploadedUrls;
//             } else if (response && typeof response === 'string') {
//                 imageUrl = response;
//             }

//             if (imageUrl) {
//                 // Ensure imageUrl is always a string, not an array
//                 if (Array.isArray(imageUrl)) {
//                     uploadedImageUrl = imageUrl[0];
//                 } else {
//                     uploadedImageUrl = imageUrl;
//                 }
                
//                 console.log('Image URL stored (cleaned):', uploadedImageUrl);
//                 console.log('Image URL type:', typeof uploadedImageUrl);
                
//                 showImagePreview(uploadedImageUrl);
//                 hideImageUploadLoading();
//             } else {
//                 console.error('Could not extract image URL from response');
//                 alert('Image uploaded but URL not found. Please try again.');
//                 hideImageUploadLoading();
//             }
//         })
//         .catch(error => {
//             console.error('Error uploading image:', error);
//             alert('Failed to upload image. Please try again.');
//             hideImageUploadLoading();
//             event.target.value = '';
//         });
// }

// // Show image upload loading state
// function showImageUploadLoading() {
//     const fileInput = document.getElementById('successstoryImage');
//     const loadingDiv = document.createElement('div');
//     loadingDiv.id = 'imageUploadLoading';
//     loadingDiv.innerHTML = `
//         <div class="d-flex align-items-center mt-2">
//             <div class="spinner-border spinner-border-sm text-primary me-2" role="status">
//                 <span class="visually-hidden">Loading...</span>
//             </div>
//             <small class="text-muted">Uploading image...</small>
//         </div>
//     `;
//     fileInput.parentNode.appendChild(loadingDiv);
// }

// // Hide image upload loading state
// function hideImageUploadLoading() {
//     const loadingDiv = document.getElementById('imageUploadLoading');
//     if (loadingDiv) {
//         loadingDiv.remove();
//     }
// }

// // Show image preview
// function showImagePreview(imageUrl) {
//     const fileInput = document.getElementById('successstoryImage');
//     let previewDiv = document.getElementById('imagePreview');
    
//     if (!previewDiv) {
//         previewDiv = document.createElement('div');
//         previewDiv.id = 'imagePreview';
//         fileInput.parentNode.appendChild(previewDiv);
//     }

//     previewDiv.innerHTML = `
//         <div class="mt-2">
//             <img src="${imageUrl}" alt="Success Story Image" 
//                  style="max-width: 200px; max-height: 150px; object-fit: cover;" 
//                  class="rounded border">
//             <div class="mt-1">
//                 <small class="text-success">
//                     <i class="bx bx-check-circle"></i> Image uploaded successfully
//                 </small>
//             </div>
//         </div>
//     `;
// }

// // Handle form submission
// function handleFormSubmit(event) {
//     event.preventDefault();

//     if (!validateForm()) {
//         return;
//     }

//     const formData = collectFormData();
    
//     if (isEditMode) {
//         updateSuccessStory(formData);
//     } else {
//         createSuccessStory(formData);
//     }
// }

// // Validate form - FIXED VERSION
// function validateForm() {
//     const requiredFields = [
//         { id: 'successStoryTitle', name: 'Success Story Title' },
//         { id: 'successstoryDate', name: 'Success Story Date' },
//         { id: 'successstoryDescription', name: 'Success Story Description' },
//         // { id: 'categoryId', name: 'Category' },
//         // { id: 'ngoId', name: 'NGO' }
//     ];

//     for (const field of requiredFields) {
//         const element = document.getElementById(field.id);
//         if (!element.value.trim()) {
//             alert(`Please fill in the ${field.name} field.`);
//             element.focus();
//             return false;
//         }
//     }

//     // Check if image is required
//     if (!isEditMode) {
//         // For new success story, image is required
//         if (!uploadedImageUrl) {
//             alert('Please upload a success story image.');
//             document.getElementById('successstoryImage').focus();
//             return false;
//         }
//     } else {
//         // For edit mode, image is optional
//         // If user uploaded new image, use it
//         // If no new image uploaded, keep existing image
//         const hasExistingImage = document.getElementById('successstoryImage').dataset.existingUrl;
//         if (!uploadedImageUrl && !hasExistingImage) {
//             alert('Please upload a success story image.');
//             document.getElementById('successstoryImage').focus();
//             return false;
//         }
//     }

//     return true;
// }

// // Collect form data - FIXED VERSION
// function collectFormData() {
//     // Determine the image URL to use
//     let imageUrl = '';
    
//     if (uploadedImageUrl) {
//         // New image was uploaded
//         imageUrl = Array.isArray(uploadedImageUrl) ? uploadedImageUrl[0] : uploadedImageUrl;
//     } else if (isEditMode) {
//         // In edit mode, use existing image if no new upload
//         const existingUrl = document.getElementById('successstoryImage').dataset.existingUrl;
//         imageUrl = existingUrl ? (Array.isArray(existingUrl) ? existingUrl[0] : existingUrl) : '';
//     }
    
//     return {
//         successstoryTitle: document.getElementById('successStoryTitle').value.trim(),
//         successstoryDescription: document.getElementById('successstoryDescription').value.trim(),
//         successstoryImage: imageUrl,
//         categoryId: parseInt(document.getElementById('categoryId').value) || null,
//         ngoId: parseInt(document.getElementById('ngoId').value) || null,
//         successstoryDate: document.getElementById('successstoryDate').value
//     };
// }

// // Create success story
// function createSuccessStory(formData) {
//     if (typeof SuccessStoryService === 'undefined') {
//         console.error('SuccessStoryService not found');
//         alert('Success Story service not available.');
//         return;
//     }

//     // Show loading state
//     showSubmitLoading();

//     console.log('Creating success story with data:', formData);

//     SuccessStoryService.create(formData)
//         .then(response => {
//             console.log('Success story created successfully:', response);
//             hideSubmitLoading();
//             alert('Success story created successfully!');
            
//             // Redirect to success stories list page
//             window.location.href = 'successStories.html';
//         })
//         .catch(error => {
//             console.error('Error creating success story:', error);
//             hideSubmitLoading();
//             alert('Failed to create success story. Please try again.');
//         });
// }

// // Update success story
// function updateSuccessStory(formData) {
//     if (typeof SuccessStoryService === 'undefined') {
//         console.error('SuccessStoryService not found');
//         alert('Success Story service not available.');
//         return;
//     }

//     // Show loading state
//     showSubmitLoading();

//     console.log('Updating success story with data:', formData);

//     SuccessStoryService.update(currentSuccessStoryId, formData)
//         .then(response => {
//             console.log('Success story updated successfully:', response);
//             hideSubmitLoading();
//             alert('Success story updated successfully!');
            
//             // Redirect to success stories list page
//             window.location.href = 'successStories.html';
//         })
//         .catch(error => {
//             console.error('Error updating success story:', error);
//             hideSubmitLoading();
//             alert('Failed to update success story. Please try again.');
//         });
// }

// // Load success story data for editing
// function loadSuccessStoryData(id) {
//     if (typeof SuccessStoryService === 'undefined') {
//         console.error('SuccessStoryService not found');
//         return;
//     }

//     SuccessStoryService.getById(id)
//         .then(response => {
//             console.log('Success story data loaded:', response);
//             populateFormWithData(response);
//         })
//         .catch(error => {
//             console.error('Error loading success story data:', error);
//             alert('Failed to load success story data.');
//         });
// }

// // Populate form with existing data - UPDATED VERSION
// function populateFormWithData(response) {
//     let data = response;
//     if (response && response.data) {
//         data = response.data;
//     }

//     document.getElementById('successStoryTitle').value = data.successstoryTitle || '';
//     document.getElementById('successstoryDate').value = data.successstoryDate || '';
//     document.getElementById('successstoryDescription').value = data.successstoryDescription || '';
//     document.getElementById('categoryId').value = data.categoryId || '';
//     document.getElementById('ngoId').value = data.ngoId || '';

//     // Handle existing image - CRITICAL FIX
//     if (data.successstoryImage) {
//         // Store existing image URL in dataset for reference
//         let existingImageUrl = data.successstoryImage;
//         if (Array.isArray(existingImageUrl)) {
//             existingImageUrl = existingImageUrl[0];
//         }
        
//         document.getElementById('successstoryImage').dataset.existingUrl = existingImageUrl;
        
//         // Show preview of existing image
//         showImagePreview(existingImageUrl);
        
//         // Don't set uploadedImageUrl yet - only set it when user uploads new image
//         console.log('Existing image URL stored in dataset:', existingImageUrl);
//     }
// }

// // Show submit loading state
// function showSubmitLoading() {
//     const submitBtn = document.getElementById('submitBtn');
//     const saveBtn = document.getElementById('saveBtn');
    
//     if (submitBtn.style.display !== 'none') {
//         submitBtn.disabled = true;
//         submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Creating...';
//     }
    
//     if (saveBtn.style.display !== 'none') {
//         saveBtn.disabled = true;
//         saveBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Updating...';
//     }
// }

// // Hide submit loading state
// function hideSubmitLoading() {
//     const submitBtn = document.getElementById('submitBtn');
//     const saveBtn = document.getElementById('saveBtn');
    
//     if (submitBtn.style.display !== 'none') {
//         submitBtn.disabled = false;
//         submitBtn.innerHTML = 'Submit';
//     }
    
//     if (saveBtn.style.display !== 'none') {
//         saveBtn.disabled = false;
//         saveBtn.innerHTML = 'Save';
//     }
// }

// // Make functions globally available
// window.handleImageUpload = handleImageUpload;
// window.createSuccessStory = createSuccessStory;
// window.updateSuccessStory = updateSuccessStory;
