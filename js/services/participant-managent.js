// // participant-management.js

// document.addEventListener("DOMContentLoaded", function () {
//   loadParticipants();
//   loadFilterOptions();

//   document.getElementById('categoryFilter').addEventListener('change', () => loadParticipants(0));
//   document.getElementById('ngoFilter').addEventListener('change', () => loadParticipants(0));
//   document.getElementById('budgetFilter').addEventListener('change', () => loadParticipants(0));
// });


// let currentPage = 0;
// const pageSize = 5; // Based on your API's "pageSize" value

// function loadParticipants(page = 0) {
//   currentPage = page;

//   const categoryId = document.getElementById('categoryFilter').value.trim();
//   const ngoId = document.getElementById('ngoFilter').value.trim();
//   const budgetValue = document.getElementById('budgetFilter').value;

//   let [minBudget, maxBudget] = budgetValue ? budgetValue.split('-') : [null, null];
//   minBudget = minBudget ? parseInt(minBudget) : null;
//   maxBudget = maxBudget ? parseInt(maxBudget) : null;

//   const filters = {};
//   if (categoryId) filters.categoryId = categoryId;
//   if (ngoId) filters.ngoId = ngoId;
//   if (minBudget != null) filters.minBudget = minBudget;
//   if (maxBudget != null) filters.maxBudget = maxBudget;

//   Api.participant.listAll(page, pageSize, filters)
//     .then((response) => {
//       const participants = response.data?.content || [];
//       const totalPages = response.data?.totalPages || 0;

//       if (participants.length === 0) {
//         showError("No participants found matching the selected filters.");
//       } else {
//         renderParticipantsTable(participants);
//         renderPagination(totalPages);
//       }
//     })
//     .catch((error) => {
//       console.error("Error loading participants:", error);
//       showError("Error loading participants.");
//     });
// }



// function renderParticipantsTable(participants) {
//   const tbody = document.querySelector("tbody.table-border-bottom-0");
//   tbody.innerHTML = ""; // Clear existing rows

//   participants.forEach((participant, index) => {
//     const row = document.createElement("tr");
//     row.innerHTML = `
//       <td>${index + 1 + currentPage * pageSize}</td>
//       <td>${participant.participantName}</td>
//       <td>${participant.participantEmail}</td>
//       <td>${participant.participantMobileNumber}</td>
//       <td>${participant.organizationName || '-'}</td>
//       <td>${participant.amount ? Number(participant.amount).toLocaleString() : '-'}</td>
//       <td>${participant.token}</td>
//       <td>${participant.status || '-'}</td>
//       <td>
//         <div class="dropdown">
//           <button class="btn p-0" type="button" data-bs-toggle="dropdown">
//             <i class="bx bx-dots-vertical-rounded"></i>
//           </button>
//           <ul class="dropdown-menu">
//             <li><a class="dropdown-item" href="participant-form.html?id=${participant.participantID}">
//               <i class="bx bx-edit me-1"></i> Edit</a></li>
//             <li><a class="dropdown-item" href="javascript:void(0);" onclick="deleteParticipant(${participant.participantID})">
//               <i class="bx bx-trash me-1"></i> Delete</a></li>
//           </ul>
//         </div>
//       </td>
//     `;
//     tbody.appendChild(row);
//   });
// }

// function renderPagination(totalPages) {
//   const paginationUl = document.querySelector(".pagination");
//   paginationUl.innerHTML = ""; // Clear current pagination

//   const prevDisabled = currentPage === 0 ? "disabled" : "";
//   paginationUl.innerHTML += `
//     <li class="page-item ${prevDisabled}">
//       <a class="page-link" href="javascript:void(0);" onclick="loadParticipants(${currentPage - 1})">
//         <i class="tf-icon bx bx-chevron-left"></i>
//       </a>
//     </li>
//   `;

//   for (let i = 0; i < totalPages; i++) {
//     paginationUl.innerHTML += `
//       <li class="page-item ${currentPage === i ? 'active' : ''}">
//         <a class="page-link" href="javascript:void(0);" onclick="loadParticipants(${i})">${i + 1}</a>
//       </li>
//     `;
//   }

//   const nextDisabled = currentPage === totalPages - 1 ? "disabled" : "";
//   paginationUl.innerHTML += `
//     <li class="page-item ${nextDisabled}">
//       <a class="page-link" href="javascript:void(0);" onclick="loadParticipants(${currentPage + 1})">
//         <i class="tf-icon bx bx-chevron-right"></i>
//       </a>
//     </li>
//   `;
// }

// function deleteParticipant(id) {
//   const confirmDelete = confirm("Are you sure you want to delete this participant?");
//   if (!confirmDelete) return;

//   Api.participant.delete(id)
//     .then(() => {
//       alert("Participant deleted successfully.");
//       loadParticipants(); // Reload the table
//     })
//     .catch((error) => {
//       console.error("Failed to delete participant:", error);
//       alert("Failed to delete participant. Please try again.");
//     });
// }

// function loadFilterOptions() {
//   // Load Categories
//   Api.category.listAll()
//     .then(response => {
//       const categories = response.data || [];
//       const categorySelect = document.getElementById('categoryFilter');
//       categorySelect.innerHTML = '<option value="">All Categories</option>';

//       categories.forEach(category => {
//         if (category.id !== undefined && category.categoryName) {
//           const option = document.createElement('option');
//           option.value = category.id;
//           option.textContent = category.categoryName;
//           categorySelect.appendChild(option);
//         }
//       });
//     })
//     .catch(error => console.error("Error loading categories:", error));

//   // Load NGOs
//   Api.ngo.listAll()
//     .then(response => {
//       const ngos = response.data?.content || [];
//       const ngoSelect = document.getElementById('ngoFilter');
//       ngoSelect.innerHTML = '<option value="">All NGOs</option>';

//       ngos.forEach(ngo => {
//         if (ngo.id !== undefined && ngo.organizationName) {
//           const option = document.createElement('option');
//           option.value = ngo.id;
//           option.textContent = ngo.organizationName;
//           ngoSelect.appendChild(option);
//         }
//       });
//     })
//     .catch(error => console.error("Error loading NGOs:", error));
// }
// participant-management.js

document.addEventListener("DOMContentLoaded", function () {
  loadParticipants();
  loadFilterOptions();

  document.getElementById("searchInput").addEventListener("input", function () {
    const searchText = this.value.trim().toLowerCase();
    filterParticipantsLocally(searchText);
  });
});

let currentPage = 0;
const pageSize = 10;
let allParticipants = [];

function loadParticipants(page = 0) {
  currentPage = page;

  Api.participant.listAll(0, 1000, {}) // Fetch all for client-side filtering
    .then((response) => {
      allParticipants = response.data?.content || [];
      renderParticipantsTable(getPaginatedData(allParticipants));
      renderPagination(getTotalPages(allParticipants));
    })
    .catch((error) => {
      console.error("Error loading participants:", error);
      showError("Error loading participants.");
    });
}

function renderParticipantsTable(participants) {
  const tbody = document.querySelector("tbody.table-border-bottom-0");
  tbody.innerHTML = "";

  if (participants.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" class="text-center py-4 text-danger">No matching participants found.</td></tr>`;
    return;
  }

  participants.forEach((participant, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${index + 1 + currentPage * pageSize}</td>
      <td>${participant.participantName}</td>
      <td>${participant.participantEmail}</td>
      <td>${participant.participantMobileNumber}</td>
      <td>${participant.organizationName || '-'}</td>
      <td>${participant.amount ? Number(participant.amount).toLocaleString() : '-'}</td>
      <td>${participant.token}</td>
      <td>${participant.status || '-'}</td>
      <td>
        <div class="dropdown">
          <button class="btn p-0" type="button" data-bs-toggle="dropdown">
            <i class="bx bx-dots-vertical-rounded"></i>
          </button>
          <ul class="dropdown-menu">
            <li><a class="dropdown-item" href="participant-form.html?id=${participant.participantID}">
              <i class="bx bx-edit me-1"></i> Edit</a></li>
            <li><a class="dropdown-item" href="javascript:void(0);" onclick="deleteParticipant(${participant.participantID})">
              <i class="bx bx-trash me-1"></i> Delete</a></li>
          </ul>
        </div>
      </td>
    `;
    tbody.appendChild(row);
  });
}

function renderPagination(totalPages) {
  const paginationUl = document.querySelector(".pagination");
  paginationUl.innerHTML = "";

  const prevDisabled = currentPage === 0 ? "disabled" : "";
  paginationUl.innerHTML += `
    <li class="page-item ${prevDisabled}">
      <a class="page-link" href="javascript:void(0);" onclick="changePage(${currentPage - 1})">
        <i class="tf-icon bx bx-chevron-left"></i>
      </a>
    </li>
  `;

  for (let i = 0; i < totalPages; i++) {
    paginationUl.innerHTML += `
      <li class="page-item ${currentPage === i ? 'active' : ''}">
        <a class="page-link" href="javascript:void(0);" onclick="changePage(${i})">${i + 1}</a>
      </li>
    `;
  }

  const nextDisabled = currentPage === totalPages - 1 ? "disabled" : "";
  paginationUl.innerHTML += `
    <li class="page-item ${nextDisabled}">
      <a class="page-link" href="javascript:void(0);" onclick="changePage(${currentPage + 1})">
        <i class="tf-icon bx bx-chevron-right"></i>
      </a>
    </li>
  `;
}

function changePage(newPage) {
  if (newPage < 0 || newPage >= getTotalPages(allParticipants)) return;
  currentPage = newPage;
  renderParticipantsTable(getPaginatedData(allParticipants));
  renderPagination(getTotalPages(allParticipants));
  window.scrollTo(0, 0);
}

function getPaginatedData(data) {
  const start = currentPage * pageSize;
  return data.slice(start, start + pageSize);
}

function getTotalPages(data) {
  return Math.ceil(data.length / pageSize);
}

function filterParticipantsLocally(searchText) {
  const filtered = allParticipants.filter(p => {
    return (
      p.participantName?.toLowerCase().includes(searchText) ||
      p.participantEmail?.toLowerCase().includes(searchText) ||
      p.participantMobileNumber?.includes(searchText) ||
      p.organizationName?.toLowerCase().includes(searchText) ||
      String(p.amount)?.toLowerCase().includes(searchText) ||
      p.token?.toLowerCase().includes(searchText) ||
      p.status?.toLowerCase().includes(searchText)
    );
  });
  currentPage = 0;
  renderParticipantsTable(getPaginatedData(filtered));
  renderPagination(getTotalPages(filtered));
}


function deleteParticipant(id) {
  const confirmDelete = confirm("Are you sure you want to delete this participant?");
  if (!confirmDelete) return;

  Api.participant.delete(id)
    .then(() => {
      alert("Participant deleted successfully.");
      loadParticipants();
    })
    .catch((error) => {
      console.error("Failed to delete participant:", error);
      alert("Failed to delete participant. Please try again.");
    });
}

function loadFilterOptions() {
  Api.category.listAll()
    .then(response => {
      const categories = response.data || [];
      const categorySelect = document.getElementById('categoryFilter');
      if (categorySelect) {
        categorySelect.innerHTML = '<option value="">All Categories</option>';
        categories.forEach(category => {
          if (category.id !== undefined && category.categoryName) {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.categoryName;
            categorySelect.appendChild(option);
          }
        });
      }
    })
    .catch(error => console.error("Error loading categories:", error));

  Api.ngo.listAll()
    .then(response => {
      const ngos = response.data?.content || [];
      const ngoSelect = document.getElementById('ngoFilter');
      if (ngoSelect) {
        ngoSelect.innerHTML = '<option value="">All NGOs</option>';
        ngos.forEach(ngo => {
          if (ngo.id !== undefined && ngo.organizationName) {
            const option = document.createElement('option');
            option.value = ngo.id;
            option.textContent = ngo.organizationName;
            ngoSelect.appendChild(option);
          }
        });
      }
    })
    .catch(error => console.error("Error loading NGOs:", error));
}

function showError(message) {
  const tbody = document.querySelector("tbody.table-border-bottom-0");
  if (tbody) {
    tbody.innerHTML = `
      <tr>
        <td colspan="9" class="text-center py-4 text-danger">${message}</td>
      </tr>
    `;
  }
}
