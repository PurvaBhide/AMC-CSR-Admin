var ProjectService = {
  add: function(data) {
    return api.request({ path: '/addProject', method: 'POST', data: data });
  },
  listAll: function(page, size) {
    return api.request({ 
      path: '/listallProjects?page=' + (page || 0) + '&size=' + (size || 10), 
      method: 'GET' 
    });
  },

  getById: function(id) {
    return api.request({ path: '/projectshowbyid/' + id, method: 'GET' });
  },
  getByCompany: function(companyId) {
    return api.request({ path: '/projectshowbycompanieId/' + companyId, method: 'GET' });
  },
 filter: (queryString) => {
      return fetch(`${queryString}`)
        .then((res) => res.json());
    },
  // filter: function(params) {
  //   var query = Object.keys(params).map(function(key) {
  //     return key + '=' + encodeURIComponent(params[key]);
  //   }).join('&');
  //   return api.request({ path: '/projects/filter?' + query, method: 'GET' });
  // },
  update: function(id, data) {
    return api.request({ path: '/updateProject/' + id, method: 'PUT', data: data });
  },
  delete: function(id) {
    return api.request({ path: '/deleteProject/' + id, method: 'DELETE' });
  }
};