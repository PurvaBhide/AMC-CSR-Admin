newsService={
     listAll:function(page,size){
        return api.request({
            path:'/listallLatestUpdates?page=' + (page || 0) + '&size=' + (size || 10),
            method:'GET'
        })
     },
     create:function(formData){
        return api.request({
            path:'/AddLatestupdates',
            method:'POST',
            data:formData
        })
     },
     getById :function(id){
        return api.request({
            // path:'/latestupdateshowbyid/' + id + '&page=' + (page ||0) + '&size=' + (size || 10),
            path:`/letestupdateshowbyid/${id}`,
                method:'GET'
                })
     },
     delete:function(id){
        return api.request({
            path:`/deleteletestupdate/${id}`,
            method:'DELETE'
            })
     },
     update:function(id,formData){
        return api.request({
            path:`/updateletestupdates/${id}`,
            method:'PUT',
            data:formData
            })
            },
            listAllByStatus:function(status){
                return api.request({
                    path:`/latestupdateshowbystatus/${status}`,
                    method:'GET'
                    })
                    },
     

}