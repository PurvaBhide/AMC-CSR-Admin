var NgoService = {
  register: function(data) {
    return api.request({ path: '/addngo', method: 'POST', data: data });
  },
  listAll: function(page, size) {
    return api.request({ 
      path: '/listallNgo?page=' + (page || 0) + '&size=' + (size || 10), 
      method: 'GET' 
    });
  },
  getById: function(id) {
    return api.request({ path: '/getNgoById/' + id, method: 'GET' });
  },
  update: function(id, data) {
    return api.request({ path: '/updateNgo/' + id, method: 'PUT', data: data });
  },
  delete: function(id) {
    return api.request({ path: '/deleteNgo/' + id, method: 'DELETE' });
  }
};