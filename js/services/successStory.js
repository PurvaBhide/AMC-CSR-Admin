var SuccessStoryService = {
  create: function(data) {
    return api.request({ path: '/createsuccessstory', method: 'POST', data: data });
  },
  listAll: function(page, size) {
    return api.request({ path: '/listallSuccessStory?page=' + (page || 0) + '&size=' + (size || 10),  method: 'GET' });
  },
  getById: function(id) {
    return api.request({ path: '/successStoryshowbyid/' + id, method: 'GET' });
  },
  getByCategory: function(categoryId) {
    return api.request({ path: '/SuccessStoryshowbycategoryid/' + categoryId, method: 'GET' });
  },
  update: function(id, data) {
    return api.request({ path: '/updateSuccessStory/' + id, method: 'PUT', data: data });
  },
  delete: function(id) {
    return api.request({ path: '/deleteSuccessStory/' + id, method: 'DELETE' });
  }
};