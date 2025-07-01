var DocumentService = {
  add: function(data) {
    return api.request({ path: '/addDocuments', method: 'POST', data: data });
  },
  listAll: function() {
    return api.request({ path: '/listalldocuments', method: 'GET' });
  },
  getById: function(id) {
    return api.request({ path: '/documentShowById/' + id, method: 'GET' });
  },
  getByType: function(type) {
    return api.request({ path: '/documents/' + type, method: 'GET' });
  },
  update: function(id, data) {
    return api.request({ path: '/documentUpdate/' + id, method: 'PUT', data: data });
  },
  delete: function(id) {
    return api.request({ path: '/deleteDocument/' + id, method: 'DELETE' });
  }
};