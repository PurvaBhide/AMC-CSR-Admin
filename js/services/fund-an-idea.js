fundanideaSrevices={
   listAll: function(page, size) {
    return api.request({ 
      path: '/listallFundanidea?page=' + (page || 0) + '&size=' + (size || 10), 
      method: 'GET' 
    });
  },
  delete: function(id){
    return api.request({
      path:`/deleteFundAnIdea/${id}`,
      method:'DELETE'
    })
  },
  showbyid:function(id){
    return api.request({
      path: `/fundanideashowbyid/${id}`,
      method:'GET'
    })
  },
  updatefundanidea:function(id,formdata){
    return api.request({
      path:`/updateFundanIdea/${id}`,
      method:'PUT',
      data:formdata
    })
  },
}