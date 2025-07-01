// project-form-handler.js

document.addEventListener('DOMContentLoaded', function () {
  const id = getUrlParam('id');

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

// Get query parameter from URL
function getUrlParam(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

// Load category dropdown from API
function loadCategories() {
  console.log(':large_green_circle: Calling Api.category.listAll...');
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
      // :white_check_mark: Add this: log category on selection
      select.addEventListener('change', function () {
        const selectedId = this.value;
        const selectedName = this.options[this.selectedIndex].text;
        console.log(`:pushpin: Selected Category: ${selectedName} (ID: ${selectedId})`);
      });
      console.log(':white_check_mark: Category dropdown populated');
    })
    .catch(error => {
      console.error(':x: Failed to load categories:', error);
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

  categorySelect.addEventListener('change', function () {
    const selectedId = categorySelect.value;
    console.log('🟢 Selected Category ID:', selectedId);
  });

  ngoSelect.addEventListener('change', function () {
    const selectedId = ngoSelect.value;
    console.log('🟢 Selected NGO ID:', selectedId);
  });
});

document.addEventListener('DOMContentLoaded', function () {
  const mainImageInput = document.getElementById('main_image');
  mainImageInput.addEventListener('change', function () {
    if (mainImageInput.files.length > 0) {
      uploadMainImage(mainImageInput.files[0]);
    }
  });
});
// function uploadMainImage(file) {
//   const formData = new FormData();
//   formData.append('files', file);
//   fetch('https://mumbailocal.org:8087/upload/images', {
//     method: 'POST',
//     body: formData
//   })
//     .then(response => response.json())
//     .then(result => {
//       console.log(':white_check_mark: Main image uploaded:', result);
//       const preview = document.getElementById('main_image_preview');
//       preview.innerHTML = `:heavy_check_mark: Uploaded: <a href="${result.url}" target="_blank">${result.filename || 'View'}</a>`;
//       // Store URL to submit with form
//       window.uploadedMainImageUrl = result.url;
//     })
//     .catch(error => {
//       console.error(':x: Upload failed:', error);
//       alert('Main image upload failed.');
//     });
// }


function uploadMainImage(file) {
  const formData = new FormData();
  formData.append('files', file); // Backend expects 'files'
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
          `:heavy_check_mark: Uploaded: <a href="${url}" target="_blank">Main Image</a>`;
      } else {
        throw new Error('No image URL returned.');
      }
    })
    .catch(error => {
      console.error(':x: Main image upload failed:', error);
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
  preview.innerHTML = '';
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
          preview.innerHTML += `:heavy_check_mark: ${files[i].name} uploaded: <a href="${url}" target="_blank">View</a><br>`;
          return url;
        } else {
          throw new Error('No image URL returned.');
        }
      })
      .catch(error => {
        console.error(`:x: Upload failed for ${files[i].name}:`, error);
        preview.innerHTML += `:x: ${files[i].name} failed to upload<br>`;
        return null;
      });
    uploadPromises.push(promise);
  }
  Promise.all(uploadPromises).then(urls => {
    window.uploadedGalleryUrls = urls.filter(Boolean); // Remove nulls
  });
}


// Fetch project details and populate form (edit mode)
function fetchProject(id) {
  Api.project.getById(id)
    .then(response => {
      const p = response.data;
      document.getElementById('projectId').value = p.projectId;
      document.getElementById('name').value = p.projectName;
      document.getElementById('description').value = p.projectDescription;
      document.getElementById('scale').value = p.projectBudget;
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
      // Optional: display existing images (main + gallery)
      if (p.projectMainImage) {
        const preview = document.createElement('div');
        preview.innerHTML = `<p class="mt-2">Main Image: <a href="${p.projectMainImage}" target="_blank">View</a></p>`;
        document.getElementById('main_image').parentElement.appendChild(preview);
      }
      if (p.projectImages?.length > 0) {
        const galleryPreview = document.createElement('div');
        galleryPreview.innerHTML = `<p class="mt-2">Gallery Images: ${p.projectImages
          .map(img => `<a href="${img}" target="_blank">[View]</a>`)
          .join(', ')}</p>`;
        document.getElementById('gallery_images').parentElement.appendChild(galleryPreview);
      }
    })
    .catch(err => {
      console.error(':x: Failed to load project:', err);
      alert('Could not load project data.');
    });
}

// Save or update project
// function saveProject(id) {
//   const data = {
//   projectName: document.getElementById('name').value,
//   projectDescription: document.getElementById('description').value,
//   categoryId: document.getElementById('category_id').value,
//   ngoId: document.getElementById('ngo_id').value,
//   projectBudget: document.getElementById('scale').value,
//   projectStatus: document.getElementById('status').value,
//   projectDEpartmentName: document.getElementById('department_name').value,
//   companyName: document.getElementById('company_name').value,
//   projectLocation: document.getElementById('location').value,
//   projectShortDescription: document.getElementById('short_description').value,
//   impactpeople: document.getElementById('people_impacted').value,
//   mainImageUrl: window.uploadedMainImageUrl || '',
//   projectImages: window.uploadedGalleryUrls || []
// };

//   const request = id
//     ? Api.project.update(id, data)
//     : Api.project.add(data);

//   request
//     .then(() => {
//       alert('Project saved successfully!');
//       window.location.href = 'projectlist.html';
//     })
//     .catch(error => {
//       console.error('❌ Error saving project:', error);
//       alert('Failed to save project.');
//     });
// }

function saveProject(id) {
  const data = {
    projectName: document.getElementById('name').value,
    projectDescription: document.getElementById('description').value,
    categoryId: document.getElementById('category_id').value,  // ✅ selected Category ID
    ngoId: document.getElementById('ngo_id').value,
    // categoryId:4,
    // categoryId: document.getElementById('category_id').value,
    // ngoId: 1,
    // ngoId: document.getElementById('ngo_id').value,
    projectBudget: document.getElementById('scale').value,
    projectStatus: document.getElementById('status').value,
    projectDEpartmentName: document.getElementById('department_name').value,
    companieId: 1,
    projectLocation: document.getElementById('location').value,
    projectShortDescription: document.getElementById('short_description').value,
    impactpeople: document.getElementById('people_impacted').value,
    projectMainImage: window.uploadedMainImageUrl || '', // :white_check_mark: Uploaded main image URL
    projectImages: window.uploadedGalleryUrls || []  // :white_check_mark: Uploaded gallery image URLs
  };
  const request = id
    Api.project.update(id, data)

  request
    .then(() => {
      alert('Project saved successfully!');
      window.location.href = 'projectlist.html';
    })
    .catch(error => {
      console.error(':x: Error saving project:', error);
      alert('Failed to save project.');
    });
}

// Utility to wait until a select option is available before setting it
function waitUntilOptionsPopulated(selectId, valueToSet, callback, retries = 10) {
  const select = document.getElementById(selectId);
  if (!select) return;

  const optionExists = Array.from(select.options).some(o => o.value === valueToSet);

  if (optionExists) {
    callback();
  } else if (retries > 0) {
    setTimeout(() => {
      waitUntilOptionsPopulated(selectId, valueToSet, callback, retries - 1);
    }, 100);
  } else {
    console.warn(`⚠️ Option "${valueToSet}" not found in <select id="${selectId}"> after retries.`);
  }
}
