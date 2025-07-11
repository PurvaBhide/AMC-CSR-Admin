// Success Story Management JavaScript
document.addEventListener("DOMContentLoaded", function () {
    loadSuccessStory();
}); 

let currentPage = 0;
let pageSize = 10; // Changed to 2 for testing pagination

function loadSuccessStory(page = 0) {
    currentPage = page;
    
    if (typeof SuccessStoryService === 'undefined') {
        console.error('SuccessStoryService not found');
        alert('Success Story service not available.');
        return;
    }

    // Show loading state
    showLoadingState();

    SuccessStoryService.listAll(page, pageSize)
        .then((response) => {
            console.log(response, "response");
            
            let successStories = [];
            let totalPages = 1;
            let totalElements = 0;
            
            // Handle the API response structure
            if (response && response.data && response.data.content) {
                successStories = response.data.content;
                totalPages = response.data.totalPages || 1;
                totalElements = response.data.totalElements || 0;
            } else if (response && Array.isArray(response)) {
                successStories = response;
                totalPages = Math.ceil(successStories.length / pageSize);
                totalElements = successStories.length;
            } else if (response && response.data && Array.isArray(response.data)) {
                successStories = response.data;
                totalPages = Math.ceil(successStories.length / pageSize);
                totalElements = successStories.length;
            }
            
            console.log(`Loaded ${successStories.length} stories, Total Pages: ${totalPages}, Total Elements: ${totalElements}`);
            
            renderSuccessStoryTable(successStories);
            renderPagination(totalPages, totalElements);
        })
        .catch((error) => {
            console.error("Error loading success stories:", error);
            showErrorState();
        });
}

function showLoadingState() {
    const tbody = document.querySelector("tbody.table-border-bottom-0");
    if (tbody) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-4">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <div class="mt-2">Loading success stories...</div>
                </td>
            </tr>
        `;
    }
}

function showErrorState() {
    const tbody = document.querySelector("tbody.table-border-bottom-0");
    if (tbody) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-muted py-4">
                    <i class="bx bx-error-circle bx-lg mb-2 d-block"></i>
                    Failed to load success stories. Please try again.
                    <div class="mt-2">
                        <button class="btn btn-sm btn-outline-primary" onclick="loadSuccessStory(0)">
                            <i class="bx bx-refresh"></i> Retry
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }
}

function renderSuccessStoryTable(successStories) {
    const tbody = document.querySelector("tbody.table-border-bottom-0");
    
    if (!tbody) {
        console.error("Table body not found");
        return;
    }
    
    tbody.innerHTML = ""; // Clear existing rows

    if (!successStories || successStories.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-muted py-4">
                    <i class="bx bx-image-alt bx-lg mb-2 d-block"></i>
                    No success stories found
                    <div class="mt-2">
                        <a href="successstory-form.html" class="btn btn-sm btn-primary">
                            <i class="bx bx-plus"></i> Add First Success Story
                        </a>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    successStories.forEach((story, index) => {
        const row = document.createElement("tr");
        
        // Calculate actual index considering pagination
        const actualIndex = index + 1 + currentPage * pageSize;
        
        // Format date
        const formattedDate = story.successstoryDate ? 
            new Date(story.successstoryDate).toLocaleDateString() : 'N/A';
        
        // Create image display
        const imageDisplay = getImageDisplay(story.successstoryImage);
        
        
        
        row.innerHTML = `
            <td>${actualIndex}</td>
            <td>
                <div class="fw-semibold">${story.successstoryTitle || 'Untitled'}</div>
              
            </td>
            <td>${imageDisplay}</td>
            <td>${formattedDate}</td>
           
            <td>
                <div class="dropdown">
                    <button class="btn p-0" type="button" data-bs-toggle="dropdown">
                        <i class="bx bx-dots-vertical-rounded"></i>
                    </button>
                    <ul class="dropdown-menu">
                        <li>
                            <a class="dropdown-item" href="successstory-form.html?id=${story.successstoryId}">
                                <i class="bx bx-edit me-1"></i> Edit
                            </a>
                        </li>
                      
                        <li>
                            <a class="dropdown-item" href="javascript:void(0);" onclick="deleteSuccessStory(${story.successstoryId})">
                                <i class="bx bx-trash me-1"></i> Delete
                            </a>
                        </li>
                       
                    </ul>
                </div>
            </td>
        `;
        
        tbody.appendChild(row);
    });
}

function getImageDisplay(imageUrl) {
    if (!imageUrl || imageUrl === 'null' || imageUrl === '') {
        return `
            <div class="d-flex align-items-center justify-content-center bg-light rounded" 
                 style="width: 80px; height: 60px;">
                <i class="bx bx-image text-muted"></i>
            </div>
        `;
    }
    
    // Handle array of URLs (take first one)
    let displayUrl = imageUrl;
    if (Array.isArray(imageUrl)) {
        displayUrl = imageUrl[0];
    }
    
    return `
        <div class="d-flex align-items-center">
            <img src="${displayUrl}" 
                 alt="Success Story Image" 
                 style="width: 80px; height: 60px; object-fit: cover; cursor: pointer;" 
                 class="rounded border" 
                 onclick="showImageModal('${displayUrl}', '${imageUrl}')"
                 onerror="this.parentElement.innerHTML='<div class=\\"d-flex align-items-center justify-content-center bg-light rounded\\" style=\\"width: 80px; height: 60px;\\"><i class=\\"bx bx-image-off text-muted\\"></i></div>
        </div>
    `;
}

function renderPagination(totalPages, totalElements = 0) {
    const paginationContainer = document.querySelector(".pagination");
    
    if (!paginationContainer) {
        console.error("Pagination container not found");
        return;
    }
    
    paginationContainer.innerHTML = "";

    // Always show info about total elements
    if (totalElements > 0) {
        const startIndex = currentPage * pageSize + 1;
        const endIndex = Math.min((currentPage + 1) * pageSize, totalElements);
        
        paginationContainer.innerHTML += `
            <li class="page-item disabled">
                <span class="page-link">
                    Showing ${startIndex}-${endIndex} of ${totalElements} success stories
                </span>
            </li>
        `;
    }

    // Only show navigation if more than 1 page
    if (totalPages <= 1) {
        return;
    }

    // Previous button
    const prevDisabled = currentPage === 0 ? "disabled" : "";
    paginationContainer.innerHTML += `
        <li class="page-item ${prevDisabled}">
            <a class="page-link" href="javascript:void(0);" onclick="loadSuccessStory(${currentPage - 1})" title="Previous Page">
                <i class="tf-icon bx bx-chevron-left"></i>
            </a>
        </li>
    `;

    // Page numbers with smart display
    const maxPagesToShow = 5;
    let startPage = Math.max(0, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages - 1, startPage + maxPagesToShow - 1);
    
    // Adjust start page if we're near the end
    if (endPage - startPage < maxPagesToShow - 1) {
        startPage = Math.max(0, endPage - maxPagesToShow + 1);
    }

    // Show ellipsis at start if needed
    if (startPage > 0) {
        paginationContainer.innerHTML += `
            <li class="page-item">
                <a class="page-link" href="javascript:void(0);" onclick="loadSuccessStory(0)">1</a>
            </li>
        `;
        if (startPage > 1) {
            paginationContainer.innerHTML += `
                <li class="page-item disabled">
                    <span class="page-link">...</span>
                </li>
            `;
        }
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
        const isActive = currentPage === i ? 'active' : '';
        paginationContainer.innerHTML += `
            <li class="page-item ${isActive}">
                <a class="page-link" href="javascript:void(0);" onclick="loadSuccessStory(${i})">${i + 1}</a>
            </li>
        `;
    }

    // Show ellipsis at end if needed
    if (endPage < totalPages - 1) {
        if (endPage < totalPages - 2) {
            paginationContainer.innerHTML += `
                <li class="page-item disabled">
                    <span class="page-link">...</span>
                </li>
            `;
        }
        paginationContainer.innerHTML += `
            <li class="page-item">
                <a class="page-link" href="javascript:void(0);" onclick="loadSuccessStory(${totalPages - 1})">${totalPages}</a>
            </li>
        `;
    }

    // Next button
    const nextDisabled = currentPage === totalPages - 1 ? "disabled" : "";
    paginationContainer.innerHTML += `
        <li class="page-item ${nextDisabled}">
            <a class="page-link" href="javascript:void(0);" onclick="loadSuccessStory(${currentPage + 1})" title="Next Page">
                <i class="tf-icon bx bx-chevron-right"></i>
            </a>
        </li>
    `;
}

// View success story details
function viewSuccessStory(id) {
    if (typeof SuccessStoryService === 'undefined') {
        alert('Success Story service not available.');
        return;
    }
    
    SuccessStoryService.getById(id)
        .then(response => {
            let story = response;
            if (response && response.data) {
                story = response.data;
            }
            showSuccessStoryModal(story);
        })
        .catch(error => {
            console.error('Error loading success story details:', error);
            alert('Failed to load success story details.');
        });
}

// Delete success story
function deleteSuccessStory(id) {
    if (!confirm('Are you sure you want to delete this success story?')) {
        return;
    }
    
    if (typeof SuccessStoryService === 'undefined') {
        alert('Success Story service not available.');
        return;
    }
    
    SuccessStoryService.delete(id)
        .then(response => {
            console.log('Success story deleted:', response);
            alert('Success story deleted successfully!');
            loadSuccessStory(currentPage); // Reload current page
        })
        .catch(error => {
            console.error('Error deleting success story:', error);
            alert('Failed to delete success story. Please try again.');
        });
}

// Show image modal
function showImageModal(imageUrl, originalUrl) {
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.innerHTML = `
        <div class="modal-dialog modal-lg modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Success Story Image</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body text-center">
                    <img src="${imageUrl}" alt="Success Story Image" 
                         style="max-width: 100%; height: auto;" class="rounded" />
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-outline-primary" onclick="downloadImage('${originalUrl}', 'success-story-image')">
                        <i class="bx bx-download"></i> Download
                    </button>
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();
    
    modal.addEventListener('hidden.bs.modal', () => {
        modal.remove();
    });
}

// Show success story details modal
function showSuccessStoryModal(story) {
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    
    const imageDisplay = story.successstoryImage ? 
        `<img src="${story.successstoryImage}" alt="Success Story Image" class="img-fluid rounded mb-3" style="max-height: 300px;">` :
        '<div class="bg-light rounded p-4 mb-3 text-center text-muted">No image available</div>';
    
    const formattedDate = story.successstoryDate 
    ?        new Date(story.successstoryDate).toLocaleDateString() : 'Not specified';
    
    modal.innerHTML = `
        <div class="modal-dialog modal-lg modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">${story.successstoryTitle || 'Success Story Details'}</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    ${imageDisplay}
                    <h6>Description:</h6>
                    <p>${story.successstoryDescription || 'No description available'}</p>
                    <div class="row mt-3">
                        <div class="col-6">
                            <strong>Date:</strong> ${formattedDate}
                        </div>
                        <div class="col-6">
                            <strong>Category:</strong> ${story.categoryId ? `Category ${story.categoryId}` : 'Not specified'}
                        </div>
                    </div>
                    <div class="mt-2">
                        <strong>NGO:</strong> ${story.ngoId ? `NGO ${story.ngoId}` : 'Not specified'}
                    </div>
                </div>
                <div class="modal-footer">
                    <a href="successstory-form.html?id=${story.successstoryId}" class="btn btn-primary">
                        <i class="bx bx-edit"></i> Edit
                    </a>
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();
    
    modal.addEventListener('hidden.bs.modal', () => {
        modal.remove();
    });
}

// Download image
function downloadImage(imageUrl, filename) {
    if (!imageUrl) {
        alert('No image available to download.');
        return;
    }
    
    // Handle array URLs
    let downloadUrl = imageUrl;
    if (Array.isArray(imageUrl)) {
        downloadUrl = imageUrl[0];
    }
    
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `${filename || 'success-story'}-${Date.now()}.jpg`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Change page size
function changePageSize(newPageSize) {
    pageSize = parseInt(newPageSize);
    currentPage = 0; // Reset to first page
    loadSuccessStory(0);
}

// Refresh list
function refreshSuccessStories() {
    loadSuccessStory(currentPage);
}

// Make functions globally available
window.loadSuccessStory = loadSuccessStory;
window.viewSuccessStory = viewSuccessStory;
window.deleteSuccessStory = deleteSuccessStory;
window.showImageModal = showImageModal;
window.downloadImage = downloadImage;
window.refreshSuccessStories = refreshSuccessStories;
window.changePageSize = changePageSize;































// // Success Story Management JavaScript
// document.addEventListener("DOMContentLoaded", function () {
//     loadSuccessStory();
// });

// let currentPage = 0;
// const pageSize = 10;

// function loadSuccessStory(page = 0) {
//     currentPage = page;
    
//     if (typeof SuccessStoryService === 'undefined') {
//         console.error('SuccessStoryService not found');
//         alert('Success Story service not available.');
//         return;
//     }

//     // Show loading state
//     showLoadingState();

//     SuccessStoryService.listAll(page, pageSize)
//         .then((response) => {
//             console.log(response, "response");
            
//             let successStories = [];
//             let totalPages = 1;
            
//             // Handle different response structures
//             if (response && response.data && response.data.content) {
//                 successStories = response.data.content;
//                 totalPages = response.data.totalPages || 1;
//             } else if (response && Array.isArray(response)) {
//                 successStories = response;
//                 totalPages = Math.ceil(successStories.length / pageSize);
//             } else if (response && response.data && Array.isArray(response.data)) {
//                 successStories = response.data;
//                 totalPages = Math.ceil(successStories.length / pageSize);
//             }
            
//             renderSuccessStoryTable(successStories);
//             renderPagination(totalPages);
//         })
//         .catch((error) => {
//             console.error("Error loading success stories:", error);
//             showErrorState();
//         });
// }

// function showLoadingState() {
//     const tbody = document.querySelector("tbody.table-border-bottom-0");
//     if (tbody) {
//         tbody.innerHTML = `
//             <tr>
//                 <td colspan="6" class="text-center py-4">
//                     <div class="spinner-border text-primary" role="status">
//                         <span class="visually-hidden">Loading...</span>
//                     </div>
//                     <div class="mt-2">Loading success stories...</div>
//                 </td>
//             </tr>
//         `;
//     }
// }

// function showErrorState() {
//     const tbody = document.querySelector("tbody.table-border-bottom-0");
//     if (tbody) {
//         tbody.innerHTML = `
//             <tr>
//                 <td colspan="6" class="text-center text-muted py-4">
//                     <i class="bx bx-error-circle bx-lg mb-2 d-block"></i>
//                     Failed to load success stories. Please try again.
//                     <div class="mt-2">
//                         <button class="btn btn-sm btn-outline-primary" onclick="loadSuccessStory(0)">
//                             <i class="bx bx-refresh"></i> Retry
//                         </button>
//                     </div>
//                 </td>
//             </tr>
//         `;
//     }
// }

// function renderSuccessStoryTable(successStories) {
//     const tbody = document.querySelector("tbody.table-border-bottom-0");
    
//     if (!tbody) {
//         console.error("Table body not found");
//         return;
//     }
    
//     tbody.innerHTML = ""; // Clear existing rows

//     if (!successStories || successStories.length === 0) {
//         tbody.innerHTML = `
//             <tr>
//                 <td colspan="6" class="text-center text-muted py-4">
//                     <i class="bx bx-image-alt bx-lg mb-2 d-block"></i>
//                     No success stories found
//                     <div class="mt-2">
//                         <a href="successstory-form.html" class="btn btn-sm btn-primary">
//                             <i class="bx bx-plus"></i> Add First Success Story
//                         </a>
//                     </div>
//                 </td>
//             </tr>
//         `;
//         return;
//     }

//     successStories.forEach((story, index) => {
//         const row = document.createElement("tr");
        
//         // Calculate actual index considering pagination
//         const actualIndex = index + 1 + currentPage * pageSize;
        
//         // Format date
//         const formattedDate = story.successstoryDate ? 
//             new Date(story.successstoryDate).toLocaleDateString() : 'N/A';
        
//         // Create image display
//         const imageDisplay = getImageDisplay(story.successstoryImage);
        
       
        
//         row.innerHTML = `
//             <td>${actualIndex}</td>
//             <td>
//                 <div class="fw-semibold">${story.successstoryTitle || 'Untitled'}</div>
            
//             </td>
//             <td>${imageDisplay}</td>
//             <td>${formattedDate}</td>
         
//             <td>
//                 <div class="dropdown">
//                     <button class="btn p-0" type="button" data-bs-toggle="dropdown">
//                         <i class="bx bx-dots-vertical-rounded"></i>
//                     </button>
//                     <ul class="dropdown-menu">
//                         <li>
//                             <a class="dropdown-item" href="successstory-form.html?id=${story.successstoryId}">
//                                 <i class="bx bx-edit me-1"></i> Edit
//                             </a>
//                         </li>
//                         <li>
//                             <a class="dropdown-item" href="javascript:void(0);" onclick="viewSuccessStory(${story.id})">
//                                 <i class="bx bx-show me-1"></i> View Details
//                             </a>
//                         </li>
//                         <li>
//                             <a class="dropdown-item" href="javascript:void(0);" onclick="deleteSuccessStory(${story.id})">
//                                 <i class="bx bx-trash me-1"></i> Delete
//                             </a>
//                         </li>
//                         ${story.successstoryImage ? `
//                         <li>
//                             <a class="dropdown-item" href="javascript:void(0);" onclick="downloadImage('${story.successstoryImage}', '${story.successstoryTitle}')">
//                                 <i class="bx bx-download me-1"></i> Download Image
//                             </a>
//                         </li>
//                         ` : ''}
//                     </ul>
//                 </div>
//             </td>
//         `;
        
//         tbody.appendChild(row);
//     });
// }

// function getImageDisplay(imageUrl) {
//     if (!imageUrl || imageUrl === 'null' || imageUrl === '') {
//         return `
//             <div class="d-flex align-items-center justify-content-center bg-light rounded" 
//                  style="width: 80px; height: 60px;">
//                 <i class="bx bx-image text-muted"></i>
//             </div>
//         `;
//     }
    
//     // Handle array of URLs (take first one)
//     let displayUrl = imageUrl;
//     if (Array.isArray(imageUrl)) {
//         displayUrl = imageUrl[0];
//     }
    
//     return `
//         <div class="d-flex align-items-center">
//             <img src="${displayUrl}" 
//                  alt="Success Story Image" 
//                  style="width: 80px; height: 60px; object-fit: cover; cursor: pointer;" 
//                  class="rounded border" 
//                  onclick="showImageModal('${displayUrl}', '${imageUrl}')"
//                  onerror="this.parentElement.innerHTML='<div class=\\"d-flex align-items-center justify-content-center bg-light rounded\\" style=\\"width: 80px; height: 60px;\\"><i class=\\"bx bx-image-off text-muted\\"></i></div>
//         </div>
//     `;
// }

// function renderPagination(totalPages) {
//     const paginationContainer = document.querySelector(".pagination");
    
//     if (!paginationContainer) {
//         console.error("Pagination container not found");
//         return;
//     }
    
//     paginationContainer.innerHTML = "";

//     if (totalPages <= 1) {
//         return;
//     }

//     // Previous button
//     const prevDisabled = currentPage === 0 ? "disabled" : "";
//     paginationContainer.innerHTML += `
//         <li class="page-item ${prevDisabled}">
//             <a class="page-link" href="javascript:void(0);" onclick="loadSuccessStory(${currentPage - 1})">
//                 <i class="tf-icon bx bx-chevron-left"></i>
//             </a>
//         </li>
//     `;

//     // Page numbers
//     const maxPagesToShow = 5;
//     let startPage = Math.max(0, currentPage - Math.floor(maxPagesToShow / 2));
//     let endPage = Math.min(totalPages - 1, startPage + maxPagesToShow - 1);
    
//     if (endPage - startPage < maxPagesToShow - 1) {
//         startPage = Math.max(0, endPage - maxPagesToShow + 1);
//     }

//     for (let i = startPage; i <= endPage; i++) {
//         const isActive = currentPage === i ? 'active' : '';
//         paginationContainer.innerHTML += `
//             <li class="page-item ${isActive}">
//                 <a class="page-link" href="javascript:void(0);" onclick="loadSuccessStory(${i})">${i + 1}</a>
//             </li>
//         `;
//     }

//     // Next button
//     const nextDisabled = currentPage === totalPages - 1 ? "disabled" : "";
//     paginationContainer.innerHTML += `
//         <li class="page-item ${nextDisabled}">
//             <a class="page-link" href="javascript:void(0);" onclick="loadSuccessStory(${currentPage + 1})">
//                 <i class="tf-icon bx bx-chevron-right"></i>
//             </a>
//         </li>
//     `;
// }

// // View success story details
// function viewSuccessStory(id) {
//     if (typeof SuccessStoryService === 'undefined') {
//         alert('Success Story service not available.');
//         return;
//     }
    
//     SuccessStoryService.getById(id)
//         .then(response => {
//             let story = response;
//             if (response && response.data) {
//                 story = response.data;
//             }
//             showSuccessStoryModal(story);
//         })
//         .catch(error => {
//             console.error('Error loading success story details:', error);
//             alert('Failed to load success story details.');
//         });
// }

// // Delete success story
// function deleteSuccessStory(id) {
//     if (!confirm('Are you sure you want to delete this success story?')) {
//         return;
//     }
    
//     if (typeof SuccessStoryService === 'undefined') {
//         alert('Success Story service not available.');
//         return;
//     }
    
//     SuccessStoryService.delete(id)
//         .then(response => {
//             console.log('Success story deleted:', response);
//             alert('Success story deleted successfully!');
//             loadSuccessStory(currentPage); // Reload current page
//         })
//         .catch(error => {
//             console.error('Error deleting success story:', error);
//             alert('Failed to delete success story. Please try again.');
//         });
// }

// // Show image modal
// function showImageModal(imageUrl, originalUrl) {
//     const modal = document.createElement('div');
//     modal.className = 'modal fade';
//     modal.innerHTML = `
//         <div class="modal-dialog modal-lg modal-dialog-centered">
//             <div class="modal-content">
//                 <div class="modal-header">
//                     <h5 class="modal-title">Success Story Image</h5>
//                     <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
//                 </div>
//                 <div class="modal-body text-center">
//                     <img src="${imageUrl}" alt="Success Story Image" 
//                          style="max-width: 100%; height: auto;" class="rounded" />
//                 </div>
//                 <div class="modal-footer">
//                     <button type="button" class="btn btn-outline-primary" onclick="downloadImage('${originalUrl}', 'success-story-image')">
//                         <i class="bx bx-download"></i> Download
//                     </button>
//                     <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
//                 </div>
//             </div>
//         </div>
//     `;
    
//     document.body.appendChild(modal);
    
//     const bsModal = new bootstrap.Modal(modal);
//     bsModal.show();
    
//     modal.addEventListener('hidden.bs.modal', () => {
//         modal.remove();
//     });
// }

// // Show success story details modal
// function showSuccessStoryModal(story) {
//     const modal = document.createElement('div');
//     modal.className = 'modal fade';
    
//     const imageDisplay = story.successstoryImage ? 
//         `<img src="${story.successstoryImage}" alt="Success Story Image" class="img-fluid rounded mb-3" style="max-height: 300px;">` :
//         '<div class="bg-light rounded p-4 mb-3 text-center text-muted">No image available</div>';
    
//     const formattedDate = story.successstoryDate ? 
//         new Date(story.successstoryDate).toLocaleDateString() : 'Not specified';
//     console.log("story.successstoryId",story.successstoryId);
//     modal.innerHTML = `
//         <div class="modal-dialog modal-lg modal-dialog-centered">
//             <div class="modal-content">
//                 <div class="modal-header">
//                     <h5 class="modal-title">${story.successstoryTitle || 'Success Story Details'}</h5>
//                     <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
//                 </div>
//                 <div class="modal-body">
//                     ${imageDisplay}
//                     <h6>Description:</h6>
//                     <p>${story.successstoryDescription || 'No description available'}</p>
//                     <div class="row mt-3">
//                         <div class="col-6">
//                             <strong>Date:</strong> ${formattedDate}
//                         </div>
//                         <div class="col-6">
//                             <strong>Category:</strong> ${story.categoryId ? `Category ${story.categoryId}` : 'Not specified'}
//                         </div>
//                     </div>
//                     <div class="mt-2">
//                         <strong>NGO:</strong> ${story.ngoId ? `NGO ${story.ngoId}` : 'Not specified'}
//                     </div>
//                 </div>
//                 <div class="modal-footer">
//                     <a href="successstory-form.html?id=${story.successstoryId}" class="btn btn-primary">
//                         <i class="bx bx-edit"></i> Edit
//                     </a>
//                     <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
//                 </div>
//             </div>
//         </div>
//     `;
    
//     document.body.appendChild(modal);
    
//     const bsModal = new bootstrap.Modal(modal);
//     bsModal.show();
    
//     modal.addEventListener('hidden.bs.modal', () => {
//         modal.remove();
//     });
// }

// // Download image
// function downloadImage(imageUrl, filename) {
//     if (!imageUrl) {
//         alert('No image available to download.');
//         return;
//     }
    
//     // Handle array URLs
//     let downloadUrl = imageUrl;
//     if (Array.isArray(imageUrl)) {
//         downloadUrl = imageUrl[0];
//     }
    
//     const link = document.createElement('a');
//     link.href = downloadUrl;
//     link.download = `${filename || 'success-story'}-${Date.now()}.jpg`;
//     link.target = '_blank';
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
// }

// // Refresh list
// function refreshSuccessStories() {
//     loadSuccessStory(currentPage);
// }

// // Make functions globally available
// window.loadSuccessStory = loadSuccessStory;
// window.viewSuccessStory = viewSuccessStory;
// window.deleteSuccessStory = deleteSuccessStory;
// window.showImageModal = showImageModal;
// window.downloadImage = downloadImage;
// window.refreshSuccessStories = refreshSuccessStories;
