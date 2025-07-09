let findanidea = {}; // Global variable to store fetched data

 const id = getUrlParam('id'); 

document.addEventListener('DOMContentLoaded', function () {
  const id = getUrlParam('id');
  if (id) {
    fetchFundanIdea(id);
  }
});

function getUrlParam(key) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(key);
}

document.getElementById('FundAnIdeaForm').addEventListener('submit', function (e) {
  e.preventDefault();
  saveFundanidea();
});

function fetchFundanIdea(id) {
  fundanideaSrevices.showbyid(id)
    .then(response => {
      findanidea = response.data; // Save globally
      console.log(findanidea, "findanidea");

      document.getElementById('natureofproject').value = findanidea.natureofproject || '';
      document.getElementById('fundanideaprojectlocation').value = findanidea.fundanideaprojectlocation || '';
      document.getElementById('fundanideaprojectname').value = findanidea.fundanideaprojectname || '';
      document.getElementById('fundanideadepartment').value = findanidea.fundanideadepartment || '';
      document.getElementById('fundanideadocement_preview').innerText = findanidea.fundanideadocement || 'No file';
      document.getElementById('fundanideadescription').value = findanidea.fundanideadescription || '';
      document.getElementById('fundanideaorganizationname').value = findanidea.fundanideaorganizationname || '';
      document.getElementById('fundanideaemailid').value = findanidea.fundanideaemailid || '';
      document.getElementById('fundanideaphonenumber').value = findanidea.fundanideaphonenumber || '';
      document.getElementById('fundanideacontactpersonname').value = findanidea.fundanideacontactpersonname || '';
      document.getElementById('fundanideaestimateamount').value = findanidea.fundanideaestimateamount || '';
      document.getElementById('fundanideastatus').value = findanidea.fundanideastatus || '';
      document.getElementById('fundanideatoken').value=findanidea.fundanideatoken||'';

      if (findanidea.main_image) {
        document.getElementById('main_image_preview').innerHTML = `<img src="${findanidea.main_image}" height="100"/>`;
      }

      if (Array.isArray(findanidea.gallery_images)) {
        const galleryHTML = findanidea.gallery_images.map(img =>
          `<img src="${img}" height="80" class="me-2 mb-2"/>`
        ).join('');
        document.getElementById('gallery_images_preview').innerHTML = galleryHTML;
      }

      // Optionally add this token to a hidden input
      const tokenInput = document.getElementById('fundanideatoken');
      if (tokenInput) tokenInput.value = findanidea.fundanideatoken || '';

      const docUrl = findanidea.fundanideadocement;

if (docUrl) {
  const previewElement = document.getElementById("fundanideadocement_preview");

  if (docUrl.endsWith(".pdf")) {
    previewElement.innerHTML = `<a href="${docUrl}" target="_blank" style="color: green;">View Uploaded PDF</a>`;
  } else if (docUrl.match(/\.(jpeg|jpg|png|gif|png)$/)) {
    previewElement.innerHTML = `<img src="${docUrl}" alt="Uploaded Image" style="max-width: 100%; height: auto; margin-top: 5px;" />`;
  } else {
    previewElement.innerHTML = `<a href="${docUrl}" target="_blank" style="color: green;">${docUrl}</a>`;
  }
}
    })
    .catch(error => {
      console.error("Error fetching idea details:", error);
    });
}

function getValueOrOld(id, key) {
  const value = document.getElementById(id)?.value;
  return value?.trim() !== '' ? value : findanidea[key] || '';
}
// async function uploadAndSetDocument() {
//   const fileInput = document.getElementById("fundanideadocement");
//   const file = fileInput.files[0];

//   if (!file) {
//     alert("Please select a file to upload.");
//     return;
//   }

//   const formData = new FormData();
//   formData.append("files", file);

//   const isImage = file.type.startsWith("image/");
//   const isDocument =
//     file.type === "application/pdf" ||
//     file.type === "application/msword" ||
//     file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

//   let uploadUrl = "";

//   if (isImage) {
//     uploadUrl = "https://mumbailocal.org:8087/upload/images";
//   } else if (isDocument) {
//     uploadUrl = "https://mumbailocal.org:8087/upload/documents";
//   } else {
//     alert("Unsupported file type!");
//     return;
//   }

//   try {
//     const response = await fetch(uploadUrl, {
//       method: "POST",
//       body: formData,
//     });

//     if (!response.ok) {
//       throw new Error("File upload failed.");
//     }

//     const result = await response.json();
//     console.log("Upload response:", result);

//     // Store uploaded URL in a hidden field or global variable
//     const uploadedUrl = result.uploadedUrls?.[0] || null;

//     if (uploadedUrl) {
//       // If needed, store it in a hidden input for later use
//       let hiddenInput = document.getElementById("uploaded_document_url");
//       if (!hiddenInput) {
//         hiddenInput = document.createElement("input");
//         hiddenInput.type = "hidden";
//         hiddenInput.id = "uploaded_document_url";
//         document.getElementById("FundAnIdeaForm").appendChild(hiddenInput);
//       }
//       hiddenInput.value = uploadedUrl;

//       // Optional: Show preview or confirmation
//       document.getElementById("fundanideadocement_preview").innerText = uploadedUrl;


//     }
//     // Optional: Show preview or confirmation
// const previewElement = document.getElementById("fundanideadocement_preview");

// if (uploadedUrl.endsWith(".pdf")) {
//   previewElement.innerHTML = `<a href="${uploadedUrl}" target="_blank" style="color: green;">View PDF Document</a>`;
// } else if (uploadedUrl.match(/\.(jpeg|jpg|png|gif)$/)) {
//   previewElement.innerHTML = `<img src="${uploadedUrl}" alt="Uploaded Image" style="max-width: 100%; height: auto; margin-top: 5px;" />`;
// } else {
//   previewElement.innerHTML = `<a href="${uploadedUrl}" target="_blank" style="color: green;">${uploadedUrl}</a>`;
// }

//   } catch (error) {
//     console.error("Error uploading file:", error);
//   }
// }
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
    console.log("Upload response:", result);

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


function saveFundanidea() {
  const uploadedDocUrl = document.getElementById("uploaded_document_url")?.value || '';

  const formdata = {
    natureofproject: getValueOrOld('natureofproject', 'natureofproject'),
    fundanideaprojectname: getValueOrOld('fundanideaprojectname', 'fundanideaprojectname'),
    fundanideaprojectlocation: getValueOrOld('fundanideaprojectlocation', 'fundanideaprojectlocation'),
    fundanideadepartment: getValueOrOld('fundanideadepartment', 'fundanideadepartment'),
    
    // ✅ Use uploaded URL instead of C:\fakepath\
    fundanideadocement: uploadedDocUrl || findanidea.fundanideadocement || '',

    fundanideadescription: getValueOrOld('fundanideadescription', 'fundanideadescription'),
    fundanideaorganizationname: getValueOrOld('fundanideaorganizationname', 'fundanideaorganizationname'),
    fundanideaemailid: getValueOrOld('fundanideaemailid', 'fundanideaemailid'),
    fundanideaphonenumber: getValueOrOld('fundanideaphonenumber', 'fundanideaphonenumber'),
    fundanideacontactpersonname: getValueOrOld('fundanideacontactpersonname', 'fundanideacontactpersonname'),
    fundanideaestimateamount: getValueOrOld('fundanideaestimateamount', 'fundanideaestimateamount'),
    fundanideastatus: getValueOrOld('fundanideastatus', 'fundanideastatus'),
    fundanideatoken: getValueOrOld('fundanideatoken', 'fundanideatoken'),
  };

  console.log(formdata, "formdata to be submitted");
   fundanideaSrevices.updatefundanidea(id,formdata)
    .then(response => {
      console.log("Update response:", response);
      alert("Data updated successfully!");
      window.location.href = "ideaList.html";

    //   window.history.back();
    //   window.reload();
    })
    .catch(err => {
      console.error("Update failed:", err);
      alert("Update failed.");
    });
}
