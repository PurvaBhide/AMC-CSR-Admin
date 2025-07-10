
function saveFundanidea() {
  const id = getUrlParam('id');
  if (id) {
    updateFundanidea(id);
  } else {
    createFundanidea();
  }
}document.addEventListener('DOMContentLoaded', function () {
 
  setTimeout(() => {
    const id = getUrlParam('id');
 
    if (id) {
        setFormMode(true); 
            fetchFundanIdea(id);
    } else {
        setFormMode(false);
      initializeEmptyForm();
    }
   setTimeout(() => {
      const saveBtn = document.getElementById('saveBtn');
      const submitBtn = document.getElementById('submitBtn');
      }, 200);
  }, 100);
});

let findanidea = {}; 
let isEditMode = false; 

function getUrlParam(key) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(key);
}

function setElementVisibility(elementId, isVisible) {
  const element = document.getElementById(elementId);
  if (element) {
    if (isVisible) {
      element.style.display = 'inline-block';
      element.style.visibility = 'visible';
      element.removeAttribute('hidden');
      element.classList.remove('d-none');
    } else {
      element.style.display = 'none';
      element.style.visibility = 'hidden';
      element.setAttribute('hidden', 'true');
      element.classList.add('d-none');
    }
   } else {
    console.warn(`Element ${elementId} not found`);
  }
}

// Function to set form mode
function setFormMode(isEdit) {
  setElementVisibility('saveBtn', isEdit);
  setElementVisibility('submitBtn', !isEdit);
   const tokenField = document.getElementById('fundanideatoken');
  const tokenContainer = tokenField?.closest('.col-md-6');
  if (tokenContainer) {
    if (isEdit) {
      tokenContainer.style.display = 'block';
      tokenContainer.style.visibility = 'visible';
      tokenContainer.removeAttribute('hidden');
      tokenContainer.classList.remove('d-none');
    } else {
      tokenContainer.style.display = 'none';
      tokenContainer.style.visibility = 'hidden';
      tokenContainer.setAttribute('hidden', 'true');
      tokenContainer.classList.add('d-none');
    }
   }
  
  isEditMode = isEdit;
}

function initializeEmptyForm() {
  // Clear all form fields for create mode
  const setElementValue = (id, value) => {
    const element = document.getElementById(id);
    if (element) {
      if (element.tagName === 'SELECT') {
        element.value = value || '';
      } else if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
        element.value = value || '';
      } else {
        element.innerText = value || '';
      }
    }
  };

  setElementValue('natureofproject', '');
  setElementValue('fundanideaprojectlocation', '');
  setElementValue('fundanideaprojectname', '');
  setElementValue('fundanideadepartment', '');
  setElementValue('fundanideadocement_preview', 'No file selected');
  setElementValue('fundanideadescription', '');
  setElementValue('fundanideaorganizationname', '');
  setElementValue('fundanideaemailid', '');
  setElementValue('fundanideaphonenumber', '');
  setElementValue('fundanideacontactpersonname', '');
  setElementValue('fundanideaestimateamount', '');
  setElementValue('fundanideastatus', '');
  setElementValue('fundanideatoken', '');
  
  // Clear image previews only if they exist
  const mainImagePreview = document.getElementById('main_image_preview');
  if (mainImagePreview) {
    mainImagePreview.innerHTML = '';
  }
  
  const galleryPreview = document.getElementById('gallery_images_preview');
  if (galleryPreview) {
    galleryPreview.innerHTML = '';
  }
  
  isEditMode = false;
 
}

// Handle form submission for both create and update
document.getElementById('FundAnIdeaForm').addEventListener('submit', function (e) {
  e.preventDefault();
   const id = getUrlParam('id');
  
  if (id) {
    updateFundanidea(id);
  } else {
     createFundanidea();
  }
});

// Add event listeners for buttons
document.addEventListener('DOMContentLoaded', function() {
  // Add click handler for Save button (edit mode)
  const saveBtn = document.getElementById('saveBtn');
  if (saveBtn) {
    saveBtn.addEventListener('click', function(e) {
      e.preventDefault();
       const id = getUrlParam('id');
      if (id) {
        updateFundanidea(id);
      }
    });
  }

  // Add click handler for Submit button (create mode)
  const submitBtn = document.getElementById('submitBtn');
  if (submitBtn) {
    submitBtn.addEventListener('click', function(e) {
      e.preventDefault();
       createFundanidea();
    });
  }
});

function fetchFundanIdea(id) {
  isEditMode = true;
  
  // Check if the service exists
  if (typeof fundanideaSrevices === 'undefined') {
    console.error('fundanideaSrevices is not defined');
    alert('Service not available. Please check if the service is loaded.');
    return;
  }

  if (!fundanideaSrevices.showbyid) {
    console.error('showbyid method not found in fundanideaSrevices');
    alert('Service method not available.');
    return;
  }
  
  fundanideaSrevices.showbyid(id)
    .then(response => {
        
      if (!response || !response.data) {
         alert('Invalid data received from server.');
        return;
      }
      
      findanidea = response.data;
     
      // Check if form elements exist before populating
      const formElements = [
        'natureofproject', 'fundanideaprojectlocation', 'fundanideaprojectname',
        'fundanideadepartment', 'fundanideadocement_preview', 'fundanideadescription',
        'fundanideaorganizationname', 'fundanideaemailid', 'fundanideaphonenumber',
        'fundanideacontactpersonname', 'fundanideaestimateamount', 'fundanideastatus',
        'fundanideatoken'
      ];

      formElements.forEach(elementId => {
        const element = document.getElementById(elementId);
        if (!element) {
          console.warn(`Element with ID '${elementId}' not found in DOM`);
        }
      });

      // Populate form fields with existing data
      const setValue = (id, value) => {
        const element = document.getElementById(id);
        if (element) {
          if (element.tagName === 'SELECT') {
            element.value = value || '';
          } else if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
            element.value = value || '';
          } else {
            element.innerText = value || 'No data';
          }
          }
      };

      setValue('natureofproject', findanidea.natureofproject);
      setValue('fundanideaprojectlocation', findanidea.fundanideaprojectlocation);
      setValue('fundanideaprojectname', findanidea.fundanideaprojectname);
      setValue('fundanideadepartment', findanidea.fundanideadepartment);
      setValue('fundanideadocement_preview', findanidea.fundanideadocement || 'No file');
      setValue('fundanideadescription', findanidea.fundanideadescription);
      setValue('fundanideaorganizationname', findanidea.fundanideaorganizationname);
      setValue('fundanideaemailid', findanidea.fundanideaemailid);
      setValue('fundanideaphonenumber', findanidea.fundanideaphonenumber);
      setValue('fundanideacontactpersonname', findanidea.fundanideacontactpersonname);
      setValue('fundanideaestimateamount', findanidea.fundanideaestimateamount);
      setValue('fundanideastatus', findanidea.fundanideastatus);
      setValue('fundanideatoken', findanidea.fundanideatoken);

      // Handle main image preview
      const mainImagePreview = document.getElementById('main_image_preview');
      if (mainImagePreview && findanidea.main_image) {
        mainImagePreview.innerHTML = `<img src="${findanidea.main_image}" height="100"/>`;
     }
    const galleryPreview = document.getElementById('gallery_images_preview');
      if (galleryPreview && Array.isArray(findanidea.gallery_images)) {
        const galleryHTML = findanidea.gallery_images.map(img =>
          `<img src="${img}" height="80" class="me-2 mb-2"/>`
        ).join('');
        galleryPreview.innerHTML = galleryHTML;
      }

      const docUrl = findanidea.fundanideadocement;
      if (docUrl) {
        const previewElement = document.getElementById("fundanideadocement_preview");
        if (previewElement) {
          if (docUrl.endsWith(".pdf")) {
            previewElement.innerHTML = `<a href="${docUrl}" target="_blank" style="color: green;">View Uploaded PDF</a>`;
          } else if (docUrl.match(/\.(jpeg|jpg|png|gif|png)$/)) {
            previewElement.innerHTML = `<img src="${docUrl}" alt="Uploaded Image" style="max-width: 100%; height: auto; margin-top: 5px;" />`;
          } else {
            previewElement.innerHTML = `<a href="${docUrl}" target="_blank" style="color: green;">${docUrl}</a>`;
          }
        }
      }
     })
    .catch(error => {
        alert("Failed to fetch idea details. Please try again. Error: " + error.message);
    });
}

function getValueOrOld(id, key) {
  const value = document.getElementById(id)?.value;
  return value?.trim() !== '' ? value : (isEditMode ? findanidea[key] || '' : '');
}

function getFormValue(id) {
  return document.getElementById(id)?.value?.trim() || '';
}

async function uploadAndSetDocument() {
  const fileInput = document.getElementById("fundanideadocement");
  const file = fileInput.files[0];

  if (!file) {
    alert("Please select a file to upload.");
    return;
  }

  const formData = new FormData();
  formData.append("files", file);

  const isImage = file.type.startsWith("image/");
  const isDocument =
    file.type === "application/pdf" ||
    file.type === "application/msword" ||
    file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

  let uploadUrl = "";

  if (isImage) {
    uploadUrl = "https://mumbailocal.org:8087/upload/images";
  } else if (isDocument) {
    uploadUrl = "https://mumbailocal.org:8087/upload/documents";
  } else {
    alert("Unsupported file type!");
    return;
  }

  try {
    const response = await fetch(uploadUrl, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("File upload failed.");
    }

    const result = await response.json();
   
    const uploadedUrl = result.uploadedUrls?.[0] || null;

    if (uploadedUrl) {
      // Store in hidden input
      let hiddenInput = document.getElementById("uploaded_document_url");
      if (!hiddenInput) {
        hiddenInput = document.createElement("input");
        hiddenInput.type = "hidden";
        hiddenInput.id = "uploaded_document_url";
        document.getElementById("FundAnIdeaForm").appendChild(hiddenInput);
      }
      hiddenInput.value = uploadedUrl;

      // Show preview
      const previewElement = document.getElementById("fundanideadocement_preview");

      if (uploadedUrl.endsWith(".pdf")) {
        previewElement.innerHTML = `<a href="${uploadedUrl}" target="_blank" style="color: green;">View PDF Document</a>`;
      } else if (uploadedUrl.match(/\.(jpeg|jpg|png|gif|png)$/)) {
        previewElement.innerHTML = `<img src="${uploadedUrl}" alt="Uploaded Image" style="max-width: 100%; height: auto; margin-top: 5px;" />`;
      } else {
        previewElement.innerHTML = `<a href="${uploadedUrl}" target="_blank" style="color: green;">${uploadedUrl}</a>`;
      }
    }
  } catch (error) {
    console.error("Error uploading file:", error);
    alert("File upload failed. Please try again.");
  }
}

function createFundanidea() {
 
  // Basic validation
  const requiredFields = [
    'natureofproject', 'fundanideaprojectname', 'fundanideadepartment',
    'fundanideaprojectlocation', 'fundanideaorganizationname', 'fundanideaemailid',
    'fundanideaphonenumber', 'fundanideacontactpersonname', 'fundanideaestimateamount',
    'fundanideadescription'
  ];
  
  for (let fieldId of requiredFields) {
    const value = getFormValue(fieldId);
    if (!value) {
      alert(`Please fill in the ${fieldId.replace('fundanidea', '').replace(/([A-Z])/g, ' $1')} field.`);
      document.getElementById(fieldId)?.focus();
      return;
    }
  }

  // Validate estimate amount - must be at least 50,000
  const estimateAmount = parseFloat(getFormValue('fundanideaestimateamount'));
  if (isNaN(estimateAmount) || estimateAmount < 50000) {
    alert('Fund An Idea Estimate Amount must be at least ₹50,000');
    document.getElementById('fundanideaestimateamount')?.focus();
    return;
  }

  // Validate email format
  const email = getFormValue('fundanideaemailid');
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    alert('Please enter a valid email address');
    document.getElementById('fundanideaemailid')?.focus();
    return;
  }

  // Validate phone number
  const phoneNumber = getFormValue('fundanideaphonenumber');
  if (phoneNumber.length < 10) {
    alert('Please enter a valid phone number (at least 10 digits)');
    document.getElementById('fundanideaphonenumber')?.focus();
    return;
  }

  const uploadedDocUrl = document.getElementById("uploaded_document_url")?.value || '';

  const formdata = {
    natureofproject: getFormValue('natureofproject'),
    fundanideaprojectname: getFormValue('fundanideaprojectname'),
    fundanideaprojectlocation: getFormValue('fundanideaprojectlocation'),
    fundanideadepartment: getFormValue('fundanideadepartment'),
    fundanideadocement: uploadedDocUrl,
    fundanideadescription: getFormValue('fundanideadescription'),
    fundanideaorganizationname: getFormValue('fundanideaorganizationname'),
    fundanideaemailid: email,
    fundanideaphonenumber: phoneNumber,
    fundanideacontactpersonname: getFormValue('fundanideacontactpersonname'),
    fundanideaestimateamount: estimateAmount,
    fundanideastatus: getFormValue('fundanideastatus'),
    fundanideatoken: getFormValue('fundanideatoken'),
  };

  // Check if service exists
  if (typeof fundanideaSrevices === 'undefined') {
    console.error('fundanideaSrevices is not defined');
    alert('Service not available. Please check if the service is loaded.');
    return;
  }

  fundanideaSrevices.add(formdata)
    .then(response => {
       alert("Idea created successfully!");
      window.location.href = "ideaList.html";
    })
    .catch(err => {
      alert("Failed to create idea. Please try again. Error: " + (err.message || err));
    });
}

function updateFundanidea(id) {
   
  // Check if service exists
  if (typeof fundanideaSrevices === 'undefined') {
    alert('Service not available. Please check if the service is loaded.');
    return;
  }

  if (!fundanideaSrevices.updatefundanidea) {
    alert('Update service method not available.');
    return;
  }

  // Validate estimate amount - must be at least 50,000
  const estimateAmountValue = getValueOrOld('fundanideaestimateamount', 'fundanideaestimateamount');
  const estimateAmount = parseFloat(estimateAmountValue);
  
  if (isNaN(estimateAmount) || estimateAmount < 50000) {
    alert('Fund An Idea Estimate Amount must be at least ₹50,000');
    document.getElementById('fundanideaestimateamount')?.focus();
    return;
  }

  // Validate email format
  const email = getValueOrOld('fundanideaemailid', 'fundanideaemailid');
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (email && !emailRegex.test(email)) {
    alert('Please enter a valid email address');
    document.getElementById('fundanideaemailid')?.focus();
    return;
  }

  // Validate phone number
  const phoneNumber = getValueOrOld('fundanideaphonenumber', 'fundanideaphonenumber');
  if (phoneNumber && phoneNumber.length < 10) {
    alert('Please enter a valid phone number (at least 10 digits)');
    document.getElementById('fundanideaphonenumber')?.focus();
    return;
  }

  const uploadedDocUrl = document.getElementById("uploaded_document_url")?.value || '';

  const formdata = {
    natureofproject: getValueOrOld('natureofproject', 'natureofproject'),
    fundanideaprojectname: getValueOrOld('fundanideaprojectname', 'fundanideaprojectname'),
    fundanideaprojectlocation: getValueOrOld('fundanideaprojectlocation', 'fundanideaprojectlocation'),
    fundanideadepartment: getValueOrOld('fundanideadepartment', 'fundanideadepartment'),
    fundanideadocement: uploadedDocUrl || (findanidea ? findanidea.fundanideadocement : '') || '',
    fundanideadescription: getValueOrOld('fundanideadescription', 'fundanideadescription'),
    fundanideaorganizationname: getValueOrOld('fundanideaorganizationname', 'fundanideaorganizationname'),
    fundanideaemailid: email,
    fundanideaphonenumber: phoneNumber,
    fundanideacontactpersonname: getValueOrOld('fundanideacontactpersonname', 'fundanideacontactpersonname'),
    fundanideaestimateamount: estimateAmount,
    fundanideastatus: getValueOrOld('fundanideastatus', 'fundanideastatus'),
    fundanideatoken: getValueOrOld('fundanideatoken', 'fundanideatoken'),
  };

  fundanideaSrevices.updatefundanidea(id, formdata)
    .then(response => {
       alert("Idea updated successfully!");
      window.location.href = "ideaList.html";
    })
    .catch(err => {
      console.error("Update failed:", err);
      alert("Failed to update idea. Please try again. Error: " + (err.message || err));
    });
}

// Real-time validation for estimate amount
function validateEstimateAmount() {
  const input = document.getElementById('fundanideaestimateamount');
  if (!input) return;
  
  const value = parseFloat(input.value);
  
  // Remove any previous error styling
  input.classList.remove('is-invalid', 'is-valid');
  
  // Find or create error message element
  let errorMsg = document.getElementById('estimate-error');
  if (!errorMsg) {
    errorMsg = document.createElement('div');
    errorMsg.id = 'estimate-error';
    errorMsg.className = 'invalid-feedback';
    errorMsg.style.display = 'none';
    input.parentNode.appendChild(errorMsg);
  }
  
  if (input.value) {
    if (isNaN(value) || value < 50000) {
      input.classList.add('is-invalid');
      errorMsg.textContent = 'Estimate amount must be at least ₹50,000';
      errorMsg.style.display = 'block';
      return false;
    } else {
      input.classList.add('is-valid');
      errorMsg.style.display = 'none';
      return true;
    }
  } else {
    errorMsg.style.display = 'none';
    return true;
  }
}

// Real-time validation for email
function validateEmail() {
  const input = document.getElementById('fundanideaemailid');
  if (!input) return;
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  // Remove any previous error styling
  input.classList.remove('is-invalid', 'is-valid');
  
  // Find or create error message element
  let errorMsg = document.getElementById('email-error');
  if (!errorMsg) {
    errorMsg = document.createElement('div');
    errorMsg.id = 'email-error';
    errorMsg.className = 'invalid-feedback';
    errorMsg.style.display = 'none';
    input.parentNode.appendChild(errorMsg);
  }
  
  if (input.value) {
    if (!emailRegex.test(input.value.trim())) {
      input.classList.add('is-invalid');
      errorMsg.textContent = 'Please enter a valid email address';
      errorMsg.style.display = 'block';
      return false;
    } else {
      input.classList.add('is-valid');
      errorMsg.style.display = 'none';
      return true;
    }
  } else {
    errorMsg.style.display = 'none';
    return true;
  }
}

// Real-time validation for phone number
function validatePhoneNumber() {
  const input = document.getElementById('fundanideaphonenumber');
  if (!input) return;
  
  // Remove any previous error styling
  input.classList.remove('is-invalid', 'is-valid');
  
  // Find or create error message element
  let errorMsg = document.getElementById('phone-error');
  if (!errorMsg) {
    errorMsg = document.createElement('div');
    errorMsg.id = 'phone-error';
    errorMsg.className = 'invalid-feedback';
    errorMsg.style.display = 'none';
    input.parentNode.appendChild(errorMsg);
  }
  
  const phoneValue = input.value.replace(/\D/g, ''); // Remove non-digits
  
  if (input.value) {
    if (phoneValue.length < 10) {
      input.classList.add('is-invalid');
      errorMsg.textContent = 'Phone number must be at least 10 digits';
      errorMsg.style.display = 'block';
      return false;
    } else {
      input.classList.add('is-valid');
      errorMsg.style.display = 'none';
      return true;
    }
  } else {
    errorMsg.style.display = 'none';
    return true;
  }
}

// Add event listeners after DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Add input event listeners for real-time validation
  const estimateInput = document.getElementById('fundanideaestimateamount');
  if (estimateInput) {
    estimateInput.addEventListener('input', validateEstimateAmount);
    estimateInput.addEventListener('blur', validateEstimateAmount);
  }
  
  const emailInput = document.getElementById('fundanideaemailid');
  if (emailInput) {
    emailInput.addEventListener('input', validateEmail);
    emailInput.addEventListener('blur', validateEmail);
  }
  
  const phoneInput = document.getElementById('fundanideaphonenumber');
  if (phoneInput) {
    phoneInput.addEventListener('input', validatePhoneNumber);
    phoneInput.addEventListener('blur', validatePhoneNumber);
  }
});
