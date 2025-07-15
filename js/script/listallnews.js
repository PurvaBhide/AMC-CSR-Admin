// Enhanced News Management JavaScript with Status Filter
document.addEventListener("DOMContentLoaded", function () {
    loadNews();
    initializeStatusFilter();
});

let currentPage = 0;
let pageSize = 10;
let currentStatus = ''; // Track current filter status

function initializeStatusFilter() {
    const statusFilter = document.getElementById('filterstatus');
    if (statusFilter) {
        statusFilter.addEventListener('change', function() {
            currentStatus = this.value;
            currentPage = 0; // Reset to first page when filtering
            loadNews(0, currentStatus);
        });
    }
}

function loadNews(page = 0, status = '') {
    currentPage = page;
    currentStatus = status;
    
    if (typeof newsService === 'undefined') {
        console.error('News service not found');
        showError('News service not available.');
        return;
    }

    // Show loading in console or you can add a loading indicator
    console.log('Loading news...');
    
    // Call API with status filter if provided
    const apiCall = status ? 
        newsService.listAllByStatus(status, page, pageSize) : 
        newsService.listAll(page, pageSize);
    
    apiCall
        .then((response) => {
            console.log(response, "response");
            
            let news = [];
            let totalPages = 1;
            let totalElements = 0;
            
            // Handle the API response structure
            if (response && response.data && response.data.content) {
                news = response.data.content;
                totalPages = response.data.totalPages || 1;
                totalElements = response.data.totalElements || 0;
            } else if (response && Array.isArray(response)) {
                news = response;
                totalPages = Math.ceil(news.length / pageSize);
                totalElements = news.length;
            } else if (response && response.data && Array.isArray(response.data)) {
                news = response.data;
                totalPages = Math.ceil(news.length / pageSize);
                totalElements = news.length;
            }
            
            // Client-side filtering if API doesn't support status filtering
            if (status && !newsService.listByStatus) {
                news = news.filter(item => 
                    item.status && item.status.toLowerCase() === status.toLowerCase()
                );
                totalPages = Math.ceil(news.length / pageSize);
                totalElements = news.length;
            }
            
            console.log(`Loaded ${news.length} stories, Total Pages: ${totalPages}, Total Elements: ${totalElements}`);
            
            renderNewsTable(news);
            renderPagination(totalPages, totalElements);
        })
        .catch((error) => {
            console.error("Error loading news:", error);
            showError('Failed to load news. Please try again.');
        });
}

function renderNewsTable(newsList) {
    const tbody = document.getElementById("newsTableBody");
    
    if (!tbody) {
        console.error('Table body element not found');
        return;
    }
    
    // Clear existing content
    tbody.innerHTML = '';
    
    if (!newsList || newsList.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center py-4">
                    <i class="bx bx-news bx-lg text-muted"></i>
                    <p class="mt-2 mb-0 text-muted">No news found${currentStatus ? ` for status "${currentStatus}"` : ''}.</p>
                </td>
            </tr>
        `;
        return;
    }
    
    newsList.forEach((news, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${index + 1 + currentPage * pageSize}</td>
            <td>${news.letestupdatetitle || 'Untitled'}</td>
            <td>
                ${news.letestupdateimage ? 
                    `<img src="${news.letestupdateimage}" alt="News image" style="width: 50px; height: 30px; object-fit: cover; border-radius: 4px;" onerror="this.src='https://via.placeholder.com/50x30'">` : 
                    '<span class="text-muted">No image</span>'
                }
            </td>
            <td>
                <span class="badge ${getStatusBadgeClass(news.status)}">
                    ${news.status || 'Unknown'}
                </span>
            </td>
            <td>
                <div class="dropdown">
                    <button class="btn p-0" type="button" data-bs-toggle="dropdown">
                        <i class="bx bx-dots-vertical-rounded"></i>
                    </button>
                    <ul class="dropdown-menu">
                        <li>
                            <a class="dropdown-item" href="newsform.html?id=${news.letestupdateid}">
                                <i class="bx bx-edit me-1"></i> Edit
                            </a>
                        </li>
                        <li>
                            <a class="dropdown-item text-danger" href="javascript:void(0);" onclick="deleteNews(${news.letestupdateid})">
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

function getStatusBadgeClass(status) {
    if (!status) return 'bg-secondary';
    
    switch (status.toLowerCase()) {
        case 'live':
            return 'bg-success';
        case 'upcomming':
        case 'upcoming':
            return 'bg-warning';
        case 'completed':
            return 'bg-info';
        case 'active':
            return 'bg-success';
        case 'inactive':
            return 'bg-secondary';
        default:
            return 'bg-secondary';
    }
}

function renderPagination(totalPages, totalElements) {
    const paginationContainer = document.getElementById('paginationContainer');
    
    if (!paginationContainer) {
        console.error('Pagination container not found');
        return;
    }

    if (totalPages <= 1) {
        paginationContainer.innerHTML = '';
        return;
    }

    let paginationHTML = '';

    // Previous button
    paginationHTML += `
        <li class="page-item prev ${currentPage === 0 ? 'disabled' : ''}">
            <a class="page-link" href="javascript:void(0);" onclick="${currentPage > 0 ? `loadNews(${currentPage - 1}, '${currentStatus}')` : 'return false;'}">
                <i class="tf-icon bx bx-chevron-left"></i>
            </a>
        </li>
    `;

    // Page numbers
    const startPage = Math.max(0, currentPage - 2);
    const endPage = Math.min(totalPages - 1, currentPage + 2);

    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `
            <li class="page-item ${i === currentPage ? 'active' : ''}">
                <a class="page-link" href="javascript:void(0);" onclick="loadNews(${i}, '${currentStatus}')">
                    ${i + 1}
                </a>
            </li>
        `;
    }

    // Next button
    paginationHTML += `
        <li class="page-item next ${currentPage >= totalPages - 1 ? 'disabled' : ''}">
            <a class="page-link" href="javascript:void(0);" onclick="${currentPage < totalPages - 1 ? `loadNews(${currentPage + 1}, '${currentStatus}')` : 'return false;'}">
                <i class="tf-icon bx bx-chevron-right"></i>
            </a>
        </li>
    `;

    paginationContainer.innerHTML = paginationHTML;
}

// Clear filter function
function clearFilter() {
    const statusFilter = document.getElementById('filterstatus');
    if (statusFilter) {
        statusFilter.value = '';
        currentStatus = '';
        currentPage = 0;
        loadNews(0, '');
    }
}

// Safe state management functions
function showLoadingState() {
    const loadingElement = document.getElementById('loadingState');
    if (loadingElement) {
        hideAllStates();
        loadingElement.classList.remove('d-none');
    } else {
        console.log('Loading news...');
    }
}

function showErrorState() {
    const errorElement = document.getElementById('errorState');
    if (errorElement) {
        hideAllStates();
        errorElement.classList.remove('d-none');
    } else {
        console.error('Error loading news');
    }
}

function showEmptyState() {
    const emptyElement = document.getElementById('emptyState');
    if (emptyElement) {
        hideAllStates();
        emptyElement.classList.remove('d-none');
    } else {
        console.log('No news found');
    }
}

function hideAllStates() {
    const states = ['loadingState', 'errorState', 'emptyState'];
    states.forEach(stateId => {
        const element = document.getElementById(stateId);
        if (element) {
            element.classList.add('d-none');
        }
    });
}

function showError(message) {
    alert(message); // Simple error display, you can improve this
}

function deleteNews(id) {
    if (confirm('Are you sure you want to delete this news item?')) {
        if (typeof newsService !== 'undefined' && newsService.delete) {
            newsService.delete(id)
                .then(() => {
                    console.log('News deleted successfully');
                    loadNews(currentPage, currentStatus); // Reload current page with current filter
                })
                .catch((error) => {
                    console.error('Error deleting news:', error);
                    alert('Error deleting news. Please try again.');
                });
        } else {
            console.log(`Would delete news with ID: ${id}`);
            // Remove this log and implement actual delete when service is available
        }
    }
}

// Optional: Add a search function that works with status filter
function searchNews(searchTerm) {
    if (typeof newsService !== 'undefined' && newsService.search) {
        newsService.search(searchTerm, currentStatus, currentPage, pageSize)
            .then((response) => {
                // Handle search response similar to loadNews
                console.log('Search results:', response);
                // Process and render results...
            })
            .catch((error) => {
                console.error('Search error:', error);
                showError('Search failed. Please try again.');
            });
    }
}




// // Safe News Management JavaScript
// document.addEventListener("DOMContentLoaded", function () {
//     loadNews();
// });

// let currentPage = 0;
// let pageSize = 10;

// function loadNews(page = 0) {
//     currentPage = page;
    
//     if (typeof newsService === 'undefined') {
//         console.error('News service not found');
//         showError('News service not available.');
//         return;
//     }

//     // Show loading in console or you can add a loading indicator
//     console.log('Loading news...');
    
//     newsService.listAll(page, pageSize)
//         .then((response) => {
//             console.log(response, "response");
            
//             let news = [];
//             let totalPages = 1;
//             let totalElements = 0;
            
//             // Handle the API response structure
//             if (response && response.data && response.data.content) {
//                 news = response.data.content;
//                 totalPages = response.data.totalPages || 1;
//                 totalElements = response.data.totalElements || 0;
//             } else if (response && Array.isArray(response)) {
//                 news = response;
//                 totalPages = Math.ceil(news.length / pageSize);
//                 totalElements = news.length;
//             } else if (response && response.data && Array.isArray(response.data)) {
//                 news = response.data;
//                 totalPages = Math.ceil(news.length / pageSize);
//                 totalElements = news.length;
//             }
            
//             console.log(`Loaded ${news.length} stories, Total Pages: ${totalPages}, Total Elements: ${totalElements}`);
            
//             renderNewsTable(news);
//             renderPagination(totalPages, totalElements);
//         })
//         .catch((error) => {
//             console.error("Error loading news:", error);
//             showError('Failed to load news. Please try again.');
//         });
// }

// function renderNewsTable(newsList) {
//     const tbody = document.getElementById("newsTableBody");
    
//     if (!tbody) {
//         console.error('Table body element not found');
//         return;
//     }
    
//     // Clear existing content
//     tbody.innerHTML = '';
    
//     if (!newsList || newsList.length === 0) {
//         tbody.innerHTML = `
//             <tr>
//                 <td colspan="5" class="text-center py-4">
//                     <i class="bx bx-news bx-lg text-muted"></i>
//                     <p class="mt-2 mb-0 text-muted">No news found.</p>
//                 </td>
//             </tr>
//         `;
//         return;
//     }
    
//     newsList.forEach((news, index) => {
//         const row = document.createElement("tr");
//         row.innerHTML = `
//             <td>${index + 1 + currentPage * pageSize}</td>
//             <td>${news.letestupdatetitle || 'Untitled'}</td>
//             <td>
//                 ${news.letestupdateimage ? 
//                     `<img src="${news.letestupdateimage}" alt="News image" style="width: 50px; height: 30px; object-fit: cover; border-radius: 4px;" onerror="this.src='https://via.placeholder.com/50x30'">` : 
//                     '<span class="text-muted">No image</span>'
//                 }
//             </td>
//             <td>
//                 <span class="badge ${news.status === 'Active' ? 'bg-success' : 'bg-secondary'}">
//                     ${news.status || 'Unknown'}
//                 </span>
//             </td>
//             <td>
//                 <div class="dropdown">
//                     <button class="btn p-0" type="button" data-bs-toggle="dropdown">
//                         <i class="bx bx-dots-vertical-rounded"></i>
//                     </button>
//                     <ul class="dropdown-menu">
//                         <li>

//                             <a class="dropdown-item" href="newsform.html?id=${news.letestupdateid}">

//                                 <i class="bx bx-edit me-1"></i> Edit
//                             </a>
//                         </li>
//                         <li>
//                             <a class="dropdown-item text-danger" href="javascript:void(0);" onclick="deleteNews(${news.letestupdateid})">
//                                 <i class="bx bx-trash me-1"></i> Delete
//                             </a>
//                         </li>
//                     </ul>
//                 </div>
//             </td>
//         `;
//         tbody.appendChild(row);
//     });
// }

// function renderPagination(totalPages, totalElements) {
//     const paginationContainer = document.getElementById('paginationContainer');
    
//     if (!paginationContainer) {
//         console.error('Pagination container not found');
//         return;
//     }

//     if (totalPages <= 1) {
//         paginationContainer.innerHTML = '';
//         return;
//     }

//     let paginationHTML = '';

//     // Previous button
//     paginationHTML += `
//         <li class="page-item prev ${currentPage === 0 ? 'disabled' : ''}">
//             <a class="page-link" href="javascript:void(0);" onclick="${currentPage > 0 ? `loadNews(${currentPage - 1})` : 'return false;'}">
//                 <i class="tf-icon bx bx-chevron-left"></i>
//             </a>
//         </li>
//     `;

//     // Page numbers
//     const startPage = Math.max(0, currentPage - 2);
//     const endPage = Math.min(totalPages - 1, currentPage + 2);

//     for (let i = startPage; i <= endPage; i++) {
//         paginationHTML += `
//             <li class="page-item ${i === currentPage ? 'active' : ''}">
//                 <a class="page-link" href="javascript:void(0);" onclick="loadNews(${i})">
//                     ${i + 1}
//                 </a>
//             </li>
//         `;
//     }

//     // Next button
//     paginationHTML += `
//         <li class="page-item next ${currentPage >= totalPages - 1 ? 'disabled' : ''}">
//             <a class="page-link" href="javascript:void(0);" onclick="${currentPage < totalPages - 1 ? `loadNews(${currentPage + 1})` : 'return false;'}">
//                 <i class="tf-icon bx bx-chevron-right"></i>
//             </a>
//         </li>
//     `;

//     paginationContainer.innerHTML = paginationHTML;
// }

// // Safe state management functions
// function showLoadingState() {
//     const loadingElement = document.getElementById('loadingState');
//     if (loadingElement) {
//         hideAllStates();
//         loadingElement.classList.remove('d-none');
//     } else {
//         console.log('Loading news...');
//     }
// }

// function showErrorState() {
//     const errorElement = document.getElementById('errorState');
//     if (errorElement) {
//         hideAllStates();
//         errorElement.classList.remove('d-none');
//     } else {
//         console.error('Error loading news');
//     }
// }

// function showEmptyState() {
//     const emptyElement = document.getElementById('emptyState');
//     if (emptyElement) {
//         hideAllStates();
//         emptyElement.classList.remove('d-none');
//     } else {
//         console.log('No news found');
//     }
// }

// function hideAllStates() {
//     const states = ['loadingState', 'errorState', 'emptyState'];
//     states.forEach(stateId => {
//         const element = document.getElementById(stateId);
//         if (element) {
//             element.classList.add('d-none');
//         }
//     });
// }

// function showError(message) {
//     alert(message); // Simple error display, you can improve this
// }

// function deleteNews(id) {
//     if (confirm('Are you sure you want to delete this news item?')) {
//         if (typeof newsService !== 'undefined' && newsService.delete) {
//             newsService.delete(id)
//                 .then(() => {
//                     console.log('News deleted successfully');
//                     loadNews(currentPage); // Reload current page
//                 })
//                 .catch((error) => {
//                     console.error('Error deleting news:', error);
//                     alert('Error deleting news. Please try again.');
//                 });
//         } else {
//             console.log(`Would delete news with ID: ${id}`);
//             // Remove this log and implement actual delete when service is available
//         }
//     }



//     function statusfilter(filterstatus){
//           const element = document.getElementById(filterstatus);
//           console.log(element,"dadadadadadad")
//     }
// }
