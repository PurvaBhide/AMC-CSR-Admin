
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

    const uploadimage="https://mumbailocal.org:8087/upload/images";
    const uploaddocument="https://mumbailocal.org:8087/upload/documents";

    const endpoint = isImage ?uploadimage : uploaddocument;

    statusMsg(`Uploading ${files.name}...`);

    try {
        const res = await fetch(endpoint, {
            method: 'POST',
            body: formData
        });
        const result = await res.json();

        if (result.status === 200 || result.success) {
            const uploadedPath = result.fileUrl || result.url || result.fileId || result.path;
            statusMsg(`${files.name} uploaded successfully.`);
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

// Auto-upload on file select
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
            uploadedFiles[id] = fileUrl;
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
        // captchaCode: form.captchaCode.value,
        status: form.status.value,
        category: {
            id: form.categoryId.value,
            // categoryName: form.categoryId.options[form.categoryId.selectedIndex].text
        }
    };

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
    const passwordInput = document.getElementById("passwordInput");
    const icon = document.getElementById("toggleIcon");

    const isPassword = passwordInput.type === "password";
    passwordInput.type = isPassword ? "text" : "password";

    icon.classList.toggle("fa-eye");
    icon.classList.toggle("fa-eye-slash");
});
