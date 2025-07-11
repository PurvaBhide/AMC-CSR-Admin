// Complete Gallery Management JavaScript for Your HTML
document.addEventListener("DOMContentLoaded", function () {
    loadGallery();
    setupFilter();
});

let currentPage = 0;
const pageSize = 10;
let allGalleryData = [];
let currentFileTypeFilter = '';

// Setup filter event listener
function setupFilter() {
    const fileTypeFilter = document.getElementById('filetypefilter');
    if (fileTypeFilter) {
        fileTypeFilter.addEventListener('change', function() {
            currentFileTypeFilter = this.value;
            currentPage = 0; // Reset to first page when filtering
            loadGallery();
        });
    }
}

// Load gallery data with filter
function loadGallery(page = 0) {
    currentPage = page;
    
    console.log(`Loading gallery page ${page} with filter: ${currentFileTypeFilter}`);

    // Check if galleryServices exists
    if (typeof galleryServices === 'undefined') {
        console.error("galleryServices is not defined");
        alert("Gallery services not available. Please check if the service is loaded.");
        return;
    }

    // Show loading state
    showLoadingState();

    // Choose API call based on filter
    let apiCall;
    if (currentFileTypeFilter && currentFileTypeFilter !== '') {
        apiCall = galleryServices.filetype(currentFileTypeFilter);
    } else {
        apiCall = galleryServices.listall();
    }

    apiCall
        .then((response) => {
            console.log('Gallery response:', response);
            
            // Handle different response structures
            let galleryData = [];
            if (response && response.data && response.data.content) {
                // Handle paginated response structure
                galleryData = response.data.content;
            } else if (response && Array.isArray(response)) {
                // Handle direct array response
                galleryData = response;
            } else if (response && response.data && Array.isArray(response.data)) {
                // Handle response.data as array
                galleryData = response.data;
            }
            
            allGalleryData = galleryData || [];
            
            // Client-side pagination
            const totalItems = allGalleryData.length;
            const totalPages = Math.ceil(totalItems / pageSize);
            const startIndex = currentPage * pageSize;
            const endIndex = startIndex + pageSize;
            const currentPageData = allGalleryData.slice(startIndex, endIndex);
            
            console.log(`Showing ${currentPageData.length} items (${startIndex + 1}-${Math.min(endIndex, totalItems)} of ${totalItems})`);
            
            renderGalleryTable(currentPageData);
            renderPagination(totalPages);
        })
        .catch((error) => {
            console.error("Error loading gallery:", error);
            alert("Failed to load gallery. Please try again.");
            
            // Show empty table on error
            renderGalleryTable([]);
            renderPagination(0);
        });
}

// Show loading state
function showLoadingState() {
    const tbody = document.querySelector("tbody.table-border-bottom-0");
    if (tbody) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" class="text-center py-4">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <div class="mt-2">Loading gallery items...</div>
                </td>
            </tr>
        `;
    }
}

// Render gallery table
function renderGalleryTable(gallery) {
    const tbody = document.querySelector("tbody.table-border-bottom-0");
    
    if (!tbody) {
        console.error("Table body not found");
        return;
    }
    
    tbody.innerHTML = ""; // Clear existing rows

    if (!gallery || gallery.length === 0) {
        const filterText = currentFileTypeFilter ? ` for ${currentFileTypeFilter} files` : '';
        tbody.innerHTML = `
            <tr>
                <td colspan="4" class="text-center text-muted py-4">
                    <i class="bx bx-image-alt bx-lg mb-2 d-block"></i>
                    No gallery items found${filterText}
                </td>
            </tr>
        `;
        return;
    }

    gallery.forEach((item, index) => {
        const row = document.createElement("tr");
        
        // Calculate actual index considering pagination
        const actualIndex = index + 1 + currentPage * pageSize;
        
        // Create preview based on file type
        const filePreview = getFilePreview(item);
        
        row.innerHTML = `
            <td>${actualIndex}</td>
            <td>
                <span class="badge bg-${getFileTypeBadgeColor(item.fileType)} me-1">
                    ${item.fileType || 'Unknown'}
                </span>
            </td>
            <td>${filePreview}</td>
            <td>
                <div class="dropdown">
                    <button class="btn p-0" type="button" data-bs-toggle="dropdown">
                        <i class="bx bx-dots-vertical-rounded"></i>
                    </button>
                    <ul class="dropdown-menu">
                      
                        <li>
                            <a class="dropdown-item" href="javascript:void(0);" onclick="deleteGalleryItem(${item.id})">
                                <i class="bx bx-trash me-1"></i> Delete
                            </a>
                        </li>
                        <li>
                            <a class="dropdown-item" href="${item.fileUrl}" target="_blank">
                                <i class="bx bx-link-external me-1"></i> View Full
                            </a>
                        </li>
                      
                    </ul>
                </div>
            </td>
        `;
        
        tbody.appendChild(row);
    });
}

// Get file preview HTML
function getFilePreview(item) {
    const fileUrl = item.fileUrl;
    const fileType = item.fileType;
    const createdDate = item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '';
    
    if (!fileUrl) {
        return '<span class="text-muted">No file</span>';
    }
    
    switch (fileType) {
        case 'image':
            return `
                <div class="d-flex align-items-center">
                    <img src="${fileUrl}" alt="Gallery Image" 
                         style="width: 60px; height: 60px; object-fit: cover; cursor: pointer;" 
                         class="rounded me-3" 
                         onclick="showImageModal('${fileUrl}')" />
                    <div>
                        <div class="fw-semibold">Image File</div>
                        <small class="text-muted">${createdDate}</small>
                    </div>
                </div>
            `;
            
        case 'video':
            return `
                <div class="d-flex align-items-center">
                    <div class="bg-success bg-opacity-10 rounded me-3 d-flex align-items-center justify-content-center" 
                         style="width: 60px; height: 60px; cursor: pointer;"
                         onclick="window.open('${fileUrl}', '_blank')">
                        <i class="bx bx-play-circle bx-lg text-success"></i>
                    </div>
                    <div>
                        <div class="fw-semibold">Video File</div>
                        <small class="text-muted">${createdDate}</small>
                    </div>
                </div>
            `;
            
        case 'document':
            return `
                <div class="d-flex align-items-center">
                    <div class="bg-info bg-opacity-10 rounded me-3 d-flex align-items-center justify-content-center" 
                         style="width: 60px; height: 60px; cursor: pointer;"
                         onclick="window.open('${fileUrl}', '_blank')">
                        <i class="bx bx-file-blank bx-lg text-info"></i>
                    </div>
                    <div>
                        <div class="fw-semibold">Document</div>
                        <small class="text-muted">${createdDate}</small>
                    </div>
                </div>
            `;
            
        default:
            return `
                <div class="d-flex align-items-center">
                    <div class="bg-secondary bg-opacity-10 rounded me-3 d-flex align-items-center justify-content-center" 
                         style="width: 60px; height: 60px;">
                        <i class="bx bx-file bx-lg text-secondary"></i>
                    </div>
                    <div>
                        <div class="fw-semibold">Unknown File</div>
                        <small class="text-muted">${createdDate}</small>
                    </div>
                </div>
            `;
    }
}

// Get badge color for file type
function getFileTypeBadgeColor(fileType) {
    switch (fileType) {
        case 'image': return 'primary';
        case 'video': return 'success';
        case 'document': return 'info';
        default: return 'secondary';
    }
}

// Enhanced pagination with better UX
function renderPagination(totalPages) {
    const paginationUl = document.querySelector(".pagination");
    
    if (!paginationUl) {
        console.error("Pagination container not found");
        return;
    }
    
    paginationUl.innerHTML = "";

    // Show total items info even if no pagination needed
    if (totalPages <= 1) {
        if (allGalleryData.length > 0) {
            const filterText = currentFileTypeFilter ? ` (${currentFileTypeFilter})` : '';
            paginationUl.innerHTML = `
                <li class="page-item disabled">
                    <span class="page-link">Total: ${allGalleryData.length} items${filterText}</span>
                </li>
            `;
        }
        return;
    }

    // Previous button
    const prevDisabled = currentPage === 0 ? "disabled" : "";
    paginationUl.innerHTML += `
        <li class="page-item prev ${prevDisabled}">
            <a class="page-link" href="javascript:void(0);" onclick="loadGallery(${currentPage - 1})">
                <i class="tf-icon bx bx-chevron-left"></i>
            </a>
        </li>
    `;

    // Calculate page range to show (max 5 pages)
    const maxPagesToShow = 5;
    let startPage = Math.max(0, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages - 1, startPage + maxPagesToShow - 1);
    
    // Adjust start page if we're near the end
    if (endPage - startPage < maxPagesToShow - 1) {
        startPage = Math.max(0, endPage - maxPagesToShow + 1);
    }

    // Show ellipsis at start if needed
    if (startPage > 0) {
        paginationUl.innerHTML += `
            <li class="page-item">
                <a class="page-link" href="javascript:void(0);" onclick="loadGallery(0)">1</a>
            </li>
        `;
        if (startPage > 1) {
            paginationUl.innerHTML += `
                <li class="page-item disabled">
                    <span class="page-link">...</span>
                </li>
            `;
        }
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
        const isActive = currentPage === i ? 'active' : '';
        paginationUl.innerHTML += `
            <li class="page-item ${isActive}">
                <a class="page-link" href="javascript:void(0);" onclick="loadGallery(${i})">${i + 1}</a>
            </li>
        `;
    }

    // Show ellipsis at end if needed
    if (endPage < totalPages - 1) {
        if (endPage < totalPages - 2) {
            paginationUl.innerHTML += `
                <li class="page-item disabled">
                    <span class="page-link">...</span>
                </li>
            `;
        }
        paginationUl.innerHTML += `
            <li class="page-item">
                <a class="page-link" href="javascript:void(0);" onclick="loadGallery(${totalPages - 1})">${totalPages}</a>
            </li>
        `;
    }

    // Next button
    const nextDisabled = currentPage === totalPages - 1 ? "disabled" : "";
    paginationUl.innerHTML += `
        <li class="page-item next ${nextDisabled}">
            <a class="page-link" href="javascript:void(0);" onclick="loadGallery(${currentPage + 1})">
                <i class="tf-icon bx bx-chevron-right"></i>
            </a>
        </li>
    `;

    // Page info
    const startIndex = currentPage * pageSize + 1;
    const endIndex = Math.min((currentPage + 1) * pageSize, allGalleryData.length);
    const filterText = currentFileTypeFilter ? ` (${currentFileTypeFilter})` : '';
    
    paginationUl.innerHTML += `
        <li class="page-item disabled">
            <span class="page-link small">
                Page ${currentPage + 1} of ${totalPages} | ${startIndex}-${endIndex} of ${allGalleryData.length}${filterText}
            </span>
        </li>
    `;
}

// Clear filter
function clearFilter() {
    currentFileTypeFilter = '';
    currentPage = 0;
    const fileTypeFilter = document.getElementById('filetypefilter');
    if (fileTypeFilter) {
        fileTypeFilter.value = '';
    }
    loadGallery();
}

// Delete gallery item
function deleteGalleryItem(id) {
    if (!id) {
        alert("Gallery item ID not found.");
        return;
    }
    
    const confirmDelete = confirm("Are you sure you want to delete this gallery item?");
    if (!confirmDelete) return;

    if (typeof galleryServices === 'undefined' || !galleryServices.delete) {
        alert("Delete function not available.");
        return;
    }

    galleryServices.delete(id)
        .then((response) => {
            console.log("Delete response:", response);
            alert("Gallery item deleted successfully.");
            
            // Check if current page becomes empty after deletion
            const remainingItems = allGalleryData.length - 1;
            const newTotalPages = Math.ceil(remainingItems / pageSize);
            
            // If current page is now out of bounds, go to previous page
            if (currentPage >= newTotalPages && currentPage > 0) {
                currentPage = newTotalPages - 1;
            }
            
            // Reload gallery data
            loadGallery(currentPage);
        })
        .catch((error) => {
            console.error("Failed to delete gallery item:", error);
            alert("Failed to delete gallery item. Please try again.");
        });
}

// Alternative delete function name (as used in your HTML comment)
function deleteFundAnIdea(id) {
    deleteGalleryItem(id);
}

// Utility functions
function showImageModal(imageUrl) {
    // Create a modal to show full-size image
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.innerHTML = `
        <div class="modal-dialog modal-lg modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Gallery Image</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body text-center">
                    <img src="${imageUrl}" alt="Gallery Image" style="max-width: 100%; height: auto;" />
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Show modal using Bootstrap
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();
    
    // Remove modal from DOM when hidden
    modal.addEventListener('hidden.bs.modal', () => {
        modal.remove();
    });
}

function downloadFile(fileUrl, fileType) {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = `gallery_${fileType}_${Date.now()}`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Refresh gallery function
function refreshGallery() {
    loadGallery(currentPage);
}

// Make functions globally available
window.loadGallery = loadGallery;
window.deleteGalleryItem = deleteGalleryItem;
window.deleteFundAnIdea = deleteFundAnIdea;
window.clearFilter = clearFilter;
window.refreshGallery = refreshGallery;
window.showImageModal = showImageModal;
window.downloadFile = downloadFile;
