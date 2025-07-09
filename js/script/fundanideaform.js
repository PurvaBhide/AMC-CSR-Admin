
  document.addEventListener('DOMContentLoaded', function () {
    const id = getUrlParam('id');
    console.log("dadadada", id);

    if (id) {
      fetchFundanIdea(id);
    }
  });

  function getUrlParam(key) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(key);
  }

  function fetchFundanIdea(id) {
    fundanideaSrevices.showbyid(id)
      .then(response => {
        const findanidea = response.data;
        console.log(findanidea, "findanidea");

        // Populate form fields
        // document.getElementById('fundanideaid').value = findanidea.fundanideaid || '';
        document.getElementById('natureofproject').value = findanidea.natureofproject || '';
        document.getElementById('fundanideaprojectlocation').value = findanidea.fundanideaprojectlocation || '';
        document.getElementById('fundanideadepartment').value = findanidea.fundanideadepartment || '';
        document.getElementById('fundanideadocement_preview').innerText = findanidea.fundanideadocement || 'No file';
        document.getElementById('fundanideadescription').value = findanidea.fundanideadescription || '';
        document.getElementById('fundanideaorganizationname').value = findanidea.fundanideaorganizationname || '';
        document.getElementById('fundanideaemailid').value = findanidea.fundanideaemailid || '';
        document.getElementById('fundanideaphonenumber').value = findanidea.fundanideaphonenumber || '';
        document.getElementById('fundanideacontactpersonname').value = findanidea.fundanideacontactpersonname || '';
        document.getElementById('fundanideaestimateamount').value = findanidea.fundanideaestimateamount || '';
        document.getElementById('fundanideastatus').value = findanidea.fundanideastatus || '';

        if (findanidea.main_image) {
          document.getElementById('main_image_preview').innerHTML =
            `<img src="${findanidea.main_image}" height="100"/>`;
        }

        if (Array.isArray(findanidea.gallery_images)) {
          const galleryHTML = findanidea.gallery_images.map(img =>
            `<img src="${img}" height="80" class="me-2 mb-2"/>`
          ).join('');
          document.getElementById('gallery_images_preview').innerHTML = galleryHTML;
        }
        
      })
      .catch(error => {
        console.error("Error fetching idea details:", error);
      });
  }
