// Initialize charts
let statusChart, departmentChart, ratingChart, purposeChart;

// Function to show loading state
function showLoading(show = true) {
    const elements = ['totalFeedbacks', 'resolvedCases', 'averageRating', 'pendingCases'];
    elements.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = show ? 'Loading...' : '0';
        }
    });
}

// Function to fetch feedback data based on role
async function fetchFeedbackData() {
    showLoading(true);
    const id = localStorage.getItem('id');
    const role = localStorage.getItem('role');
    const token = localStorage.getItem('token');

    let apiUrl;
    if (id === '1' && role === 'HEAD_OFFICE') {
        apiUrl = 'https://mumbailocal.org:8085/api/feedback/by-headoffice/1';
    } else if (id === '4' && role === 'POLICE_DEPARTMENT') {
        apiUrl = 'https://mumbailocal.org:8085/api/feedback/by-subdivision/4';
    } else {
        console.error('Invalid role or ID combination');
        showLoading(false);
        return null;
    }

    try {
        const response = await fetch(apiUrl, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.status === 204) {
            showLoading(false);
            return [];
        }

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        showLoading(false);
        return data;
    } catch (error) {
        console.error('Error fetching feedback data:', error);
        showLoading(false);
        return null;
    }
}

// Function to fetch station-specific feedback
async function fetchStationFeedback(stationId) {
    showLoading(true);
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`https://mumbailocal.org:8085/api/feedback/by-policestation/${stationId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.status === 204) {
            showLoading(false);
            updateDashboardMetrics([]);
            updateCharts([]);
            return [];
        }

        if (!response.ok) throw new Error('Failed to fetch station feedback');
        
        const data = await response.json();
        showLoading(false);
        return data;
    } catch (error) {
        console.error('Error fetching station feedback:', error);
        showLoading(false);
        displayError();
        return null;
    }
}

// Function to update dashboard metrics
function updateDashboardMetrics(data) {
    if (!data || !data.length) {
        const elements = ['totalFeedbacks', 'resolvedCases', 'averageRating', 'pendingCases'];
        elements.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = '0';
            }
        });
        return;
    }

    // Update total feedbacks
    const totalFeedbacks = document.getElementById('totalFeedbacks');
    if (totalFeedbacks) {
        totalFeedbacks.textContent = data.length;
    }

    // Update resolved cases
    const resolvedCases = data.filter(item => 
        item.complaintStatus && item.complaintStatus.toLowerCase() === 'resolved'
    ).length;
    const resolvedElement = document.getElementById('resolvedCases');
    if (resolvedElement) {
        resolvedElement.textContent = resolvedCases;
    }

    // Update average rating
    const ratings = data
        .filter(item => item.userfeedbackRating)
        .map(item => item.userfeedbackRating);
    const averageRating = ratings.length 
        ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)
        : 0;
    const ratingElement = document.getElementById('averageRating');
    if (ratingElement) {
        ratingElement.textContent = averageRating;
    }

    // Calculate and update satisfaction percentage
    const totalFeedback = data.length;
    const satisfiedCount = data.filter(feedback => 
        feedback.userSatisfied && feedback.userSatisfied.toLowerCase() === 'yes'
    ).length;
    const satisfactionPercentage = totalFeedback > 0 
        ? ((satisfiedCount / totalFeedback) * 100).toFixed(1)
        : '0';
    const pendingElement = document.getElementById('pendingCases');
    if (pendingElement) {
        pendingElement.textContent = `${satisfactionPercentage}%`;
    }
}

// Function to update charts
function updateCharts(data) {
    updateStatusChart(data);
    updateDepartmentChart(data);
    updateRatingChart(data);
    updatePurposeChart(data);
}


// Function to update status chart
function updateStatusChart(data) {
    const statusCtx = document.getElementById('statusChart');
    if (!statusCtx) return;

    if (statusChart) statusChart.destroy();

    if (!data || data.length === 0) {
        statusChart = new Chart(statusCtx, {
            type: 'doughnut',
            data: {
                labels: ['No Data Available'],
                datasets: [{
                    data: [1],
                    backgroundColor: ['#6c757d']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
        return;
    }

    const statusData = {
        resolved: data.filter(item => item.complaintStatus?.toLowerCase() === 'resolved').length,
        inProgress: data.filter(item => item.complaintStatus?.toLowerCase() === 'in progress').length,
        pending: data.filter(item => !item.complaintStatus || item.complaintStatus.toLowerCase() === 'pending').length
    };

    statusChart = new Chart(statusCtx, {
        type: 'doughnut',
        data: {
            labels: ['Resolved', 'In Progress', 'Pending'],
            datasets: [{
                data: [statusData.resolved, statusData.inProgress, statusData.pending],
                backgroundColor: ['#28a745', '#ffc107', '#dc3545']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

// Function to update department chart
function updateDepartmentChart(data) {
    const deptCtx = document.getElementById('departmentChart');
    if (!deptCtx) return;

    if (departmentChart) departmentChart.destroy();

    if (!data || data.length === 0) {
        departmentChart = new Chart(deptCtx, {
            type: 'pie',
            data: {
                labels: ['No Data Available'],
                datasets: [{
                    data: [1],
                    backgroundColor: ['#6c757d']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
        return;
    }

    const departments = {};
    data.forEach(item => {
        const dept = item.concerneddepartment || 'Unknown';
        departments[dept] = (departments[dept] || 0) + 1;
    });

    departmentChart = new Chart(deptCtx, {
        type: 'pie',
        data: {
            labels: Object.keys(departments),
            datasets: [{
                data: Object.values(departments),
                backgroundColor: ['#007bff', '#28a745', '#ffc107', '#dc3545', '#6c757d']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

// Function to update rating chart
function updateRatingChart(data) {
    const ratingCtx = document.getElementById('ratingChart');
    if (!ratingCtx) return;

    if (ratingChart) ratingChart.destroy();

    if (!data || data.length === 0) {
        ratingChart = new Chart(ratingCtx, {
            type: 'bar',
            data: {
                labels: ['No Data Available'],
                datasets: [{
                    data: [0],
                    backgroundColor: '#6c757d'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
        return;
    }

    const ratings = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0};
    data.forEach(item => {
        if (item.userfeedbackRating) {
            const rating = Math.round(item.userfeedbackRating);
            if (rating >= 1 && rating <= 5) {
                ratings[rating]++;
            }
        }
    });

    ratingChart = new Chart(ratingCtx, {
        type: 'bar',
        data: {
            labels: ['1★', '2★', '3★', '4★', '5★'],
            datasets: [{
                label: 'Number of Ratings',
                data: Object.values(ratings),
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
            }
        }
    });
}

// Function to update purpose chart
function updatePurposeChart(data) {
    const purposeCtx = document.getElementById('purposeChart');
    if (!purposeCtx) return;

    if (purposeChart) purposeChart.destroy();

    if (!data || data.length === 0) {
        purposeChart = new Chart(purposeCtx, {
            type: 'bar',
            data: {
                labels: ['No Data Available'],
                datasets: [{
                    data: [0],
                    backgroundColor: '#6c757d'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
        return;
    }

    const purposes = {};
    data.forEach(item => {
        const purpose = item.purposeOfVisit || 'Unknown';
        purposes[purpose] = (purposes[purpose] || 0) + 1;
    });

    purposeChart = new Chart(purposeCtx, {
        type: 'bar',
        data: {
            labels: Object.keys(purposes),
            datasets: [{
                label: 'Number of Visits',
                data: Object.values(purposes),
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
            }
        }
    });
}

async function initializePoliceStationSelector() {
    try {
        const token = localStorage.getItem('token');
     
        const response = await fetch('https://mumbailocal.org:8085/api/dashboard/getpolicestation', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const stations = await response.json();

        const selector = document.getElementById('stationSelector');
        if (!selector) {
            console.error('Selector not found');
            return;
        }

        // Clear and add default option
        selector.innerHTML = '<option value="">Select Police Station</option>';

        // Filter out any null values and sort the stations
        const validStations = stations.filter(station => station && station.policestationName);
        validStations.sort((a, b) => {
            const nameA = (a.policestationName || '').toString();
            const nameB = (b.policestationName || '').toString();
            return nameA.localeCompare(nameB);
        });

        // Add each police station
        validStations.forEach(station => {
            if (station && station.policestationName) {
                const option = document.createElement('option');
                option.value = station.id;
                option.textContent = station.policestationName;
                selector.appendChild(option);
            }
        });

        // Add event listener
        selector.onchange = async function() {
            const selectedId = this.value;
            if (selectedId) {
                try {
                    // First, fetch dashboard data for ratings
                                       const dashboardResponse = await fetch(`https://mumbailocal.org:8085/api/dashboard/${selectedId}`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    if (dashboardResponse.ok) {
                        const dashboardData = await dashboardResponse.json();
                                             // Update ratingsx`
                        document.getElementById('headofficeaverageRating').textContent = 
                            (dashboardData.headOffice?.rating || 0).toFixed(2);
                        document.getElementById('subdivisionaverageRating').textContent = 
                            (dashboardData.subdivision?.rating || 0).toFixed(2);
                        document.getElementById('citizenrating').textContent = 
                            (dashboardData.policestationRating || 0).toFixed(2);
                        
                        // Update rating comparison chart
                        updateRatingComparisonChart(dashboardData);
                    }

                    // Then fetch feedback data
                    const feedbackResponse = await fetch(`https://mumbailocal.org:8085/api/feedback/by-policestation/${selectedId}`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    
                    if (feedbackResponse.status === 204) {
                                              updateDashboardMetrics([]);
                        updateCharts([]);
                        return;
                    }

                    if (feedbackResponse.ok) {
                        const feedbackData = await feedbackResponse.json();
                        updateDashboardMetrics(feedbackData);
                        updateCharts(feedbackData);
                    }
                } catch (error) {
                    console.error('Error fetching station data:', error);
                }
            } else {
                // Reset ratings when no station is selected
                document.getElementById('headofficeaverageRating').textContent = '0';
                document.getElementById('subdivisionaverageRating').textContent = '0';
                document.getElementById('citizenrating').textContent = '0';
                
                if (ratingComparisonChart) {
                    ratingComparisonChart.destroy();
                }
            }
        };

    } catch (error) {
        console.error('Error initializing police stations:', error);
        const selector = document.getElementById('stationSelector');
        if (selector) {
            selector.innerHTML = '<option value="">Error loading police stations</option>';
        }
    }
}

async function initializeDashboard() {
    try {
        await initializePoliceStationSelector();
        const data = await fetchFeedbackData();
        if (data) {
            updateDashboardMetrics(data);
            updateCharts(data);
        }
    } catch (error) {
        console.error('Error initializing dashboard:', error);
        displayError();
    }
}

// Initialize when document is loaded
document.addEventListener('DOMContentLoaded', () => {
       initializeDashboard();
});
// Function to display errors
function displayError() {
    const elements = ['totalFeedbacks', 'resolvedCases', 'averageRating', 'pendingCases'];
    elements.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = 'Error';
        }
    });
}

// Function to initialize dashboard
async function initializeDashboard() {
    try {
        await initializePoliceStationSelector();
        const data = await fetchFeedbackData();
        if (data) {
            updateDashboardMetrics(data);
            updateCharts(data);
        }
    } catch (error) {
        console.error('Error initializing dashboard:', error);
        displayError();
    }
}

// Initialize when document is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeDashboard();
    // Refresh every 5 minutes
    setInterval(async () => {
        const selectedStation = document.getElementById('stationSelector').value;
        if (selectedStation) {
            const stationData = await fetchStationFeedback(selectedStation);
            if (stationData) {
                updateDashboardMetrics(stationData);
                updateCharts(stationData);
            }
        } else {
            const roleData = await fetchFeedbackData();
            if (roleData) {
                updateDashboardMetrics(roleData);
                updateCharts(roleData);
            }
        }
    }, 5 * 60 * 1000);
});









let ratingComparisonChart;

// Helper function to safely update element text content
function safeSetElementText(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = value;
    }
}
function generateStars(rating) {
    let fullStars = Math.floor(rating);
    let halfStar = rating % 1 >= 0.5 ? '★' : '';
    return '★'.repeat(fullStars) + halfStar + '☆'.repeat(5 - fullStars - (halfStar ? 1 : 0));
}

function updateRatingComparisonChart(data) {
      if (data) {
        document.getElementById('ratingui').style.display = 'flex'; 
    } else {
        document.getElementById('ratingui').style.display = 'none'; 
    }
    
    const ratingComparisonCtx = document.getElementById('ratingComparisonChart');
    const ratingComparisonCtx1=document.getElementById('ratingComparisonChart1')
    if (!ratingComparisonCtx) {
        console.warn('Rating comparison chart element not found');
        return;
    }

    if (ratingComparisonChart) ratingComparisonChart.destroy();

    ratingComparisonChart = new Chart(ratingComparisonCtx, {
        type: 'bar',
        data: {
            labels: ['Police Station', 'Subdivision', 'Head Office'],
            datasets: [{
                label: 'Response Time Rating',
                data: [
                    data.policestationRating || 0,
                    data.subdivision?.rating || 0,
                    data.headOffice?.rating || 0
                ],
                // backgroundColor: ['#007bff', '#71DD37', '#FF3E1D'],
                backgroundColor: ['#f9858b', '#ed335f', '#761137'],
                barThickness: 50
            }]
        },
             options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 5,
                    ticks: {
                        stepSize: 1
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Response Time Rating'
                },
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Rating: ${context.raw.toFixed(2)}`;
                        }
                    }
                }
            }
        }
    });

    // ✅ Update rating text and stars
    let citizenRating = (data.policestationRating || 0).toFixed(2);
    let subdivisionRating = (data.subdivision?.rating || 0).toFixed(2);
    let headofficeRating = (data.headOffice?.rating || 0).toFixed(2);

    safeSetElementText('citizenrating', citizenRating);
    safeSetElementText('citizenstars', generateStars(citizenRating));

    safeSetElementText('subdivisionaverageRating', subdivisionRating);
    safeSetElementText('subdivisionstars', generateStars(subdivisionRating));

    safeSetElementText('headofficeaverageRating', headofficeRating);
    safeSetElementText('headofficestars', generateStars(headofficeRating));
}

function safeSetElementText(id, text) {
    let element = document.getElementById(id);
    if (element) element.textContent = text;
}

const selector = document.getElementById('stationSelector');
if (selector) {
    selector.onchange = async function() {
        const selectedId = this.value;
     
        if (selectedId) {
            try {
                const token = localStorage.getItem('token');

                // Fetch Dashboard Data
                const dashboardResponse = await fetch(`https://mumbailocal.org:8085/api/dashboard/${selectedId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (dashboardResponse.ok) {
                    const dashboardData = await dashboardResponse.json();
                    updateRatingComparisonChart(dashboardData);
                } else {
                    console.error('Error fetching dashboard data');
                }

                // Fetch Feedback Data
                const feedbackResponse = await fetch(`https://mumbailocal.org:8085/api/feedback/by-policestation/${selectedId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (feedbackResponse.status === 204) {
                                      updateDashboardMetrics([]);
                    updateCharts([]);
                    return;
                }

                if (feedbackResponse.ok) {
                    const feedbackData = await feedbackResponse.json();
                    updateDashboardMetrics(feedbackData);
                    updateCharts(feedbackData);
                }
            } catch (error) {
                console.error('Error fetching station data:', error);
            }
        } else {
           
            safeSetElementText('headofficeaverageRating', '0');
            safeSetElementText('subdivisionaverageRating', '0');
            safeSetElementText('citizenrating', '0');

            // Destroy chart if exists
            if (ratingComparisonChart) {
                ratingComparisonChart.destroy();
                ratingComparisonChart = null;
            }
        }
    };
} else {
    console.warn('Station selector not found');
}


function safeSetElementText(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = value;
    } else {
        console.warn(`Element with ID '${id}' not found.`);
    }
}

























let responseTimeChart, citizenRatingChart;

function updateCitizenRatingDisplay(data) {
    const ratingCtx = document.getElementById('citizenRatingChart');
    if (!ratingCtx) {
        console.warn('Citizen rating chart element not found');
        return;
    }

    if (citizenRatingChart) citizenRatingChart.destroy();

    citizenRatingChart = new Chart(ratingCtx, {
        type: 'bar',
        data: {
            labels: ['Police Station', 'Subdivision', 'Head Office'],
            datasets: [{
                label: '',
                data: [
                    data.policeRating || 0,
                    data.subdivisionRating || 0,
                    data.headofficeRating || 0
                ],
                // backgroundColor: ['#007bff', '#71DD37', '#FF3E1D'],
                backgroundColor: ['#8B5CF6', '#EC4899', '#FBBF24'],
                // backgroundColor: ['#9A0056', '#A80040', '#670069'],
                barThickness: 50
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 5,
                    ticks: { stepSize: 1 }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Citizen Rating'
                },
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Rating: ${context.raw.toFixed(2)}`;
                        }
                    }
                }
            }
        }
    });

    // Update ratings display
    safeSetElementText('policeRating', (data.policeRating || 0).toFixed(2));
    safeSetElementText('policeStars', generateStars(data.policeRating || 0));
    safeSetElementText('subdivisionRating', (data.subdivisionRating || 0).toFixed(2));
    safeSetElementText('subdivisionStars', generateStars(data.subdivisionRating || 0));
    safeSetElementText('headofficeRating', (data.headofficeRating || 0).toFixed(2));
    safeSetElementText('headofficeStars', generateStars(data.headofficeRating || 0));
}

function resetCitizenRatingDisplay() {
    safeSetElementText('policeRating', '0');
    safeSetElementText('subdivisionRating', '0');
    safeSetElementText('headofficeRating', '0');

    // Reset star ratings
    ['policeStars', 'subdivisionStars', 'headofficeStars'].forEach(id => {
        safeSetElementText(id, generateStars(0));
    });

    // Destroy chart if exists
    if (citizenRatingChart) {
        citizenRatingChart.destroy();
        citizenRatingChart = null;
    }
}

// Initialize station selector event for citizen ratings
document.addEventListener('DOMContentLoaded', function() {
    const stationSelector = document.getElementById('stationSelector');
    
    if (stationSelector) {
        stationSelector.addEventListener('change', async function() {
            const selectedId = this.value;
            
            if (selectedId) {
                try {
                    const token = localStorage.getItem('token');
                    const headers = { 'Authorization': `Bearer ${token}` };

                    // Fetch all ratings in parallel
                    const [headOfficeResponse, subdivisionResponse, policeStationResponse] = await Promise.all([
                        fetch('https://mumbailocal.org:8085/api/rating/by-headoffice/1', { headers }),
                        fetch('https://mumbailocal.org:8085/api/rating/by-subdivision/4', { headers }),
                        fetch(`https://mumbailocal.org:8085/api/rating/by-policestation/${selectedId}`, { headers })
                    ]);

                    // Process citizen ratings
                    const [headOfficeRating, subdivisionRating, policeStationRating] = await Promise.all([
                        headOfficeResponse.json(),
                        subdivisionResponse.json(),
                        policeStationResponse.json()
                    ]);

                    updateCitizenRatingDisplay({
                        policeRating: policeStationRating,
                        subdivisionRating: subdivisionRating,
                        headofficeRating: headOfficeRating
                    });

                } catch (error) {
                    console.error('Error fetching citizen rating data:', error);
                    resetCitizenRatingDisplay();
                }
            } else {
                resetCitizenRatingDisplay();
            }
        });
    } else {
        console.warn('Station selector not found');
    }
});

document.addEventListener("DOMContentLoaded", function () {
    // console.log("DOM fully loaded and parsed.");
});