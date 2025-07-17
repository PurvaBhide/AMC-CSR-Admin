// let uploadedFileUrl = "";

// // Upload PDF Handler
// document.getElementById("uploadPdfButton").addEventListener("click", async function () {
//   const pdfInput = document.getElementById("pdfFile");
//   const file = pdfInput.files[0];

//   if (!file) {
//     alert("Please select a PDF file to upload.");
//     return;
//   }

//   const formData = new FormData();
//   formData.append("files", file);

//   try {
//     const uploadResponse = await fetch("https://mumbailocal.org:8087/upload/documents", {
//       method: "POST",
//       body: formData
//     });

//     const uploadResult = await uploadResponse.json();

//     if (uploadResult?.uploadedUrls?.[0]) {
//       uploadedFileUrl = uploadResult.uploadedUrls[0];
//       alert("File uploaded successfully!");

//       const fileNameDisplay = document.getElementById("uploadedFileName");
//       if (fileNameDisplay) {
//         fileNameDisplay.innerHTML = `✅ Uploaded: <a href="${uploadedFileUrl}" target="_blank">${file.name}</a>`;
//       }
//     } else {
//       throw new Error("Upload failed. Please try again.");
//     }
//   } catch (error) {
//     alert("Error uploading file: " + error.message);
//   }
// });

// // Form Submit Handler
// document.getElementById("resourceForm").addEventListener("submit", async function (e) {
//   e.preventDefault();

//   if (!uploadedFileUrl) {
//     alert("Please upload a PDF file before submitting the form.");
//     return;
//   }

//   const payload = {
//     documenttitle: document.getElementById("title").value,
//     documentType: document.getElementById("resourceType").value,
//     documenturl: uploadedFileUrl,
//     documentshortdesc: document.getElementById("description").value
//   };

//   try {
//     const result = await Api.document.add(payload); // Your API integration
//     alert("Resource saved successfully!");
//     window.location.href = "resource-list.html";
//     document.getElementById("resourceForm").reset();
//     uploadedFileUrl = ""; // Reset uploaded URL after submission

//     const fileNameDisplay = document.getElementById("uploadedFileName");
//     if (fileNameDisplay) {
//       fileNameDisplay.textContent = "";
//     }
//   } catch (error) {
//     alert("Failed to save resource: " + error.message);
//   }
// });
let uploadedFileUrl = "";
let isEditMode = false;
let editId = null;

// Get query params
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.has("id")) {
  isEditMode = true;
  editId = urlParams.get("id");
  loadResourceDetails(editId);
}

// Load existing resource details if editing
async function loadResourceDetails(id) {
  try {
    const res = await Api.document.getById(id);
    const doc = res.data;

    document.getElementById("title").value = doc.documenttitle || "";
    document.getElementById("resourceType").value = doc.documentType || "";
    document.getElementById("description").value = doc.documentshortdesc || "";
    uploadedFileUrl = doc.documenturl || "";

    const fileNameDisplay = document.getElementById("uploadedFileName");
    if (fileNameDisplay && uploadedFileUrl) {
      const fileName = uploadedFileUrl.split("/").pop();
      fileNameDisplay.innerHTML = `📎 Existing: <a href="${uploadedFileUrl}" target="_blank">${fileName}</a>`;
    }
    if (isEditMode && uploadedFileUrl) {
  document.getElementById("pdfFile").removeAttribute("required");
}

  } catch (err) {
    alert("Failed to load resource for editing.");
    console.error(err);
  }
}

// Upload PDF Handler
document.getElementById("uploadPdfButton").addEventListener("click", async function () {
  const pdfInput = document.getElementById("pdfFile");
  const file = pdfInput.files[0];

  if (!file) {
    alert("Please select a PDF file to upload.");
    return;
  }

  const formData = new FormData();
  formData.append("files", file);

  try {
    const uploadResponse = await fetch("https://mumbailocal.org:8087/upload/documents", {
      method: "POST",
      body: formData,
    });

    const uploadResult = await uploadResponse.json();

    if (uploadResult?.uploadedUrls?.[0]) {
      uploadedFileUrl = uploadResult.uploadedUrls[0];
      alert("File uploaded successfully!");

      const fileNameDisplay = document.getElementById("uploadedFileName");
      if (fileNameDisplay) {
        fileNameDisplay.innerHTML = `✅ Uploaded: <a href="${uploadedFileUrl}" target="_blank">${file.name}</a>`;
      }
    } else {
      throw new Error("Upload failed. Please try again.");
    }
  } catch (error) {
    alert("Error uploading file: " + error.message);
  }
});

// Form Submit Handler
document.getElementById("resourceForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  if (!uploadedFileUrl) {
    alert("Please upload a PDF file before submitting the form.");
    return;
  }

  const payload = {
    documenttitle: document.getElementById("title").value.trim(),
    documentType: document.getElementById("resourceType").value.trim(),
    documenturl: uploadedFileUrl,
    documentshortdesc: document.getElementById("description").value.trim(),
  };

  try {
    if (isEditMode) {
      await Api.document.update(editId, payload);
      alert("Resource updated successfully!");
    } else {
      await Api.document.add(payload);
      alert("Resource saved successfully!");
    }

    // Redirect after save
    window.location.href = "resource-list.html";
  } catch (error) {
    alert("Failed to save resource: " + error.message);
    console.error(error);
  }
});
