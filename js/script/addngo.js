let id = null;
const uploadedFiles = {};

// 🔹 Get ID from URL
function getUrlParam(key) {
  const params = new URLSearchParams(window.location.search);
  return params.get(key);
}

document.addEventListener('DOMContentLoaded', () => {
  id = getUrlParam('id');
  console.log('NGO form loaded with ID:', id);

  if (id) {
    loadNgoData(id);
    // Show update button and hide save button when editing
    toggleButtons(true);
  } else {
    // Show save button and hide update button when creating
    toggleButtons(false);
  }

  setupFileUploadListeners();
  setupFormSubmission();
  setupPasswordToggle();
});

// 🔹 Toggle buttons based on edit mode
function toggleButtons(isEditMode) {
  const saveBtn = document.querySelector('button[type="submit"]');
  const updateBtn = document.querySelector('button[onclick="updateNgo()"]');
  
  if (saveBtn && updateBtn) {
    if (isEditMode) {
      saveBtn.style.display = 'none';
      updateBtn.style.display = 'inline-block';
    } else {
      saveBtn.style.display = 'inline-block';
      updateBtn.style.display = 'none';
    }
  }
}

// 🔹 Status message
function statusMsg(msg) {
  const statusEl = document.getElementById('uploadStatus');
  if (statusEl) {
    statusEl.innerText = msg;
    statusEl.style.display = 'block';
  } else {
    // Create status element if it doesn't exist
    const statusDiv = document.createElement('div');
    statusDiv.id = 'uploadStatus';
    statusDiv.className = 'alert alert-info mt-3';
    statusDiv.innerText = msg;
    const form = document.getElementById('ngoForm');
    if (form) {
      form.appendChild(statusDiv);
    } else {
      alert(msg);
    }
  }
}

// 🔹 Upload file and return URL
async function getFileUrl(fileInput, isImage = false) {
  const file = fileInput.files[0];
  if (!file) return null;

  const formData = new FormData();
  formData.append('files', file);

  const uploadEndpoint = isImage
    ? 'https://mumbailocal.org:8087/upload/images'
    : 'https://mumbailocal.org:8087/upload/documents';

  statusMsg(`Uploading ${file.name}...`);

  try {
    const res = await fetch(uploadEndpoint, {
      method: 'POST',
      body: formData,
    });
    const result = await res.json();

    if (result.status === 200 || result.success) {
      const url = result.uploadedUrls?.[0] || result.fileUrl || result.url;
      statusMsg(`✅ ${file.name} uploaded successfully`);
      return url;
    } else {
      throw new Error(result.message || 'Upload failed');
    }
  } catch (err) {
    statusMsg(`❌ Upload failed: ${err.message}`);
    return null;
  }
}

// 🔹 Setup file upload listeners
function setupFileUploadListeners() {
  const fileFields = [
    { id: 'ngo80Gdocument', previewId: 'preview80G', label: '80G Document' },
    { id: 'ngo12Adocument', previewId: 'preview12A', label: '12A Document' },
    { id: 'caCertifiedStatementUpload', previewId: 'previewCA', label: 'CA Certified Statement' },
    { id: 'organizationRegistrationCertificate', previewId: 'previewRegistration', label: 'Registration Certificate' },
    { id: 'csr1Document', previewId: 'previewCSR1', label: 'CSR-1 Document' },
    { id: 'bylaws', previewId: 'previewBylaws', label: 'Bylaws' },
    { id: 'moa', previewId: 'previewMOA', label: 'MOA' }
  ];

  fileFields.forEach(({ id, previewId, label }) => {
    const input = document.getElementById(id);
    if (input) {
      input.addEventListener('change', async () => {
        const url = await getFileUrl(input);
        if (url) {
          uploadedFiles[id] = url;
          displayDocument(label, url, previewId);
        }
      });
    }
  });
}

// 🔹 Display document/image preview
function displayDocument(label, url, containerId) {
  if (!url) return;
  
  const ext = url.split('.').pop().toLowerCase();
  const container = document.getElementById(containerId);
  if (!container) return;

  let content = '';
  if (ext === 'pdf') {
    content = `
      <div class="mt-2 p-2 border rounded">
        <strong>${label}:</strong> 
        <a href="${url}" target="_blank" class="btn btn-sm btn-outline-primary ms-2">
          <i class="fas fa-file-pdf"></i> View PDF
        </a>
      </div>
    `;
  } else if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) {
    content = `
      <div class="mt-2 p-2 border rounded">
        <strong>${label}:</strong><br>
        <img src="${url}" alt="${label}" class="img-thumbnail mt-2" style="max-width: 150px; max-height: 150px;">
        <br>
        <a href="${url}" target="_blank" class="btn btn-sm btn-outline-primary mt-2">
          <i class="fas fa-external-link-alt"></i> View Full Size
        </a>
      </div>
    `;
  } else {
    content = `
      <div class="mt-2 p-2 border rounded">
        <strong>${label}:</strong> 
        <a href="${url}" target="_blank" class="btn btn-sm btn-outline-primary ms-2">
          <i class="fas fa-file"></i> View Document
        </a>
      </div>
    `;
  }
  
  container.innerHTML = content;
}

// 🔹 Password show/hide toggle
function setupPasswordToggle() {
  const toggle = document.getElementById("togglePassword");
  if (toggle) {
    toggle.addEventListener("click", () => {
      const input = document.getElementById("password");
      const icon = document.getElementById("toggleIcon");
      const show = input.type === "password";
      input.type = show ? "text" : "password";
      icon.classList.toggle("fa-eye");
      icon.classList.toggle("fa-eye-slash");
    });
  }
}

// 🔹 Form submit: Add NGO
function setupFormSubmission() {
  const form = document.getElementById('ngoForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    await saveNgo();
  });
}

// 🔹 Save NGO (Create new)
async function saveNgo() {
  const form = document.getElementById('ngoForm');
  if (!form) return;

  const payload = buildPayload(form);
  
  try {
    const res = await fetch('https://mumbailocal.org:8087/addngo', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    const result = await res.json();
    console.log('Save response:', result);
    
    // Check if the response indicates success
    if (result && (result.id || result.status === 201 || result.success)) {
      statusMsg('✅ NGO added successfully. Redirecting...');
      form.reset();
      clearUploadedFiles();
      clearPreviews();
      
      // Log success and redirect after a short delay
      if (result.id) {
        console.log('NGO created with ID:', result.id);
      }
      
      // Redirect to NGO list page after 1.5 seconds
      setTimeout(() => {
        window.location.href = 'ngoPartnersList.html';
      }, 1500);
      
    } else if (result && result.message) {
      throw new Error(result.message);
    } else {
      throw new Error('Save response format not recognized');
    }
  } catch (err) {
    console.error('Save error:', err);
    statusMsg(`❌ Submission failed: ${err.message}`);
  }
}

// 🔹 Update NGO (Edit existing) - This was missing!
async function updateNgo() {
  if (!id) {
    statusMsg('❌ No NGO ID found for update');
    return;
  }

  const form = document.getElementById('ngoForm');
  if (!form) return;

  const payload = buildPayload(form);
  
  try {
    const res = await fetch(`https://mumbailocal.org:8087/updateNgo/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    const result = await res.json();
    console.log('Update response:', result);
    
    // Check if the response contains an NGO object with an ID (indicates success)
    if (result && (result.id || result.status === 200 || result.success)) {
      statusMsg('✅ NGO updated successfully. Redirecting...');
      
      // Log success data
      if (result.id) {
        console.log('NGO updated with data:', result);
      }
      
      // Redirect to NGO list page after 1.5 seconds
      setTimeout(() => {
        window.location.href = 'ngoPartnersList.html';
      }, 1500);
      
    } else if (result && result.message) {
      throw new Error(result.message);
    } else {
      throw new Error('Update response format not recognized');
    }
  } catch (err) {
    console.error('Update error:', err);
    statusMsg(`❌ Update failed: ${err.message}`);
  }
}

// 🔹 Build payload object
function buildPayload(form) {
  return {
    organizationName: form.organizationName.value,
    emailId: form.emailId.value,
    userName: form.userName.value,
    password: form.password.value,
    ageOfOrganization: parseInt(form.ageOfOrganization.value) || 0,
    annualTurnover: parseInt(form.annualTurnover.value) || 0,
    nameOfContactPerson: form.nameOfContactPerson.value,
    contactNumber: form.contactNumber.value,
    ngo80GregistrationNumber: form.ngo80GregistrationNumber.value,
    ngo80Gdocument: uploadedFiles['ngo80Gdocument'] || '',
    ngo12AregistrationNumber: form.ngo12AregistrationNumber.value,
    ngo12Adocument: uploadedFiles['ngo12Adocument'] || '',
    caCertifiedStatementUpload: uploadedFiles['caCertifiedStatementUpload'] || '',
    organizationRegistrationCertificate: uploadedFiles['organizationRegistrationCertificate'] || '',
    csr1RegistartionNumber: form.csr1RegistartionNumber.value,
    csr1Document: uploadedFiles['csr1Document'] || '',
    bylaws: uploadedFiles['bylaws'] || '',
    moa: uploadedFiles['moa'] || '',
    status: form.status.value,
    captchaCode: "X9T4B2",
    category: {
      id: parseInt(form.categoryId.value) || 0
    }
  };
}

// 🔹 Clear uploaded files
function clearUploadedFiles() {
  Object.keys(uploadedFiles).forEach(key => delete uploadedFiles[key]);
}

// 🔹 Clear all previews
function clearPreviews() {
  const previewIds = [
    'preview80G', 'preview12A', 'previewCA', 'previewRegistration',
    'previewCSR1', 'previewBylaws', 'previewMOA'
  ];
  
  previewIds.forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      element.innerHTML = '';
    }
  });
}

// 🔹 Load NGO data by ID
async function loadNgoData(id) {
  try {
    const res = await fetch(`https://mumbailocal.org:8087/getNgoById/${id}`);
    const data = await res.json();
    
    if (!data) {
      statusMsg('❌ No data found for this NGO');
      return;
    }

    // Populate form fields
    const form = document.getElementById('ngoForm');
    if (form) {
      form.organizationName.value = data.organizationName || '';
      form.emailId.value = data.emailId || '';
      form.userName.value = data.userName || '';
      form.password.value = data.password || '';
      form.ageOfOrganization.value = data.ageOfOrganization || '';
      form.annualTurnover.value = data.annualTurnover || '';
      form.ngo80GregistrationNumber.value = data.ngo80GregistrationNumber || '';
      form.nameOfContactPerson.value = data.nameOfContactPerson || '';
      form.contactNumber.value = data.contactNumber || '';
      form.ngo12AregistrationNumber.value = data.ngo12AregistrationNumber || '';
      form.csr1RegistartionNumber.value = data.csr1RegistartionNumber || '';
      form.status.value = data.status || '';
      
      // Handle category
      if (data.category && data.category.id) {
        form.categoryId.value = data.category.id;
      }
    }

    // Store uploaded file URLs
    const fileFields = [
      'ngo80Gdocument', 'ngo12Adocument', 'caCertifiedStatementUpload',
      'organizationRegistrationCertificate', 'csr1Document', 'bylaws', 'moa'
    ];
    
    fileFields.forEach(field => {
      if (data[field]) {
        uploadedFiles[field] = data[field];
      }
    });

    // Display document previews
    displayDocument("80G Document", data.ngo80Gdocument, "preview80G");
    displayDocument("12A Document", data.ngo12Adocument, "preview12A");
    displayDocument("CA Certified Statement", data.caCertifiedStatementUpload, "previewCA");
    displayDocument("Registration Certificate", data.organizationRegistrationCertificate, "previewRegistration");
    displayDocument("CSR-1 Document", data.csr1Document, "previewCSR1");
    displayDocument("Bylaws", data.bylaws, "previewBylaws");
    displayDocument("MOA", data.moa, "previewMOA");
    
    statusMsg('✅ NGO data loaded successfully');
    
  } catch (err) {
    statusMsg(`❌ Failed to load NGO data: ${err.message}`);
    console.error('Error loading NGO data:', err);
  }
}

// Make updateNgo available globally for the onclick handler
window.updateNgo = updateNgo;



// // Password visibility toggle
document.getElementById("togglePassword").addEventListener("click", function () {
    const passwordInput = document.getElementById("password");
    const icon = document.getElementById("toggleIcon");

    const isPassword = passwordInput.type === "password";
    passwordInput.type = isPassword ? "text" : "password";

    icon.classList.toggle("fa-eye");
    icon.classList.toggle("fa-eye-slash");
});
