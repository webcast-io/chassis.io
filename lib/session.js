// This holds data about what sessions are associated with which sockets

var sessions = {};

module.exports = {

  addSocketToSession: function(socketId,sessionId, cb) {
    var err     = null
      , altered = false;

    var sessionSockets = sessions[sessionId];

    if (sessionSockets != undefined) {

      var index = sessions[sessionId].indexOf(socketId);

      if (index == -1) {
        altered = true;
        sessions[sessionId].push(socketId);
      }

    } else {

      altered = true;
      sessions[sessionId] = [socketId];

    }

    cb(err,altered);

  },

  removeSocketFromSession: function(socketId,sessionId, cb) {
    var err     = null
      , altered = false;

    var index = sessions[sessionId].indexOf(socketId);
  
    if (index != -1) {
      altered = true;
      sessions[sessionId].splice(index,1);
    }

    cb(err,altered);
  },

  getSocketsForSession: function(sessionId, cb) {
    var err             = null
      , sessionSockets  = sessions[sessionId];

    if (sessionSockets == undefined) {
      sessions[sessionId] = [];
    }

    cb(err, sessions[sessionId]);
  }

};