'use strict';



var sessions = {};

module.exports = function (chassis) {

  chassis.session = {



    addSocketToSession: function (socketId, sessionId, cb) {
      var err     = null,
          altered = false;

      var sessionSockets = sessions[sessionId];

      if (sessionSockets !== undefined) {

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



    removeSocketFromSession: function (socketId, sessionId, cb) {
      var err     = null,
          altered = false;

      var index = sessions[sessionId].indexOf(socketId);
    
      if (index != -1) {
        altered = true;
        sessions[sessionId].splice(index,1);
      }

      cb(err,altered);
    },



    // note - this will be confusing because the
    // sockets are ids, not full sockets, like the 
    // getCurrentSocketForSession function.
    //
    getSocketsForSession: function (sessionId, cb) {
      var err             = null,
          sessionSockets  = sessions[sessionId];

      if (sessionSockets === undefined) {
        sessions[sessionId] = [];
      }

      cb(err, sessions[sessionId]);
    },



    getCurrentSocketForSession: function(sessionId, cb) {
      var err = null;
      this.getSocketsForSession(sessionId, function(error, socketIds){
        var length = socketIds.length;
        chassis.pool.getSocket(socketIds[length-1], function(error2,socket){
          cb(err,socket);
        });
      });
    }

  };

};