newsService={
     listAll:function(page,size){
        return api.request({
            path:'/listallLatestUpdates?page=' + (page || 0) + '&size=' + (size || 10),
            method:'GET'
        })
     },
}