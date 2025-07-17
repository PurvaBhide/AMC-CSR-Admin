// project-form-handler.js

document.addEventListener('DOMContentLoaded', function () {
  const id = getUrlParam('id');

  // Update button text based on mode (create vs edit)
  updateButtonText(id);

  // Load dropdowns first, then fetch project details (edit mode)
  Promise.all([loadCategories(), loadNgos()])
    .then(() => {
      if (id) {
        fetchProject(id);
      }
    });

  // Form submit handler
  document.getElementById('projectForm').addEventListener('submit', function (e) {
    e.preventDefault();
    saveProject(id);
  });
});

// Update button text based on create/edit mode
function updateButtonText(id) {
  // Only update the main submit button with ID 'submitBtn'
  const submitBtn = document.getElementById('submitBtn');
  
  if (submitBtn) {
    if (id) {
      // Edit mode
      submitBtn.textContent = 'Update Project';
    } else {
      // Create mode
      submitBtn.textContent = 'Submit Project';
    }
  }
  
  // Hide or show buttons based on mode
  const allSubmitButtons = document.querySelectorAll('button[type="submit"]');
  allSubmitButtons.forEach(btn => {
    if (btn.id === 'submitBtn') {
      // This is our main button, keep it visible
      btn.style.display = 'inline-block';
    } else {
      // Hide other submit buttons to avoid confusion
      btn.style.display = 'none';
    }
  });
}

// Get query parameter from URL
function getUrlParam(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

// Load category dropdown from API
function loadCategories() {
  console.log('🟢 Calling Api.category.listAll...');
  return Api.category.listAll()
    .then(response => {
      const categories = response?.data || [];
      const select = document.getElementById('category_id');
      select.innerHTML = '<option value="">Select Category</option>';
      categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = String(cat.id);
        option.textContent = cat.categoryName;
        select.appendChild(option);
      });
      // Add this: log category on selection
      select.addEventListener('change', function () {
        const selectedId = this.value;
        const selectedName = this.options[this.selectedIndex].text;
        console.log(`📌 Selected Category: ${selectedName} (ID: ${selectedId})`);
      });
      console.log('✅ Category dropdown populated');
    })
    .catch(error => {
      console.error('❌ Failed to load categories:', error);
      alert('Unable to load categories.');
    });
}

// Load NGO dropdown from API (paginated)
function loadNgos() {
  console.log('🟢 Calling Api.ngo.listAll...');
  return Api.ngo.listAll(0, 1000)
    .then(response => {
      const ngos = response?.data?.content || [];
      const select = document.getElementById('ngo_id');
      select.innerHTML = '<option value="">Select NGO</option>';

      ngos.forEach(ngo => {
        const option = document.createElement('option');
        option.value = String(ngo.id);
        option.textContent = ngo.organizationName || 'Unnamed NGO';
        select.appendChild(option);
      });

      console.log('✅ NGO dropdown populated');
    })
    .catch(error => {
      console.error('❌ Failed to load NGOs:', error);
      alert('Unable to load NGOs.');
    });
}

document.addEventListener('DOMContentLoaded', function () {
  const categorySelect = document.getElementById('category_id');
  const ngoSelect = document.getElementById('ngo_id');

  if (categorySelect) {
    categorySelect.addEventListener('change', function () {
      const selectedId = categorySelect.value;
      console.log('🟢 Selected Category ID:', selectedId);
    });
  }

  if (ngoSelect) {
    ngoSelect.addEventListener('change', function () {
      const selectedId = ngoSelect.value;
      console.log('🟢 Selected NGO ID:', selectedId);
    });
  }
});

document.addEventListener('DOMContentLoaded', function () {
  const mainImageInput = document.getElementById('main_image');
  if (mainImageInput) {
    mainImageInput.addEventListener('change', function () {
      if (mainImageInput.files.length > 0) {
        uploadMainImage(mainImageInput.files[0]);
      }
    });
  }
});

function uploadMainImage(file) {
  const formData = new FormData();
  formData.append('files', file); // Backend expects 'files'
  
  // Show loading state
  document.getElementById('main_image_preview').innerHTML = '⏳ Uploading main image...';
  
  fetch('https://mumbailocal.org:8087/upload/images', {
    method: 'POST',
    body: formData
  })
    .then(response => response.json())
    .then(result => {
      if (result.uploadedUrls && result.uploadedUrls.length > 0) {
        const url = result.uploadedUrls[0];
        window.uploadedMainImageUrl = url;
        document.getElementById('main_image_preview').innerHTML =
          `✅ Uploaded: <a href="${url}" target="_blank">Main Image</a>`;
      } else {
        throw new Error('No image URL returned.');
      }
    })
    .catch(error => {
      console.error('❌ Main image upload failed:', error);
      document.getElementById('main_image_preview').innerHTML = '❌ Upload failed';
      alert('Main image upload failed.');
    });
}

function uploadGalleryImages() {
  const galleryInput = document.getElementById('gallery_images');
  const files = galleryInput.files;
  if (files.length === 0) {
    alert("Please select gallery images first.");
    return;
  }
  if (files.length > 5) {
    alert("You can only upload up to 5 gallery images.");
    return;
  }
  
  const preview = document.getElementById('gallery_images_preview');
  preview.innerHTML = '⏳ Uploading gallery images...';
  
  const uploadPromises = [];
  for (let i = 0; i < files.length; i++) {
    const formData = new FormData();
    formData.append('files', files[i]);
    const promise = fetch('https://mumbailocal.org:8087/upload/images', {
      method: 'POST',
      body: formData
    })
      .then(response => response.json())
      .then(result => {
        if (result.uploadedUrls && result.uploadedUrls.length > 0) {
          const url = result.uploadedUrls[0];
          return url;
        } else {
          throw new Error('No image URL returned.');
        }
      })
      .catch(error => {
        console.error(`❌ Upload failed for ${files[i].name}:`, error);
        return null;
      });
    uploadPromises.push(promise);
  }
  
  Promise.all(uploadPromises).then(urls => {
    window.uploadedGalleryUrls = urls.filter(Boolean); // Remove nulls
    const successCount = window.uploadedGalleryUrls.length;
    const failCount = files.length - successCount;
    
    preview.innerHTML = `✅ ${successCount} images uploaded successfully`;
    if (failCount > 0) {
      preview.innerHTML += `, ❌ ${failCount} failed`;
    }
  });
}

// Fetch project details and populate form (edit mode)
function fetchProject(id) {
  console.log('🟢 Fetching project details for ID:', id);
  Api.project.getById(id)
    .then(response => {
      const p = response.data;
      console.log('✅ Project data loaded:', p);
      
      // Populate form fields
      document.getElementById('projectId').value = p.projectId;
      document.getElementById('name').value = p.projectName || '';
      document.getElementById('description').value = p.projectDescription || '';
      document.getElementById('scale').value = p.projectBudget || '';
      document.getElementById('status').value = p.projectStatus || '';
      document.getElementById('department_name').value = p.projectDEpartmentName || '';
      document.getElementById('company_name').value = p.companyId || '';
      document.getElementById('location').value = p.projectLocation || '';
      document.getElementById('short_description').value = p.projectShortDescription || '';
      document.getElementById('people_impacted').value = p.impactpeople || '';
      
      const categoryId = String(p.categoryId || '');
      const ngoId = String(p.ngoId || '');
      
      waitUntilOptionsPopulated('category_id', categoryId, () => {
        document.getElementById('category_id').value = categoryId;
      });
      waitUntilOptionsPopulated('ngo_id', ngoId, () => {
        document.getElementById('ngo_id').value = ngoId;
      });
      
      // Display existing images (main + gallery)
      if (p.projectMainImage) {
        const preview = document.createElement('div');
        preview.innerHTML = `<p class="mt-2">Current Main Image: <a href="${p.projectMainImage}" target="_blank">View</a></p>`;
        document.getElementById('main_image').parentElement.appendChild(preview);
        window.existingMainImageUrl = p.projectMainImage;
      }
      
      if (p.projectImages?.length > 0) {
        const galleryPreview = document.createElement('div');
        galleryPreview.innerHTML = `<p class="mt-2">Current Gallery Images: ${p.projectImages
          .map(img => `<a href="${img}" target="_blank">[View]</a>`)
          .join(', ')}</p>`;
        document.getElementById('gallery_images').parentElement.appendChild(galleryPreview);
        window.existingGalleryUrls = p.projectImages;
      }
    })
    .catch(err => {
      console.error('❌ Failed to load project:', err);
      alert('Could not load project data.');
    });
}

function saveProject(id) {
  // Prepare form data
  const data = {
    projectName: document.getElementById('name').value,
    projectDescription: document.getElementById('description').value,
    categoryId: parseInt(document.getElementById('category_id').value) || null,
    ngoId: parseInt(document.getElementById('ngo_id').value) || null,
    projectBudget: document.getElementById('scale').value,
    projectStatus: document.getElementById('status').value,
    projectDEpartmentName: document.getElementById('department_name').value,
    companieId: 1,
    projectLocation: document.getElementById('location').value,
    projectShortDescription: document.getElementById('short_description').value,
    impactpeople: parseInt(document.getElementById('people_impacted').value) || 0,
    projectMainImage: window.uploadedMainImageUrl || window.existingMainImageUrl || '',
    projectImages: window.uploadedGalleryUrls || window.existingGalleryUrls || []
  };

  console.log('💾 Saving project data:', data);

  let request;
  
  if (id) {
    // Edit mode - Update existing project
    console.log('🔄 Updating existing project with ID:', id);
    request = Api.project.update(id, data);
  } else {
    // Create mode - Add new project
    console.log('➕ Creating new project');
    request = ProjectService.add(data);
  }

  // Show loading state
  const submitBtn = document.getElementById('submitBtn');
  const originalText = submitBtn.textContent;
  submitBtn.textContent = id ? 'Updating...' : 'Creating...';
  submitBtn.disabled = true;

  request
    .then(response => {
      console.log('✅ Project save response:', response);
      
      if (id) {
        // Update mode success
        if (response && (response.projectId || response.data?.projectId)) {
          alert("✅ Project updated successfully!");
          window.location.href = "projectlist.html";
        } else {
          alert("⚠️ Update completed but response unclear. Please verify.");
          console.warn("Update response:", response);
        }
      } else {
        // Create mode success
        if (response && (response.projectId || response.data?.projectId)) {
          alert("✅ Project created successfully!");
          window.location.href = "projectlist.html";
        } else {
          alert("⚠️ Project created but response unclear. Please verify.");
          console.warn("Create response:", response);
        }
      }
    })
    .catch(error => {
      console.error("❌ Error saving project:", error);
      alert(`❌ Failed to ${id ? 'update' : 'create'} project. Please try again.`);
    })
    .finally(() => {
      // Restore button state
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    });
}

// Utility to wait until a select option is available before setting it
function waitUntilOptionsPopulated(selectId, valueToSet, callback, retries = 10) {
  const select = document.getElementById(selectId);
  if (!select) return;

  const optionExists = Array.from(select.options).some(o => o.value === valueToSet);

  if (optionExists && valueToSet) {
    callback();
  } else if (retries > 0) {
    setTimeout(() => {
      waitUntilOptionsPopulated(selectId, valueToSet, callback, retries - 1);
    }, 100);
  } else if (valueToSet) {
    console.warn(`⚠️ Option "${valueToSet}" not found in <select id="${selectId}"> after retries.`);
  }
}





































// // project-form-handler.js

// document.addEventListener('DOMContentLoaded', function () {
//   const id = getUrlParam('id');

//   // Load dropdowns first, then fetch project details (edit mode)
//   Promise.all([loadCategories(), loadNgos()])
//     .then(() => {
//       if (id) {
//         fetchProject(id);
//       }
//     });

//   // Form submit handler
//   document.getElementById('projectForm').addEventListener('submit', function (e) {
//     e.preventDefault();
//     saveProject(id);
//   });
// });

// // Get query parameter from URL
// function getUrlParam(name) {
//   const urlParams = new URLSearchParams(window.location.search);
//   return urlParams.get(name);
// }

// // Load category dropdown from API
// function loadCategories() {
//   console.log(':large_green_circle: Calling Api.category.listAll...');
//   return Api.category.listAll()
//     .then(response => {
//       const categories = response?.data || [];
//       const select = document.getElementById('category_id');
//       select.innerHTML = '<option value="">Select Category</option>';
//       categories.forEach(cat => {
//         const option = document.createElement('option');
//         option.value = String(cat.id);
//         option.textContent = cat.categoryName;
//         select.appendChild(option);
//       });
//       // :white_check_mark: Add this: log category on selection
//       select.addEventListener('change', function () {
//         const selectedId = this.value;
//         const selectedName = this.options[this.selectedIndex].text;
//         console.log(`:pushpin: Selected Category: ${selectedName} (ID: ${selectedId})`);
//       });
//       console.log(':white_check_mark: Category dropdown populated');
//     })
//     .catch(error => {
//       console.error(':x: Failed to load categories:', error);
//       alert('Unable to load categories.');
//     });
// }

// // Load NGO dropdown from API (paginated)
// function loadNgos() {
//   console.log('🟢 Calling Api.ngo.listAll...');
//   return Api.ngo.listAll(0, 1000)
//     .then(response => {
//       const ngos = response?.data?.content || [];
//       const select = document.getElementById('ngo_id');
//       select.innerHTML = '<option value="">Select NGO</option>';

//       ngos.forEach(ngo => {
//         const option = document.createElement('option');
//         option.value = String(ngo.id);
//         option.textContent = ngo.organizationName || 'Unnamed NGO';
//         select.appendChild(option);
//       });

//       console.log('✅ NGO dropdown populated');
//     })
//     .catch(error => {
//       console.error('❌ Failed to load NGOs:', error);
//       alert('Unable to load NGOs.');
//     });
// }

// document.addEventListener('DOMContentLoaded', function () {
//   const categorySelect = document.getElementById('category_id');
//   const ngoSelect = document.getElementById('ngo_id');

//   categorySelect.addEventListener('change', function () {
//     const selectedId = categorySelect.value;
//     console.log('🟢 Selected Category ID:', selectedId);
//   });

//   ngoSelect.addEventListener('change', function () {
//     const selectedId = ngoSelect.value;
//     console.log('🟢 Selected NGO ID:', selectedId);
//   });
// });

// document.addEventListener('DOMContentLoaded', function () {
//   const mainImageInput = document.getElementById('main_image');
//   mainImageInput.addEventListener('change', function () {
//     if (mainImageInput.files.length > 0) {
//       uploadMainImage(mainImageInput.files[0]);
//     }
//   });
// });

// function uploadMainImage(file) {
//   const formData = new FormData();
//   formData.append('files', file); // Backend expects 'files'
//   fetch('https://mumbailocal.org:8087/upload/images', {
//     method: 'POST',
//     body: formData
//   })
//     .then(response => response.json())
//     .then(result => {
//       if (result.uploadedUrls && result.uploadedUrls.length > 0) {
//         const url = result.uploadedUrls[0];
//         window.uploadedMainImageUrl = url;
//         document.getElementById('main_image_preview').innerHTML =
//           `:heavy_check_mark: Uploaded: <a href="${url}" target="_blank">Main Image</a>`;
//       } else {
//         throw new Error('No image URL returned.');
//       }
//     })
//     .catch(error => {
//       console.error(':x: Main image upload failed:', error);
//       alert('Main image upload failed.');
//     });
// }


// function uploadGalleryImages() {
//   const galleryInput = document.getElementById('gallery_images');
//   const files = galleryInput.files;
//   if (files.length === 0) {
//     alert("Please select gallery images first.");
//     return;
//   }
//   if (files.length > 5) {
//     alert("You can only upload up to 5 gallery images.");
//     return;
//   }
//   const preview = document.getElementById('gallery_images_preview');
//   preview.innerHTML = '';
//   const uploadPromises = [];
//   for (let i = 0; i < files.length; i++) {
//     const formData = new FormData();
//     formData.append('files', files[i]);
//     const promise = fetch('https://mumbailocal.org:8087/upload/images', {
//       method: 'POST',
//       body: formData
//     })
//       .then(response => response.json())
//       .then(result => {
//         if (result.uploadedUrls && result.uploadedUrls.length > 0) {
//           const url = result.uploadedUrls[0];
//           preview.innerHTML += `:heavy_check_mark: ${files[i].name} uploaded: <a href="${url}" target="_blank">View</a><br>`;
//           return url;
//         } else {
//           throw new Error('No image URL returned.');
//         }
//       })
//       .catch(error => {
//         console.error(`:x: Upload failed for ${files[i].name}:`, error);
//         preview.innerHTML += `:x: ${files[i].name} failed to upload<br>`;
//         return null;
//       });
//     uploadPromises.push(promise);
//   }
//   Promise.all(uploadPromises).then(urls => {
//     window.uploadedGalleryUrls = urls.filter(Boolean); // Remove nulls
//   });
// }


// // Fetch project details and populate form (edit mode)
// function fetchProject(id) {
//   Api.project.getById(id)
//     .then(response => {
//       const p = response.data;
//       document.getElementById('projectId').value = p.projectId;
//       document.getElementById('name').value = p.projectName;
//       document.getElementById('description').value = p.projectDescription;
//       document.getElementById('scale').value = p.projectBudget;
//       document.getElementById('status').value = p.projectStatus || '';
//       document.getElementById('department_name').value = p.projectDEpartmentName || '';
//       document.getElementById('company_name').value = p.companyId || '';
//       document.getElementById('location').value = p.projectLocation || '';
//       document.getElementById('short_description').value = p.projectShortDescription || '';
//       document.getElementById('people_impacted').value = p.impactpeople || '';
//       const categoryId = String(p.categoryId || '');
//       const ngoId = String(p.ngoId || '');
//       waitUntilOptionsPopulated('category_id', categoryId, () => {
//         document.getElementById('category_id').value = categoryId;
//       });
//       waitUntilOptionsPopulated('ngo_id', ngoId, () => {
//         document.getElementById('ngo_id').value = ngoId;
//       });
//       // Optional: display existing images (main + gallery)
//       if (p.projectMainImage) {
//         const preview = document.createElement('div');
//         preview.innerHTML = `<p class="mt-2">Main Image: <a href="${p.projectMainImage}" target="_blank">View</a></p>`;
//         document.getElementById('main_image').parentElement.appendChild(preview);
//       }
//       if (p.projectImages?.length > 0) {
//         const galleryPreview = document.createElement('div');
//         galleryPreview.innerHTML = `<p class="mt-2">Gallery Images: ${p.projectImages
//           .map(img => `<a href="${img}" target="_blank">[View]</a>`)
//           .join(', ')}</p>`;
//         document.getElementById('gallery_images').parentElement.appendChild(galleryPreview);
//       }
//     })
//     .catch(err => {
//       console.error(':x: Failed to load project:', err);
//       alert('Could not load project data.');
//     });
// }

// function saveProject(id) {
//   const data = {
//     projectName: document.getElementById('name').value,
//     projectDescription: document.getElementById('description').value,
//     categoryId: document.getElementById('category_id').value,  // ✅ selected Category ID
//     ngoId: document.getElementById('ngo_id').value,
//     projectBudget: document.getElementById('scale').value,
//     projectStatus: document.getElementById('status').value,
//     projectDEpartmentName: document.getElementById('department_name').value,
//     companieId: 1,
//     projectLocation: document.getElementById('location').value,
//     projectShortDescription: document.getElementById('short_description').value,
//     impactpeople: document.getElementById('people_impacted').value,
//     projectMainImage: window.uploadedMainImageUrl || '', // :white_check_mark: Uploaded main image URL
//     projectImages: window.uploadedGalleryUrls || []  // :white_check_mark: Uploaded gallery image URLs
//   };
//   const request = Api.project.update(id, data)

//    request
//     .then(response => {
//       // ✅ Check if response contains projectId and projectName
//       if (response && response.projectId && response.projectName) {
//         alert("✅ Project updated successfully!");
//         window.location.href = "projectlist.html";
//       } else {
//         alert("⚠️ Update pending or incomplete. Please verify the response.");
//         console.warn("Response:", response);
//       }
//     })
//     .catch(error => {
//       console.error("❌ Error saving project:", error);
//       alert("❌ Failed to save project. Please try again.");
//     });
// }

// // Utility to wait until a select option is available before setting it
// function waitUntilOptionsPopulated(selectId, valueToSet, callback, retries = 10) {
//   const select = document.getElementById(selectId);
//   if (!select) return;

//   const optionExists = Array.from(select.options).some(o => o.value === valueToSet);

//   if (optionExists) {
//     callback();
//   } else if (retries > 0) {
//     setTimeout(() => {
//       waitUntilOptionsPopulated(selectId, valueToSet, callback, retries - 1);
//     }, 100);
//   } else {
//     console.warn(`⚠️ Option "${valueToSet}" not found in <select id="${selectId}"> after retries.`);
//   }
// }
