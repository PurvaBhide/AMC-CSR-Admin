// participant-management.js

document.addEventListener("DOMContentLoaded", function () {
  loadParticipants();
  loadFilterOptions();

  document.getElementById('categoryFilter').addEventListener('change', () => loadParticipants(0));
  document.getElementById('ngoFilter').addEventListener('change', () => loadParticipants(0));
  document.getElementById('budgetFilter').addEventListener('change', () => loadParticipants(0));
});


let currentPage = 0;
const pageSize = 5; // Based on your API's "pageSize" value

function loadParticipants(page = 0) {
  currentPage = page;

  const category = document.getElementById('categoryFilter').value.trim();
  const ngo = document.getElementById('ngoFilter').value.trim();
  const budget = document.getElementById('budgetFilter').value;

  let [minBudget, maxBudget] = budget ? budget.split('-') : [null, null];
  minBudget = minBudget ? parseInt(minBudget) : null;
  maxBudget = maxBudget ? parseInt(maxBudget) : null;

  const filters = {};
  if (category) filters.category = category;
  if (ngo) filters.ngo = ngo;
  if (minBudget != null) filters.minBudget = minBudget;
  if (maxBudget != null) filters.maxBudget = maxBudget;

  Api.participant.listAll(page, pageSize, filters)
    .then((response) => {
      const participants = response.data.content;
      const totalPages = response.data.totalPages;
      renderParticipantsTable(participants);
      renderPagination(totalPages);
    })
    .catch((error) => {
      console.error("Error loading participants:", error);
    });
}



function renderParticipantsTable(participants) {
  const tbody = document.querySelector("tbody.table-border-bottom-0");
  tbody.innerHTML = ""; // Clear existing rows

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
  paginationUl.innerHTML = ""; // Clear current pagination

  const prevDisabled = currentPage === 0 ? "disabled" : "";
  paginationUl.innerHTML += `
    <li class="page-item ${prevDisabled}">
      <a class="page-link" href="javascript:void(0);" onclick="loadParticipants(${currentPage - 1})">
        <i class="tf-icon bx bx-chevron-left"></i>
      </a>
    </li>
  `;

  for (let i = 0; i < totalPages; i++) {
    paginationUl.innerHTML += `
      <li class="page-item ${currentPage === i ? 'active' : ''}">
        <a class="page-link" href="javascript:void(0);" onclick="loadParticipants(${i})">${i + 1}</a>
      </li>
    `;
  }

  const nextDisabled = currentPage === totalPages - 1 ? "disabled" : "";
  paginationUl.innerHTML += `
    <li class="page-item ${nextDisabled}">
      <a class="page-link" href="javascript:void(0);" onclick="loadParticipants(${currentPage + 1})">
        <i class="tf-icon bx bx-chevron-right"></i>
      </a>
    </li>
  `;
}

function deleteParticipant(id) {
  const confirmDelete = confirm("Are you sure you want to delete this participant?");
  if (!confirmDelete) return;

  Api.participant.delete(id)
    .then(() => {
      alert("Participant deleted successfully.");
      loadParticipants(); // Reload the table
    })
    .catch((error) => {
      console.error("Failed to delete participant:", error);
      alert("Failed to delete participant. Please try again.");
    });
}

function loadFilterOptions() {
  // Load Categories
  Api.category.listAll()
    .then(response => {
      const categories = response.data;
      const categorySelect = document.getElementById('categoryFilter');
      categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.categoryName;
        option.textContent = category.categoryName;
        categorySelect.appendChild(option);
      });
    });

  // Load NGOs - assuming you have Api.ngo.listAll()
//   Api.ngo.listAll()
//     .then(response => {
//       const ngos = response.data;
//       const ngoSelect = document.getElementById('ngoFilter');
//       ngos.forEach(ngo => {
//         const option = document.createElement('option');
//         option.value = ngo.ngoname;
//         option.textContent = ngo.ngoname;
//         ngoSelect.appendChild(option);
//       });
//     });
}
