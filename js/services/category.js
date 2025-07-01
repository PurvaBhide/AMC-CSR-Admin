// category.service.js
var CategoryService = {
  add: function(categoryData) {
    return api.request({
      path: '/addcategory',
      method: 'POST',
      data: categoryData
    });
  },

  listAll: function() {
    return api.request({
      path: '/listAllCategory',
      method: 'GET'
    });
  },

  getById: function(id) {
    return api.request({
      path: '/categoryshowbyid/' + id,
      method: 'GET'
    });
  },

  update: function(id, updates) {
    return api.request({
      path: '/updatecategory/' + id,
      method: 'PUT',
      data: updates
    });
  },

  delete: function(id) {
    return api.request({
      path: '/deletecategory/' + id,
      method: 'DELETE'
    });
  }
};