var CompanyService = {
  add: function(data) {
    return api.request({ path: '/addCompany', method: 'POST', data: data });
  },
  listAll: function() {
    return api.request({ path: '/listall', method: 'GET' });
  },
  getById: function(id) {
    return api.request({ path: '/companyShowById/' + id, method: 'GET' });
  },
  update: function(id, data) {
    return api.request({ path: '/companyUpdate/' + id, method: 'PUT', data: data });
  },
  delete: function(id) {
    return api.request({ path: '/delete/' + id, method: 'DELETE' });
  }
};