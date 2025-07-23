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
      const participant = response.data.participant;
      const project = response.data.project;
      console.log(project,"participant")
      document.getElementById('participantID').value = participant.participantID;
      document.getElementById('participantName').value = participant.participantName;
      document.getElementById('participantEmail').value = participant.participantEmail;
      document.getElementById('participantMobileNumber').value = participant.participantMobileNumber;
      document.getElementById('organizationName').value = participant.organizationName || '';
      document.getElementById('token').value = participant.token || '';

      document.getElementById('amount').value = participant.amount || '';
      document.getElementById('status').value = participant.status || 'ACTIVE';
      document.getElementById('projectName').value= project.projectName||'';
      document.getElementById('projectShortDescription').value= project.projectShortDescription||'';
      document.getElementById('projectDEpartmentName').value= project.projectDEpartmentName||'';
      document.getElementById('projectBudget').value= project.projectBudget||'';
      document.getElementById('projectStatus').value= project.projectStatus||'';

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






// Updated frontend code to work with your existing EmailService
function communicatin() {
  console.log("User clicked on communicate button");
  
  try {
    // Get participant details
    const participantEmail = document.getElementById('participantEmail').value;
    const participantName = document.getElementById('participantName').value;
    const projectName = document.getElementById('projectName').value;
    const amount = document.getElementById('amount').value;
    
    // Validate email
    if (!participantEmail || !isValidEmail(participantEmail)) {
      alert("Please enter a valid participant email address before communicating.");
      document.getElementById('participantEmail').focus();
      return;
    }
    
    // Open email compose modal
    openEmailModal(participantEmail, participantName, projectName, amount);
    
  } catch (error) {
    console.error('❌ Error in communication function:', error);
    alert('Error opening communication interface. Please try again.');
  }
}

// Email modal - simplified for your service
function openEmailModal(recipientEmail, recipientName, projectName, amount) {
  // Pre-fill default subject and message
  const defaultSubject = `Regarding Your Donation${projectName ? ` - ${projectName}` : ''}`;
  const defaultMessage = `Dear ${recipientName || 'Participant'},\n\n` +
    `Thank you for your interest in our project${projectName ? ` "${projectName}"` : ''}.\n\n` +
    `${amount ? `Your donation amount: ₹${parseFloat(amount).toLocaleString('en-IN')}\n\n` : ''}` +
    `We appreciate your support and would like to discuss further details with you.\n\n` +
    `Best regards,\n` +
    `Amdavad Municipal Corporation CSR Portal` ;
  
  // Remove existing modal if present
  const existingModal = document.getElementById('emailModal');
  if (existingModal) {
    existingModal.remove();
  }
  
  // Create modal
  const modal = document.createElement('div');
  modal.className = 'modal fade';
  modal.id = 'emailModal';
  modal.innerHTML = `
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            <i class="bx bx-envelope me-2"></i>
            Send Email to ${recipientName || 'Participant'}
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
          <form id="emailForm">
            <div class="mb-3">
              <label class="form-label">To:</label>
              <input type="email" class="form-control" id="emailTo" value="${recipientEmail}" readonly>
            </div>
            <div class="mb-3">
              <label class="form-label">Subject:</label>
              <input type="text" class="form-control" id="emailSubject" value="${defaultSubject}" required>
            </div>
            <div class="mb-3">
              <label class="form-label">Message:</label>
              <textarea class="form-control" id="emailMessage" rows="10" required>${defaultMessage}</textarea>
            </div>
            
            <!-- Email status alerts -->
            <div class="alert alert-success d-none" id="emailSuccessAlert">
              <i class="bx bx-check-circle me-2"></i>
              <strong>Success!</strong> Email sent successfully.
            </div>
            
            <div class="alert alert-danger d-none" id="emailErrorAlert">
              <i class="bx bx-error-circle me-2"></i>
              <strong>Error:</strong> <span id="emailErrorMessage"></span>
            </div>
            
            <!-- Sending method selection -->
            <div class="alert alert-info">
              <i class="bx bx-info-circle me-2"></i>
              <strong>Choose how to send:</strong>
              <div class="mt-2">
                <div class="form-check">
                  <input class="form-check-input" type="radio" name="sendMethod" id="sendViaAPI" value="api" checked>
                  <label class="form-check-label" for="sendViaAPI">
                    <strong>Send Automatically</strong> - Email will be sent directly from server
                  </label>
                </div>
                <div class="form-check">
                  <input class="form-check-input" type="radio" name="sendMethod" id="sendViaMailto" value="mailto">
                  <label class="form-check-label" for="sendViaMailto">
                    <strong>Open Email Client</strong> - Open Gmail/Outlook with pre-filled message
                  </label>
                </div>
              </div>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
            <i class="bx bx-x me-2"></i>Cancel
          </button>
          <button type="button" class="btn btn-primary" onclick="sendEmail()" id="sendEmailBtn">
            <i class="bx bx-send me-2"></i>Send Email
          </button>
        </div>
      </div>
    </div>
  `;
  
  // Add modal to body
  document.body.appendChild(modal);
  
  // Show modal
  const bootstrapModal = new bootstrap.Modal(modal);
  bootstrapModal.show();
  
  // Remove modal when hidden
  modal.addEventListener('hidden.bs.modal', function () {
    document.body.removeChild(modal);
  });
}

// Send email function - works with your existing service
async function sendEmail() {
  const to = document.getElementById('emailTo').value;
  const subject = document.getElementById('emailSubject').value;
  const body = document.getElementById('emailMessage').value;
  const sendMethod = document.querySelector('input[name="sendMethod"]:checked').value;
  
  // Validate inputs
  if (!to || !subject || !body) {
    alert('Please fill in all required fields.');
    return;
  }
  
  // Get UI elements
  const sendBtn = document.getElementById('sendEmailBtn');
  const successAlert = document.getElementById('emailSuccessAlert');
  const errorAlert = document.getElementById('emailErrorAlert');
  const errorMessage = document.getElementById('emailErrorMessage');
  
  // Hide previous alerts
  successAlert.classList.add('d-none');
  errorAlert.classList.add('d-none');
  
  if (sendMethod === 'api') {
    // Send via your API
    try {
      // Show loading state
      const originalContent = sendBtn.innerHTML;
      sendBtn.innerHTML = '<i class="bx bx-loader-alt bx-spin me-2"></i>Sending...';
      sendBtn.disabled = true;
      
      console.log('📧 Sending email via API:', { to, subject });
      
      // Call your API endpoint
      const response = await fetch('https://mumbailocal.org:8087/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          to: to,
          subject: subject,
          body: body
        })
      });
      
      const result = await response.json();
      console.log('📧 API Response:', result);
      
      if (result.success) {
        // Show success message
        successAlert.classList.remove('d-none');
        
        // Update button
        sendBtn.innerHTML = '<i class="bx bx-check me-2"></i>Email Sent!';
        sendBtn.classList.remove('btn-primary');
        sendBtn.classList.add('btn-success');
        
        console.log('✅ Email sent successfully via API');
        
        // Close modal after 2 seconds
        setTimeout(() => {
          const modal = bootstrap.Modal.getInstance(document.getElementById('emailModal'));
          if (modal) {
            modal.hide();
          }
        }, 2000);
        
      } else {
        // Show error message
        errorMessage.textContent = result.error || 'Unknown error occurred';
        errorAlert.classList.remove('d-none');
        
        // Reset button
        sendBtn.innerHTML = originalContent;
        sendBtn.disabled = false;
      }
      
    } catch (error) {
      console.error('❌ Error sending email via API:', error);
      
      // Show error message
      errorMessage.textContent = 'Network error: ' + error.message;
      errorAlert.classList.remove('d-none');
      
      // Reset button
      sendBtn.innerHTML = '<i class="bx bx-send me-2"></i>Send Email';
      sendBtn.disabled = false;
    }
    
  } else {
    // Send via mailto (fallback option)
    try {
      const mailtoUrl = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      
      console.log('📧 Opening mailto for:', to);
      window.location.href = mailtoUrl;
      
      // Show success message
      setTimeout(() => {
        alert('✅ Email client opened!\n\nPlease check your email application to review and send the message.');
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('emailModal'));
        if (modal) {
          modal.hide();
        }
      }, 1000);
      
    } catch (error) {
      console.error('❌ Error opening mailto:', error);
      alert('Error opening email client. Please try the automatic method instead.');
    }
  }
}

// Quick email templates
function useTemplate(templateType) {
  const participantName = document.getElementById('participantName').value;
  const projectName = document.getElementById('projectName').value;
  const amount = document.getElementById('amount').value;
  
  let subject, message;
  
  switch (templateType) {
    case 'confirmation':
      subject = 'Donation Confirmation - Thank You!';
      message = `Dear ${participantName || 'Participant'},\n\n` +
               `Thank you for your generous donation of ₹${parseFloat(amount || 0).toLocaleString('en-IN')} ` +
               `towards the project "${projectName}".\n\n` +
               `Your contribution will make a significant impact on our cause.\n\n` +
               `Best regards,\n` +
               `Amdavad Municipal Corporation CSR Portal\n`;
      break;
      
    case 'reminder':
      subject = 'Donation Reminder - We Value Your Support';
      message = `Dear ${participantName || 'Participant'},\n\n` +
               `We hope this email finds you well.\n\n` +
               `This is a gentle reminder about your pledge towards the project "${projectName}". ` +
               `Your support means a lot to us and will help us achieve our goals.\n\n` +
               `Best regards,\n` +
               `Amdavad Municipal Corporation CSR Portal\n` ;
      break;
      
    case 'update':
      subject = `Project Update - ${projectName}`;
      message = `Dear ${participantName || 'Participant'},\n\n` +
               `We wanted to share some exciting updates about the project "${projectName}".\n\n` +
               `[Please add specific project updates here]\n\n` +
               `Best regards,\n` +
               `Amdavad Municipal Corporation CSR Portal`;
      break;
      
    default:
      return;
  }
  
  // Update modal fields if modal is open
  const subjectField = document.getElementById('emailSubject');
  const messageField = document.getElementById('emailMessage');
  
  if (subjectField && messageField) {
    subjectField.value = subject;
    messageField.value = message;
  }
}

// Utility function to validate email
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Quick template functions for buttons
function sendDonationConfirmation() {
  const participantEmail = document.getElementById('participantEmail').value;
  if (!participantEmail || !isValidEmail(participantEmail)) {
    alert("Please enter a valid participant email address first.");
    return;
  }
  
  communicatin();
  setTimeout(() => useTemplate('confirmation'), 500);
}

function sendDonationReminder() {
  const participantEmail = document.getElementById('participantEmail').value;
  if (!participantEmail || !isValidEmail(participantEmail)) {
    alert("Please enter a valid participant email address first.");
    return;
  }
  
  communicatin();
  setTimeout(() => useTemplate('reminder'), 500);
}

function sendProjectUpdate() {
  const participantEmail = document.getElementById('participantEmail').value;
  if (!participantEmail || !isValidEmail(participantEmail)) {
    alert("Please enter a valid participant email address first.");
    return;
  }
  
  communicatin();
  setTimeout(() => useTemplate('update'), 500);
}