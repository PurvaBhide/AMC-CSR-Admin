// participant.service.js

var ParticipantService = {
  create: function(participantData) {
    return api.request({
      path: '/createParticipant',
      method: 'POST',
      data: participantData
    });
  },

  listAll: function() {
    return api.request({
      path: '/listAllParticipant',
      method: 'GET'
    });
  },

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
