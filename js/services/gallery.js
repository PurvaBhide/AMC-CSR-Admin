// // const { data } = require("jquery");

// galleryServices={
//     add : function(formdata){
//         return api.request({
//             path:'/addgallery',
//             method:'POST',
//             data:formdata
//         })
//     },
//     uploadimage:function(formdata){
//         return api.request({
//             path:'/upload/images',
//             method:'POST',
//             data:formdata
//         })
//     },
//       uploaddocument:function(formdata){
//         return api.request({
//             path:'/upload/documents',
//             method:'POST',
//             data:formdata
//         })
//     },

//       uploadvideo:function(formdata){
//         return api.request({
//             path:'/upload/videos',
//             method:'POST',
//             data:formdata
//         })
//     },
//   // Add this update method
//     update: function(id, formdata) {
//         return api.request({
//             path: `/updategallery/${id}`,
//             method: 'PUT',
//             data: formdata
//         })
//     },

// }


// Remove the require statement as it's not needed in browser
// const { data } = require("jquery");

galleryServices = {
    add: function(formdata) {
        return api.request({
            path: '/addgallery',
            method: 'POST',
            data: formdata
        });
    },
    
    // These are no longer needed since we use api.uploadFile directly
    // But keep them for backward compatibility if needed elsewhere
    uploadimage: function(formData) {
        return api.uploadFile('/upload/images', formData.get('files'), 'files');
    },
    
    uploaddocument: function(formData) {
        return api.uploadFile('/upload/documents', formData.get('files'), 'files');
    },

    uploadvideo: function(formData) {
        return api.uploadFile('/upload/videos', formData.get('files'), 'files');
    },
    
    update: function(id, formdata) {
        return api.request({
            path: `/updategallery/${id}`,
            method: 'PUT',
            data: formdata
        });
    }
};