// participant.service.js

var ParticipantService = {
  create: function(participantData) {
    return api.request({
      path: '/createParticipant',
      method: 'POST',
      data: participantData
    });
  },

listAll: function (page = 0, size = 5, filters = {}) {
  const params = new URLSearchParams({
    page,
    size,
    ...(filters.category && { category: filters.category }),
    ...(filters.ngo && { ngo: filters.ngo }),
    ...(filters.minBudget != null && { minBudget: filters.minBudget }),
    ...(filters.maxBudget != null && { maxBudget: filters.maxBudget })
  });

  return api.request({
    path: `/listAllParticipant?${params.toString()}`,
    method: 'GET'
  });
}
,

  getById: function(id) {
    return api.request({
      path: '/showbyParticipantId/' + id,
      method: 'GET'
    });
  },

  update: function(id, updates) {
    return api.request({
      path: '/updateParticipant/' + id,
      method: 'PUT',
      data: updates
    });
  },

  delete: function(id) {
    return api.request({
      path: '/deleteParticipant/' + id,
      method: 'DELETE'
    });
  }
};
