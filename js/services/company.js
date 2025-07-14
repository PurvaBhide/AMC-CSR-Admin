var CompanyService = {
  add: function(data) {
    return api.request({ path: '/addCompany', method: 'POST', data: data });
  },
  listAll: function(page = 1, size = 10) {
    return api.request({ path: `/listallcompanies?page=${page - 1}&size=${size}`, method: 'GET' }); // page-1 because
    // most backends are 0-indexed for pages
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
