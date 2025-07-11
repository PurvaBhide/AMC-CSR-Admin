galleryServices = {
    add: function(formdata) {
        return api.request({
            path: '/addgallery',
            method: 'POST',
            data: formdata
        });
    },
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
    },
    listall:function(){
        return api.request({
            path:'/listallgallery',
            method:'GET'
        })
    },
    filetype:function(type){
        return api.request({
            path:`/galleryfileType/${type}`,
            method:'GET',
                   })
    },
    delete:function(id){
        return api.request({
            path:`/deletegallery/${id}`,
            method:'DELETE',
            })
            }
};