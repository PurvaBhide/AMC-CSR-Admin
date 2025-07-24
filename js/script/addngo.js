let id = null; 
function getUrlParam(key) {
    const params = new URLSearchParams(window.location.search);
    return params.get(key);
}
document.addEventListener('DOMContentLoaded', () => {
    const id = getUrlParam('id'); // Get ID from URL
    console.log('NGO form loaded with ID:', id);

    if (id) {
        loadNgoData(id); // Fetch and pre-fill form
        // updateNgo(id);
    } else {
        console.warn('No ID found in URL.');
    }
});




// const statusMsg = (msg) => {
//     const statusEl = document.getElementById('uploadStatus');
//     if (statusEl) {
//         statusEl.innerText = msg;
//         statusEl.style.display = 'block';
//     } else {
//         alert(msg);
//     }
// };

// const getFileUrl = async (fileInput, isImage = false) => {
//     const files = fileInput.files[0];
//     if (!files) return null;

//     const formData = new FormData();
//     formData.append('files', files);

//     const uploadimage="https://mumbailocal.org:8087/upload/images";
//     const uploaddocument="https://mumbailocal.org:8087/upload/documents";

//     const endpoint = isImage ?uploadimage : uploaddocument;

//     statusMsg(`Uploading ${files.name}...`);

//     try {
//         const res = await fetch(endpoint, {
//             method: 'POST',
//             body: formData
//         });
//         const result = await res.json();

//         if (result.status === 200 || result.success) {
//             const uploadedPath = result.fileUrl || result.url || result.fileId || result.path;
//             statusMsg(`${files.name} uploaded successfully.`);
//             return uploadedPath;
//         } else {
//             throw new Error(result.message || 'Upload failed');
//         }
//     } catch (err) {
//         statusMsg(`Error uploading ${files.name}: ${err.message}`);
//         return null;
//     }
// };

// // Store uploaded file URLs here
// const uploadedFiles = {};

//     const fileFields = [
//         { id: 'ngo80Gdocument', isImage: false },
//         { id: 'ngo12Adocument', isImage: false },
//         { id: 'caCertifiedStatementUpload', isImage: false },
//         { id: 'organizationRegistrationCertificate', isImage: false },
//         { id: 'csr1Document', isImage: false },
//         { id: 'bylaws', isImage: false },
//         { id: 'moa', isImage: false }
//     ];

//  fileFields.forEach(({ id, isImage }) => {
//         const input = document.getElementById(id);
//         if (input) {
//             input.addEventListener('change', async () => {
//                 const fileUrl = await getFileUrl(input, isImage);
//                 uploadedFiles[id] = fileUrl;
//             });
//         }
//     });

// // Form submission
// document.getElementById('ngoForm').addEventListener('submit', async function (e) {
//         e.preventDefault();
//         const form = e.target;

//         const payload = {
//             organizationName: form.organizationName.value,
//             emailId: form.emailId.value,
//             userName: form.userName.value,
//             password: form.password.value,
//             ageOfOrganization: form.ageOfOrganization.value,
//             annualTurnover: form.annualTurnover.value,
//             nameOfContactPerson: form.nameOfContactPerson.value,
//             contactNumber: form.contactNumber.value,
//             ngo80GregistrationNumber: form.ngo80GregistrationNumber.value,
//             ngo80Gdocument: uploadedFiles['ngo80Gdocument'] || '',
//             ngo12AregistrationNumber: form.ngo12AregistrationNumber.value,
//             ngo12Adocument: uploadedFiles['ngo12Adocument'] || '',
//             caCertifiedStatementUpload: uploadedFiles['caCertifiedStatementUpload'] || '',
//             organizationRegistrationCertificate: uploadedFiles['organizationRegistrationCertificate'] || '',
//             csr1RegistartionNumber: form.csr1RegistartionNumber.value,
//             csr1Document: uploadedFiles['csr1Document'] || '',
//             bylaws: uploadedFiles['bylaws'] || '',
//             moa: uploadedFiles['moa'] || '',
//             status: form.status.value,
//             category: {
//                 id: form.categoryId.value
//             }
//         };

//         try {
//             const res = await fetch('https://mumbailocal.org:8087/addngo', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json'
//                 },
//                 body: JSON.stringify(payload)
//             });

//             const result = await res.json();
//             if (result.status === 200 || result.success) {
//                 statusMsg('✅ NGO added successfully!');
//                 form.reset();
//                 document.getElementById('uploadStatus').style.display = 'none';
//             } else {
//                 throw new Error(result.message || 'Failed to add NGO');
//             }
//         } catch (err) {
//             statusMsg(`❌ Submission failed: ${err.message}`);
//         }
//     });


// Password visibility toggle
// document.getElementById("togglePassword").addEventListener("click", function () {
//     const passwordInput = document.getElementById("password");
//     const icon = document.getElementById("toggleIcon");

//     const isPassword = passwordInput.type === "password";
//     passwordInput.type = isPassword ? "text" : "password";

//     icon.classList.toggle("fa-eye");
//     icon.classList.toggle("fa-eye-slash");
// });

const statusMsg = (msg) => {
    const statusEl = document.getElementById('uploadStatus');
    if (statusEl) {
        statusEl.innerText = msg;
        statusEl.style.display = 'block';
    } else {
        alert(msg);
    }
};

const getFileUrl = async (fileInput, isImage = false) => {
    const files = fileInput.files[0];
    if (!files) return null;

    const formData = new FormData();
    formData.append('files', files);

    const uploadimage = "https://mumbailocal.org:8087/upload/images";
    const uploaddocument = "https://mumbailocal.org:8087/upload/documents";

    const endpoint = isImage ? uploadimage : uploaddocument;

    statusMsg(`Uploading ${files.name}...`);

    try {
        const res = await fetch(endpoint, {
            method: 'POST',
            body: formData
        });
        const result = await res.json();

        if (result.status === 200 || result.success) {
            // Extract the URL from uploadedUrls array (first element)
            const uploadedPath = result.uploadedUrls?.[0] || result.fileUrl || result.url || result.fileId || result.path;
            statusMsg(`Document uploaded successfully`); // Changed message as requested
            return uploadedPath;
        } else {
            throw new Error(result.message || 'Upload failed');
        }
    } catch (err) {
        statusMsg(`Error uploading ${files.name}: ${err.message}`);
        return null;
    }
};

// Store uploaded file URLs here
const uploadedFiles = {};

const fileFields = [
    { id: 'ngo80Gdocument', isImage: false },
    { id: 'ngo12Adocument', isImage: false },
    { id: 'caCertifiedStatementUpload', isImage: false },
    { id: 'organizationRegistrationCertificate', isImage: false },
    { id: 'csr1Document', isImage: false },
    { id: 'bylaws', isImage: false },
    { id: 'moa', isImage: false }
];

fileFields.forEach(({ id, isImage }) => {
    const input = document.getElementById(id);
    if (input) {
        input.addEventListener('change', async () => {
            const fileUrl = await getFileUrl(input, isImage);
            if (fileUrl) {
                uploadedFiles[id] = fileUrl;
                console.log(`File uploaded for ${id}:`, fileUrl); // Debug log
            }
        });
    }
});

// Form submission
document.getElementById('ngoForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    const form = e.target;

    const payload = {
        organizationName: form.organizationName.value,
        emailId: form.emailId.value,
        userName: form.userName.value,
        password: form.password.value,
        ageOfOrganization: form.ageOfOrganization.value,
        annualTurnover: form.annualTurnover.value,
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
        category: {
            id: form.categoryId.value
        }
    };

    console.log('Final payload:', payload); // Debug log to check payload

    try {
        const res = await fetch('https://mumbailocal.org:8087/addngo', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const result = await res.json();
        if (result.status === 200 || result.success) {
            statusMsg('✅ NGO added successfully!');
            form.reset();
            // Clear uploaded files after successful submission
            Object.keys(uploadedFiles).forEach(key => delete uploadedFiles[key]);
            document.getElementById('uploadStatus').style.display = 'none';
        } else {
            throw new Error(result.message || 'Failed to add NGO');
        }
    } catch (err) {
        statusMsg(`❌ Submission failed: ${err.message}`);
    }
});



// Password visibility toggle
document.getElementById("togglePassword").addEventListener("click", function () {
    const passwordInput = document.getElementById("password");
    const icon = document.getElementById("toggleIcon");

    const isPassword = passwordInput.type === "password";
    passwordInput.type = isPassword ? "text" : "password";

    icon.classList.toggle("fa-eye");
    icon.classList.toggle("fa-eye-slash");
});

// setdata


// show preview
// function displayDocument(label, filename) {
//   if (!filename) return;
//   const url = filename;
//   const container = document.getElementById('docPreviews');
//   const ext = filename.split('.').pop().toLowerCase();

//   const html = ext === "pdf"
//     ? `<div><strong>${label}:</strong> <a href="${url}" target="_blank">View PDF</a></div>`
//     : `<div><strong>${label}:</strong><br><img src="${url}" alt="${label}" width="100"/></div>`;

//   container.innerHTML += html;
// }

function displayDocument(label, fileUrl, containerId) {
    if (!fileUrl) return;

    const ext = fileUrl.split('.').pop().toLowerCase();
    console.log(fileUrl,"ext")
    const container = document.getElementById(containerId);

    const html = ext === "pdf"
        ? `<div><strong>${label}:</strong> <a href="${fileUrl}" target="_blank">View PDF</a></div>`
        : `<div><strong>${label}:</strong><br><img src="${fileUrl}" alt="${label}" width="100"/></div>`;

    container.innerHTML = html;
}

function handleFilePreview(input, containerId) {
    const file = input.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        displayDocument(input.previousElementSibling.innerText, e.target.result, containerId);
    };
    reader.readAsDataURL(file);
}

function loadNgoData(id) {
  fetch(`https://mumbailocal.org:8087/getNgoById/${id}`)
    .then(res => res.json())
    .then(data => {
     
      document.getElementById('organizationName').value = data.organizationName;
      document.getElementById('emailId').value = data.emailId;
      document.getElementById('userName').value = data.userName;
      document.getElementById('password').value = data.password;
      document.getElementById('ageOfOrganization').value = data.ageOfOrganization;
      document.getElementById('annualTurnover').value = data.annualTurnover;
      document.getElementById('ngo80GregistrationNumber').value = data.ngo80GregistrationNumber;
      document.getElementById('nameOfContactPerson').value=data.nameOfContactPerson;
      document.getElementById('contactNumber').value=data.contactNumber;
      document.getElementById('ngo12AregistrationNumber').value=data.ngo12AregistrationNumber;
      document.getElementById('csr1RegistartionNumber').value=data.csr1RegistartionNumber;
      document.getElementById('status').value=data.status;
     document.getElementById('categoryId').value = data.category.id;
document.getElementById('categoryId').value = data.category.id;

    //   displayDocument("perviewngo80Gdocument", data.ngo80Gdocument);
    //   displayDocument("preview12A", data.ngo12Adocument);
    //   displayDocument("previewCA", data.caCertifiedStatementUpload);
    //   displayDocument("previewORC", data.organizationRegistrationCertificate);
    //   displayDocument("previewCAR1", data.csr1Document);
    //   displayDocument("previewlaws", data.bylaws);
    //   displayDocument("previewMOA", data.moa);
       displayDocument("80G Document", data.ngo80Gdocument, "preview80G");
      displayDocument("12A Document", data.ngo12Adocument, "preview12A");
      displayDocument("CA Certified Statement", data.caCertifiedStatementUpload, "previewCA");
      displayDocument("Registration Certificate", data.organizationRegistrationCertificate, "previewRegistration");
      displayDocument("CSR-1 Document", data.csr1Document, "previewCSR1");
      displayDocument("Bylaws", data.bylaws, "previewBylaws");
      displayDocument("MOA", data.moa, "previewMOA");
    });
}
// update
function updateNgo() {
     if (!id) {
    alert("NGO ID not found in URL.");
    return;
  }
  else{
    console.log("idididiid===============",id)
  }
  const payload = {
    organizationName: document.getElementById('organizationName').value,
    emailId: document.getElementById('emailId').value,
    userName: document.getElementById('userName').value,
    password: document.getElementById('password').value,
    ageOfOrganization: document.getElementById('ageOfOrganization').value,
    annualTurnover: document.getElementById('annualTurnover').value,
    ngo80GregistrationNumber: document.getElementById('ngo80GregistrationNumber').value,
    // Add others similarly...
    status: "Pending",
    captchaCode: "X9T4B2", // or dynamically generated
    category: {
      id: 2
    }
  };

  fetch(`https://mumbailocal.org:8087/updateNgo/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  })
  .then(res => res.json())
  .then(result => {
    alert(result.message || "NGO details updated successfully.");
  });
}


document.addEventListener('DOMContentLoaded', () => {
  const ngoId = id; // or get from URL param
  loadNgoData(ngoId);
});
