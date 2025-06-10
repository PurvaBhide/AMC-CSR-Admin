// Function to fetch and update feedback statistics
// function updateFeedbackStats() {
//     // Get token from localStorage for authentication
//     const token = localStorage.getItem('token');

//     // Fetch data from the API
//     fetch('https://mumbailocal.org:8085/api/getfeedback', {
//         headers: {
//             'Authorization': `Bearer ${token}`
//         }
//     })
//     .then(response => {
//         if (!response.ok) {
//             throw new Error('Network response was not ok');
//         }
//         return response.json();
//     })
//     .then(data => {
//         // Update total feedbacks count
//         const totalFeedbacks = document.getElementById('totalFeedbacks');
//         if (totalFeedbacks) {
//             totalFeedbacks.textContent = data.numberOfElements || 0;
//         }

//         // Calculate other statistics
//         if (data.content) {
//             // Count resolved cases
//             const resolvedCases = data.content.filter(item => item.complaintStatus === 'Resolved').length;
//             const resolvedElement = document.getElementById('resolvedCases');
//             if (resolvedElement) {
//                 resolvedElement.textContent = resolvedCases;
//             }

//             // Calculate average rating
//             const ratings = data.content
//                 .filter(item => item.userfeedbackRating)
//                 .map(item => item.userfeedbackRating);
//             const averageRating = ratings.length 
//                 ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)
//                 : 0;
//             const ratingElement = document.getElementById('averageRating');
//             if (ratingElement) {
//                 ratingElement.textContent = averageRating;
//             }

//             // Count pending cases
//             const pendingCases = data.content.filter(item => 
//                 item.complaintStatus === 'pending' || 
//                 item.complaintStatus === 'In Progress' || 
//                 !item.complaintStatus
//             ).length;
//             const pendingElement = document.getElementById('pendingCases');
//             if (pendingElement) {
//                 pendingElement.textContent = pendingCases;
//             }
//         }
//     })
//     .catch(error => {
//         console.error('Error fetching feedback data:', error);
//         // Handle error state - optionally show error message to user
//         const elements = ['totalFeedbacks', 'resolvedCases', 'averageRating', 'pendingCases'];
//         elements.forEach(id => {
//             const element = document.getElementById(id);
//             if (element) {
//                 element.textContent = 'Error';
//             }
//         });
//     });
// }

// Call the function when the document is loaded
document.addEventListener('DOMContentLoaded', updateFeedbackStats);

// Optionally, set up periodic refresh (e.g., every 5 minutes)
setInterval(updateFeedbackStats, 5 * 60 * 1000);


// policestation list 
// Function to fetch and populate police station selector
function initializePoliceStationSelector() {
    // Get token from localStorage for authentication
    const token = localStorage.getItem('token');

    // Fetch police stations from the API
    fetch('https://mumbailocal.org:8085/api/dashboard/getpolicestation', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        const selector = document.getElementById('stationSelector');
        
        // Clear existing options except the first default option
        selector.innerHTML = '<option value="">Select Police Station</option>';

        // Add police stations to selector
        data.forEach(station => {
            const option = document.createElement('option');
            option.value = station.id; // Assuming each station has an id field
            option.textContent = station.policestationName; // Assuming each station has a name field
            selector.appendChild(option);
        });

        // Optionally select the first station if none is selected
        if (selector.value === '' && data.length > 0) {
            selector.value = data[0].id;
            // Trigger the change event to update dashboard
            const event = new Event('change');
            selector.dispatchEvent(event);
        }
    })
    .catch(error => {
        console.error('Error fetching police stations:', error);
        // Handle error - show error message in selector
        const selector = document.getElementById('stationSelector');
        selector.innerHTML = '<option value="">Error loading police stations</option>';
    });
}

// Update dashboard based on selected station
function updateDashboard() {
    const stationId = document.getElementById('stationSelector').value;
    if (!stationId) return;

    // Get token from localStorage
    const token = localStorage.getItem('token');

    // Fetch feedback data for selected police station
    fetch(`https://mumbailocal.org:8085/api/getfeedback?policeStationId=${stationId}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(data => {
        // Update statistics
        document.getElementById('totalFeedbacks').textContent = data.numberOfElements || 0;
        
        if (data.content) {
            const resolvedCases = data.content.filter(item => item.complaintStatus === 'Resolved').length;
            document.getElementById('resolvedCases').textContent = resolvedCases;

            const ratings = data.content
                .filter(item => item.userfeedbackRating)
                .map(item => item.userfeedbackRating);
            const averageRating = ratings.length 
                ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)
                : 0;
            document.getElementById('averageRating').textContent = averageRating;

            const pendingCases = data.content.filter(item => 
                item.complaintStatus === 'pending' || 
                item.complaintStatus === 'In Progress' || 
                !item.complaintStatus
            ).length;
            document.getElementById('pendingCases').textContent = pendingCases;
        }
    })
    .catch(error => {
        console.error('Error fetching feedback data:', error);
        // Reset statistics on error
        ['totalFeedbacks', 'resolvedCases', 'averageRating', 'pendingCases'].forEach(id => {
            document.getElementById(id).textContent = 'Error';
        });
    });
}

// Initialize when document is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializePoliceStationSelector();
    
    // Add change event listener to station selector
    const selector = document.getElementById('stationSelector');
    selector.addEventListener('change', updateDashboard);
});






function updateFeedbackStats() {
    // Get token from localStorage for authentication
    const token = localStorage.getItem('token');
    const stationId = document.getElementById('stationSelector').value;
    if (!stationId) return;
    // Fetch data from the API
    fetch(`https://mumbailocal.org:8085/api/getfeedback?policeStationId=${stationId}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        // Update total feedbacks count
        console.log(data,"police")
        const totalFeedbacks = document.getElementById('totalFeedbacks');
        if (totalFeedbacks) {
            totalFeedbacks.textContent = data.numberOfElements || 0;
        }

        // Calculate other statistics
        if (data.content) {
            // Count resolved cases
            const resolvedCases = data.content.filter(item => item.complaintStatus === 'Resolved').length;
            const resolvedElement = document.getElementById('resolvedCases');
            if (resolvedElement) {
                resolvedElement.textContent = resolvedCases;
            }

            // Calculate average rating
            const ratings = data.content
                .filter(item => item.userfeedbackRating)
                .map(item => item.userfeedbackRating);
            const averageRating = ratings.length 
                ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)
                : 0;
            const ratingElement = document.getElementById('averageRating');
            if (ratingElement) {
                ratingElement.textContent = averageRating;
            }

            // Count pending cases
            const pendingCases = data.content.filter(item => 
                item.complaintStatus === 'pending' || 
                item.complaintStatus === 'In Progress' || 
                !item.complaintStatus
            ).length;
            const pendingElement = document.getElementById('pendingCases');
            if (pendingElement) {
                pendingElement.textContent = pendingCases;
            }
        }
    })
    .catch(error => {
        console.error('Error fetching feedback data:', error);
        // Handle error state - optionally show error message to user
        const elements = ['totalFeedbacks', 'resolvedCases', 'averageRating', 'pendingCases'];
        elements.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = 'Error';
            }
        });
    });
}
























// Initialize chart objects
let statusChart, departmentChart, ratingChart, purposeChart;

// Function to fetch feedback data and create all charts
async function updateDashboardCharts() {
    try {
        const token = localStorage.getItem('token');
        const policeStationId = document.getElementById('stationSelector').value;
        
        const response = await fetch(`https://mumbailocal.org:8085/api/getfeedback?policeStationId=${policeStationId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        if (data && data.content) {
            createStatusChart(data.content);
            createDepartmentChart(data.content);
            createRatingChart(data.content);
            createPurposeChart(data.content);
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        displayChartError();
    }
}

// Function to create Status Distribution Chart
function createStatusChart(data) {
    // Count status types
    const statusCounts = {
        'Resolved': 0,
        'In Progress': 0,
        'Pending': 0
    };
    
    data.forEach(item => {
        const status = item.complaintStatus ? item.complaintStatus.toLowerCase() : 'pending';
        if (status === 'resolved') statusCounts['Resolved']++;
        else if (status === 'in progress') statusCounts['In Progress']++;
        else statusCounts['Pending']++;
    });

    // Destroy existing chart if it exists
    if (statusChart) statusChart.destroy();

    // Create new chart
    const ctx = document.getElementById('statusChart').getContext('2d');
    statusChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(statusCounts),
            datasets: [{
                data: Object.values(statusCounts),
                backgroundColor: [
                    '#28a745',  // Green for Resolved
                    '#ffc107',  // Yellow for In Progress
                    '#dc3545'   // Red for Pending
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Function to create Department Distribution Chart
function createDepartmentChart(data) {
    // Count departments
    const deptCounts = {};
    data.forEach(item => {
        const dept = item.concerneddepartment || 'Unknown';
        deptCounts[dept] = (deptCounts[dept] || 0) + 1;
    });

    // Destroy existing chart if it exists
    if (departmentChart) departmentChart.destroy();

    // Create new chart
    const ctx = document.getElementById('departmentChart').getContext('2d');
    departmentChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: Object.keys(deptCounts),
            datasets: [{
                data: Object.values(deptCounts),
                backgroundColor: [
                    '#007bff',
                    '#28a745',
                    '#ffc107',
                    '#dc3545',
                    '#6c757d'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Function to create Rating Distribution Chart
function createRatingChart(data) {
    // Count ratings
    const ratingCounts = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0};
    data.forEach(item => {
        if (item.userfeedbackRating) {
            const rating = Math.round(item.userfeedbackRating);
            if (rating >= 1 && rating <= 5) {
                ratingCounts[rating]++;
            }
        }
    });

    // Destroy existing chart if it exists
    if (ratingChart) ratingChart.destroy();

    // Create new chart
    const ctx = document.getElementById('ratingChart').getContext('2d');
    ratingChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['1★', '2★', '3★', '4★', '5★'],
            datasets: [{
                label: 'Number of Ratings',
                data: Object.values(ratingCounts),
                backgroundColor: '#007bff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

// Function to create Purpose Distribution Chart
function createPurposeChart(data) {
    // Count purposes
    const purposeCounts = {};
    data.forEach(item => {
        const purpose = item.purposeOfVisit || 'Unknown';
        purposeCounts[purpose] = (purposeCounts[purpose] || 0) + 1;
    });

    // Destroy existing chart if it exists
    if (purposeChart) purposeChart.destroy();

    // Create new chart
    const ctx = document.getElementById('purposeChart').getContext('2d');
    purposeChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(purposeCounts),
            datasets: [{
                label: 'Number of Visits',
                data: Object.values(purposeCounts),
                backgroundColor: '#28a745'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                },
                x: {
                    ticks: {
                        maxRotation: 45,
                        minRotation: 45
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

// Function to display error message when charts fail to load
function displayChartError() {
    const chartContainers = ['statusChart', 'departmentChart', 'ratingChart', 'purposeChart'];
    chartContainers.forEach(containerId => {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = '<div class="chart-error">Error loading chart data</div>';
        }
    });
}

// Initialize charts when station is selected
document.addEventListener('DOMContentLoaded', () => {
    const selector = document.getElementById('stationSelector');
    if (selector) {
        selector.addEventListener('change', updateDashboardCharts);
    }
    
    // Initial load of charts if a station is selected
    if (selector && selector.value) {
        updateDashboardCharts();
    }
});
