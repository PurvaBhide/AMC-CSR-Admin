// participant-management.js

document.addEventListener("DOMContentLoaded", function () {
  loadParticipants();
});

let currentPage = 0;
const pageSize = 10;

function loadParticipants(page = 0) {
  currentPage = page;

  if (!Api.participant || typeof Api.participant.listAll !== 'function') {
    console.error("Api.participant.listAll() is not available");
    return;
  }

  Api.participant.listAll()
    .then((response) => {
      const participants = response.data.content;
      renderParticipantsTable(participants);
      // Pagination can be implemented if totalPages is available in response
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
