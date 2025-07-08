// participant-form.js
document.addEventListener("DOMContentLoaded", function() {
  const urlParams = new URLSearchParams(window.location.search);
  const participantId = urlParams.get('id');

  if (participantId) {
    loadParticipantData(participantId);
  }

  document.getElementById('participantForm').addEventListener('submit', handleFormSubmit);
});

function loadParticipantData(id) {
  Api.participant.getById(id)
    .then(response => {
      const participant = response.data;
      document.getElementById('participantID').value = participant.participantID;
      document.getElementById('participantName').value = participant.participantName;
      document.getElementById('participantEmail').value = participant.participantEmail;
      document.getElementById('participantMobileNumber').value = participant.participantMobileNumber;
      document.getElementById('organizationName').value = participant.organizationName || '';
      document.getElementById('token').value = participant.token || '';

      document.getElementById('amount').value = participant.amount || '';
      document.getElementById('status').value = participant.status || 'ACTIVE';
    })
    .catch(error => {
      console.error("Error loading participant:", error);
      alert("Failed to load participant data");
    });
}

function handleFormSubmit(e) {
  e.preventDefault();

  const participantData = {
    participantName: document.getElementById('participantName').value,
    participantEmail: document.getElementById('participantEmail').value,
    participantMobileNumber: document.getElementById('participantMobileNumber').value,
    organizationName: document.getElementById('organizationName').value,
    amount: document.getElementById('amount').value,
    status: document.getElementById('status').value
  };

  const participantId = document.getElementById('participantID').value;

  if (participantId) {
    // Update existing participant
    Api.participant.update(participantId, participantData)
      .then(() => {
        alert("Participant updated successfully");
        window.location.href = "donationlist.html";
      })
      .catch(error => {
        console.error("Error updating participant:", error);
        alert("Failed to update participant");
      });
  } else {
    // Create new participant (if needed)
    Api.participant.create(participantData)
      .then(() => {
        alert("Participant created successfully");
        window.location.href = "donationlist.html";
      })
      .catch(error => {
        console.error("Error creating participant:", error);
        alert("Failed to create participant");
      });
  }
}
