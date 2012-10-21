// This module keeps a record of what socketIds
// belong to which sessions.
//
// The socket expires when a user refreshes the
// web browser.
//
// So that we don't lose state between page refreshes,
// we keep a record of the session


var sessions = {};

module.exports = {

  addSocketIdToSession: function(socketId, sessionId, cb) {
    var error = null;
    if (sessions[sessionId] == undefined) {
      sessions[sessionId] = [socketId];
    } else {
      sessions[sessionId].push(socketId);
    }
    cb(error);
  },

  removeSocketIdFromSession: function(socketId, cb) {
    var error = null;
    for (var sessionId in sessions) {
      var index = sessions[sessionId].indexOf(socketId);
      if (index != -1) {
        sessions[sessionId].splice(index, 1);
      }
    };
    cb(error);
  },

  getSessions: function (cb) {
    var error = null;
    cb(error, sessions);
  },

  getSessionFromSocketId: function(socketId, cb) {
    var error   = null;
    var session = null;
    for (var sessionId in sessions) {
      var index = sessions[sessionId].indexOf(socketId);
      if (index != -1) {
        session = sessionId;
      }
    }
    if (session == null) {
      error = "Session not found for socket id: " + socketId;
    }
    cb(error, session);
  },

  getSessionFromSessionId: function(sessionId, cb) {
    var error   = null;
    var session = null;
    session = sessions[sessionId];
    if (session == null) {
      error = "Session not found for session id: " + sessionId;
    }
    cb(error, session);
  },

  getSocketIdsFromSessionIds: function(sessionIds, cb) {
    var error     = null;
    var socketIds = [];
    for (var i=0; i<sessionIds.length;i++) {
      var sessionSocketIds = sessions[sessionIds[i]];
      for (var j=0;j<sessionSocketIds.length;j++) {
        socketIds.push(sessionSocketIds[j]);
      }
    }
    cb(error, socketIds);
  }

}