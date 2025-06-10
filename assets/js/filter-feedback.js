document.addEventListener('DOMContentLoaded', () => {
  fetchAndRenderFeedbackList(); // Load initial data
  fetchPoliceStations(); // Populate police station dropdown

  // Event listeners for filters
  document.getElementById('monthSelect').addEventListener('change', function () {
    fetchFeedbackByMonth(this.value);
  });

  document.getElementById('ratingSelect').addEventListener('change', function () {
    fetchFeedbackByRating(this.value);
  });

  document.getElementById('dateSelect').addEventListener('change', function () {
    fetchFeedbackByDate(this.value);
  });

  document.getElementById('policeStationSelect').addEventListener('change', function () {
    fetchFeedbackByPoliceStation(this.value);
  });

  document.getElementById('department_issue').addEventListener('change', function () {
    fetchFeedbackByDepartment(this.value);
  });
});

// Function to fetch all feedback with pagination
function fetchAndRenderFeedbackList(page=1) {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const subdivisionId = localStorage.getItem('subdivisiondepartmentid');
  const policeStationId = localStorage.getItem('policestationid');

  let apiUrl;
  if (role === 'HEAD_OFFICE') {
    apiUrl = `https://mumbailocal.org:8085/api/getfeedback?page=${page}`;
  } else if (role === 'POLICE_SUB_DEPARTMENT') {
    apiUrl = `https://mumbailocal.org:8085/api/feedback/by-subdivision/${subdivisionId}?page=${page}`;
  } else {
    apiUrl = `https://mumbailocal.org:8085/api/feedback/by-policestation/${policeStationId}`;
  }

  fetchFilteredFeedback(apiUrl);
}

// Function to fetch feedback by month
function fetchFeedbackByMonth(month) {
  const role = localStorage.getItem('role');
  const policeStationId = localStorage.getItem('policestationid');
  const subdivisionId = localStorage.getItem('subdivisiondepartmentid');
  const selectedMonth = document.getElementById('monthSelect').value ;
  let endpoint = `https://mumbailocal.org:8085/api/feedback/by-month?month=${selectedMonth}`;
  if (role === 'POLICE_SUB_DEPARTMENT') {
    endpoint = `https://mumbailocal.org:8085/api/feedback/by-subdivision-filter/${subdivisionId}?month=${selectedMonth}`;
  } else if (role === 'POLICE_DEPARTMENT') {
    endpoint = `https://mumbailocal.org:8085/api/feedback/by-policestation-filter/${policeStationId}?month=${selectedMonth}`;
  }
  fetchFilteredFeedback(endpoint);
}

// Function to fetch feedback by rating
function fetchFeedbackByRating(rating) {
  const role = localStorage.getItem('role');
  const policeStationId = localStorage.getItem('policestationid');
  const subdivisionId = localStorage.getItem('subdivisiondepartmentid');

  let endpoint = `https://mumbailocal.org:8085/api/feedback/by-rating/${rating}`;

  if (role === 'POLICE_SUB_DEPARTMENT') {
    endpoint = `https://mumbailocal.org:8085/api/feedback/by-subdivision-filter/${subdivisionId}?rating=${rating}`;
  } else if (role === 'POLICE_DEPARTMENT') {
    endpoint = `https://mumbailocal.org:8085/api/feedback/by-policestation-filter/${policeStationId}?rating=${rating}`;
  }

  fetchFilteredFeedback(endpoint);
}

// Function to fetch feedback by date
function fetchFeedbackByDate(selectedDate) {
  const role = localStorage.getItem('role');
  const policeStationId = localStorage.getItem('policestationid');
  const subdivisionId = localStorage.getItem('subdivisiondepartmentid');
  endpoint = `https://mumbailocal.org:8085/api/feedback/by-date?date=${selectedDate}`;
  if (role === 'POLICE_SUB_DEPARTMENT') {
    endpoint = `https://mumbailocal.org:8085/api/feedback/by-subdivision-filter/${subdivisionId}?date=${selectedDate}`;
  } else if (role === 'POLICE_DEPARTMENT') {
    endpoint = `https://mumbailocal.org:8085/api/feedback/by-policestation-filter/${policeStationId}?date=${selectedDate}`;
  }
  fetchFilteredFeedback(endpoint);
}

// Function to handle API requests and check for 204 responses
function fetchFilteredFeedback(url) {
  const token = localStorage.getItem('token');

  fetch(url, { headers: { 'Authorization': `Bearer ${token}` } })
    .then(response => {
      if (response.status === 204) {
        updateFeedbackTables([]); // No data available
        return null;
      }
      return response.json();
    })
    .then(data => {
      if (data) {
        updateFeedbackTables(Array.isArray(data) ? data : []);
      }
    })
    .catch(error => console.error(`Error fetching feedback from ${url}:`, error));
}

// Fetch and populate police stations
function fetchPoliceStations() {
  const token = localStorage.getItem('token');

  fetch('https://mumbailocal.org:8085/api/dashboard/getpolicestation', {
    headers: { 'Authorization': `Bearer ${token}` }
  })
    .then(response => response.json())
    .then(data => {
      const policeSelect = document.getElementById('policeStationSelect');
      const role = localStorage.getItem('role');
      const policeStationName = localStorage.getItem('policestationName');
      const departmentName = localStorage.getItem('departmentName');
      const deptSelect = document.getElementById('department_issue');

      if (role === 'POLICE_DEPARTMENT') {
        policeSelect.innerHTML = `<option value="">${policeStationName}</option>`;
        deptSelect.innerHTML = `<option value="">${departmentName}</option>`;
        policeSelect.disabled = true;
        deptSelect.disabled = true;
      } else {
        policeSelect.innerHTML = `<option value="">Select Police Station</option>`;
      }

      data.forEach(station => {
        policeSelect.innerHTML += `<option value="${station.policestationName}">${station.policestationName}</option>`;
      });
    })
    .catch(error => console.error('Error fetching police stations:', error));
}

// Fetch feedback by police station
function fetchFeedbackByPoliceStation(policeStationName) {
  if (!policeStationName.trim()) return;
  fetchFilteredFeedback(`https://mumbailocal.org:8085/api/feedback/by-police-station-name?policeStationName=${encodeURIComponent(policeStationName.trim())}`);
}

// Fetch feedback by department
function fetchFeedbackByDepartment(departmentName) {
  if (!departmentName.trim()) return;
  fetchFilteredFeedback(`https://mumbailocal.org:8085/api/feedback/by-department/${encodeURIComponent(departmentName.trim())}`);
}

// Function to update feedback tables
function updateFeedbackTables(feedbackList) {
  const inProgressTable = document.getElementById('inProgressTable');
  const resolvedTable = document.getElementById('resolvedTable');

  const inProgressRows = [];
  const resolvedRows = [];
  let inProgressCount = 0;
  let resolvedCount = 0;

  if (!feedbackList.length) {
    inProgressTable.innerHTML = `<tr><td colspan="6" class="text-center text-danger"><b>No data available</b></td></tr>`;
    resolvedTable.innerHTML = `<tr><td colspan="6" class="text-center text-danger"><b>No data available</b></td></tr>`;
    return;
  }

  feedbackList.forEach(feedback => {
    const { complaintStatus, userName, contactNumber, concerneddepartment } = feedback;
    const statusClass = complaintStatus === 'Resolved' ? 'bg-success' :
                        complaintStatus === 'Pending' ? 'bg-warning' : 'bg-primary';

    const tr = `
      <tr>
        <td>${complaintStatus === 'Resolved' ? ++resolvedCount : ++inProgressCount}</td>
        <td>${userName}</td>
        <td>${contactNumber}</td>
        <td>${concerneddepartment}</td>
        <td><span class="badge ${statusClass}">${complaintStatus}</span></td>
        <td><button class="btn btn-primary btn-sm" onclick="handleEdit(${JSON.stringify(feedback)})">Edit</button></td>
      </tr>
    `;

    complaintStatus === 'Resolved' ? resolvedRows.push(tr) : inProgressRows.push(tr);
  });

  inProgressTable.innerHTML = inProgressRows.length ? inProgressRows.join('') : `<tr><td colspan="6" class="text-center text-danger"><b>No data available</b></td></tr>`;
  resolvedTable.innerHTML = resolvedRows.length ? resolvedRows.join('') : `<tr><td colspan="6" class="text-center text-danger"><b>No data available</b></td></tr>`;
}

// Function to handle editing feedback
function handleEdit(feedback) {
  console.log('Editing feedback:', feedback);
  // Implement edit logic here
}


// document.addEventListener('DOMContentLoaded', () => {
//   fetchAndRenderFeedbackList(); // Load initial data

//   // Event listeners for filters
//   document.getElementById('monthSelect').addEventListener('change', function () {
//     fetchFeedbackByMonth(this.value);
//   });

//   document.getElementById('ratingSelect').addEventListener('change', function () {
//     fetchFeedbackByRating(this.value);
//   });

//   document.getElementById('dateSelect').addEventListener('change', function () {
//     fetchFeedbackByDate(this.value);
//   });
// });

// // Function to fetch all feedback
// function fetchAndRenderFeedbackList() {
//   const token = localStorage.getItem('token');
//   let apiUrl ;
//   const role = localStorage.getItem('role');
//   const subdivisionId =  localStorage.getItem('subdivisiondepartmentid');
//   const policeStationId = localStorage.getItem('policestationid');
//   if(role==='HEAD_OFFICE'){
//     apiUrl = `https://mumbailocal.org:8085/api/getfeedback`;
//   } else if(role==='POLICE_SUB_DEPARTMENT'){
//     apiUrl = `https://mumbailocal.org:8085/api/feedback/by-subdivision/${subdivisionId}`;
//   } else{
//     apiUrl = `https://mumbailocal.org:8085/api/feedback/by-policestation/${policeStationId}`;
//   }
//   fetch(`${apiUrl}`, {
//     headers: { 'Authorization': `Bearer ${token}` }
//   })
//     .then(response => response.json())
//     .then(data => {
//       if (!Array.isArray(data.content)) {
//         console.error('Unexpected API response format:', data);
//         return;
//       }
//       updateFeedbackTables(data.content);
//     })
//     .catch(error => {
//       console.error('Error fetching feedback list:', error);
//     });
// }

// // Function to fetch feedback by month
// function fetchFeedbackByMonth(month) {
//   const token = localStorage.getItem('token');
//   const year = new Date().getFullYear(); // Get current year
//   const url = `https://mumbailocal.org:8085/api/feedback/by-month?month=${month}&year=${year}`;

//   fetch(url, {
//     headers: {
//       'Authorization': `Bearer ${token}`,
//       'Content-Type': 'application/json'
//     }
//   })
//     .then(response => response.json())
//     .then(data => {
//       if (!Array.isArray(data)) {
//         console.error('Unexpected API response format:', data);
//         return;
//       }
//       updateFeedbackTables(data);
//     })
//     .catch(error => {
//       console.error('Error fetching feedback by month:', error);
//     });
// }

// // Function to fetch feedback by rating
// function fetchFeedbackByRating(rating) {
//   const token = localStorage.getItem('token');
//   const url = `https://mumbailocal.org:8085/api/feedback/by-rating/${rating}`;

//   fetch(url, {
//     headers: {
//       'Authorization': `Bearer ${token}`,
//       'Content-Type': 'application/json'
//     }
//   })
//     .then(response => response.json())
//     .then(data => {
//       if (!Array.isArray(data)) {
//         console.error('Unexpected API response format:', data);
//         return;
//       }
//       updateFeedbackTables(data);
//     })
//     .catch(error => {
//       console.error('Error fetching feedback by rating:', error);
//     });
// }

// // Function to fetch feedback by date
// function fetchFeedbackByDate(selectedDate) {
//   const token = localStorage.getItem('token');
//   const url = `https://mumbailocal.org:8085/api/feedback/by-date?date=${selectedDate}`;

//   fetch(url, {
//     headers: {
//       'Authorization': `Bearer ${token}`,
//       'Content-Type': 'application/json'
//     }
//   })
//     .then(response => response.json())
//     .then(data => {
//       if (!Array.isArray(data)) {
//         console.error('Unexpected API response format:', data);
//         return;
//       }
//       updateFeedbackTables(data);
//     })
//     .catch(error => {
//       console.error('Error fetching feedback by date:', error);
//     });
// }

// // Function to update feedback tables

// function updateFeedbackTables(feedbackList) {
//   const inProgressRows = [];
//   const resolvedRows = [];
//   let inProgressCount = 0;
//   let resolvedCount = 0;

//   feedbackList.forEach(feedback => {
//     const status = feedback.complaintStatus; // Get complaint status
//     const statusClass = status === 'Resolved' ? 'bg-success' :
//                         status === 'Pending' ? 'bg-warning' : 'bg-primary';
//     const escapedFeedback = encodeURIComponent(JSON.stringify(feedback));

//     const tr = `
//       <tr>
//         <td>${status === 'Resolved' ? ++resolvedCount : ++inProgressCount}</td>
//         <td>${feedback.userName}</td>
//         <td>${feedback.contactNumber}</td>
//         <td>${feedback.concerneddepartment}</td>
//         <td><span class="badge ${statusClass}">${status}</span></td>
//         <td>
//           <button class="btn btn-primary btn-sm" onclick='handleEdit(JSON.parse(decodeURIComponent("${escapedFeedback}")))' >
//             Edit
//           </button>
//         </td>
//       </tr>
//     `;

//     if (status === 'Resolved') {
//       resolvedRows.push(tr);
//     } else {
//       inProgressRows.push(tr);
//     }
//   });

//   document.getElementById('inProgressTable').innerHTML = inProgressRows.join('');
//   document.getElementById('resolvedTable').innerHTML = resolvedRows.join('');
// }

// document.addEventListener('DOMContentLoaded', () => {
//   fetchPoliceStations(); // Populate the police station dropdown

//   // Attach event listener for police station selection
//   document.getElementById('policeStationSelect').addEventListener('change', event => {
//     fetchFeedbackByPoliceStation(event.target.value);
//   });
// });

// // Fetch and populate police stations
// function fetchPoliceStations() {
//   const token = localStorage.getItem('token');

//   fetch('https://mumbailocal.org:8085/api/dashboard/getpolicestation', {
//     headers: {
//       'Authorization': `Bearer ${token}`,
//       'Content-Type': 'application/json'
//     }
//   })
//     .then(response => response.json())
//     .then(data => {
//       const policeSelect = document.getElementById('policeStationSelect');
//       policeSelect.innerHTML = `<option value="">Select Police Station</option>`;
//       data.forEach(station => {
//         policeSelect.innerHTML += `<option value="${station.policestationName}">${station.policestationName}</option>`;
//       });
//     })
//     .catch(error => console.error('Error fetching police stations:', error));
// }

// // Fetch feedback by selected police station
// function fetchFeedbackByPoliceStation(policeStationName) {
//   if (!policeStationName?.trim()) return; // Check for empty or undefined input

//   if (!policeStationName) return; // Do nothing if no selection is made

//   const token = localStorage.getItem('token');
//   console.log(policeStationName);
//   console.log('Original policeStationName:', policeStationName);

//   // Extract only the first word before the first space
//   const firstWord = policeStationName.trim().split(' ')[0];

//   console.log('Formatted policeStationName:', firstWord);
//   // Replace space with '+' (if backend requires it)
//   const formattedName = policeStationName.replace(/ /g, '+');

//   const url = `https://mumbailocal.org:8085/api/feedback/by-police-station-name?policeStationName=${firstWord}`;

//   fetch(url, {
//     headers: {
//       'Authorization': `Bearer ${token}`,
//       'Content-Type': 'application/json'
//     }
//   })
//     .then(response => response.ok ? response.json() : Promise.reject(response))
//     .then(data => {
//       if (!Array.isArray(data)) {
//         console.error('Unexpected API response format:', data);
//         return;
//       }
//       updateFeedbackTables(data);
//     })
//     .catch(error => {
//       console.error('Error fetching feedback:', error);
//       alert('Failed to fetch feedback. Please try again.');
//     });
// }

// // Function to update feedback tables
// function updateFeedbackTables(feedbackList) {
//   const inProgressRows = [];
//   const resolvedRows = [];
//   let inProgressCount = 0;
//   let resolvedCount = 0;

//   if (!feedbackList.length) {
//     // Show a message if there is no data
//     document.getElementById('inProgressTable').innerHTML = `
//       <tr><td colspan="6" class="text-center">No feedback available</td></tr>`;
//     document.getElementById('resolvedTable').innerHTML = `
//       <tr><td colspan="6" class="text-center">No feedback available</td></tr>`;
//     document.getElementById('inProgressPagination').style.display = 'none'; // Hide pagination if no data
//     return;
//   }

//   feedbackList.forEach(feedback => {
//     const { complaintStatus, userName, contactNumber, concerneddepartment } = feedback;
//     const statusClass = complaintStatus === 'Resolved' ? 'bg-success' :
//                         complaintStatus === 'Pending' ? 'bg-warning' : 'bg-primary';

//     const tr = `
//       <tr>
//         <td>${complaintStatus === 'Resolved' ? ++resolvedCount : ++inProgressCount}</td>
//         <td>${userName}</td>
//         <td>${contactNumber}</td>
//         <td>${concerneddepartment}</td>
//         <td><span class="badge ${statusClass}">${complaintStatus}</span></td>
//         <td>
//           <button class="btn btn-primary btn-sm" data-feedback='${JSON.stringify(feedback)}' onclick="handleEditClick(this)">
//             Edit
//           </button>
//         </td>
//       </tr>
//     `;

//     complaintStatus === 'Resolved' ? resolvedRows.push(tr) : inProgressRows.push(tr);
//   });

//   document.getElementById('inProgressTable').innerHTML = inProgressRows.join('');
//   document.getElementById('resolvedTable').innerHTML = resolvedRows.join('');
//   document.getElementById('inProgressPagination').style.display = 'flex'; // Show pagination if data exists
// }


// // Safer way to handle editing feedback
// function handleEditClick(button) {
//   const feedback = JSON.parse(button.getAttribute('data-feedback'));
//   handleEdit(feedback);
// }

// document.addEventListener('DOMContentLoaded', () => {
//   document.getElementById('department_issue').addEventListener('change', function () {
//     fetchFeedbackByDepartment(this.value);
//   });
// });

// // Fetch feedback by department
// // Function to fetch feedback by department
// function fetchFeedbackByDepartment(departmentName) {
//   if (!departmentName?.trim()) return; // Skip if empty

//   const token = localStorage.getItem('token');
//   console.log('Original departmentName:', departmentName);

//   // Trim extra spaces and maintain spaces between words
//   const formattedName = departmentName.trim();
//   const wordCount = formattedName.split(/\s+/).length; // Count words

//   console.log(`Fetching data for: "${formattedName}" (${wordCount} words)`);

//   // Fetch API using the formatted department name
//   fetchFeedbackFromAPI(formattedName)
//     .then(data => updateFeedbackTables(data))
//     .catch(error => {
//       console.error('Error fetching feedback:', error);
//       alert('Failed to fetch feedback. Please try again.');
//     });
// }

// // Function to make API request
// function fetchFeedbackFromAPI(departmentName) {
//   return new Promise((resolve, reject) => {
//     const token = localStorage.getItem('token');

//     // Preserve spaces in the URL using encodeURIComponent
//     const url = `https://mumbailocal.org:8085/api/feedback/by-department/${encodeURIComponent(departmentName)}`;

//     console.log('Final API URL:', url); // Debugging output

//     fetch(url, {
//       headers: {
//         'Authorization': `Bearer ${token}`,
//         'Content-Type': 'application/json'
//       }
//     })
//       .then(response => response.ok ? response.json() : Promise.reject(response))
//       .then(data => {
//         if (!Array.isArray(data)) {
//           console.error('Unexpected API response format:', data);
//           resolve([]); // Return empty array instead of rejecting
//           return;
//         }
//         resolve(data);
//       })
//       .catch(error => {
//         console.error(`Error fetching feedback for ${departmentName}:`, error);
//         resolve([]); // Return empty array instead of rejecting
//       });
//   });
// }

// // Event listener (this must come after the function definition)
// document.addEventListener('DOMContentLoaded', () => {
//   document.getElementById('department_issue').addEventListener('change', function () {
//     fetchFeedbackByDepartment(this.value);
//   });
// });
