// This module handles the storage of sockets,
// so that we can add new sockets, remove
// closed sockets, and fetch sockets to send
// messages

// Sockets are bound to the Node.js process.
var sockets = {};

module.exports = function(chassis) {
  var finish = chassis.helpers.finish;

  function removeSocketFromChannels (socketChannels, socketId, callback) {
    var socketChannelCount  = socketChannels.length;
    for (var i=0;i<socketChannelCount;i++) {
      var channel = socketChannels[i];
      // We put this here, otherwise circular dependency hell breaks out - might not be the case anymore
      chassis.pubsub.unsubscribe(channel, socketId, function(err){
        if (i == socketChannelCount) {
          callback(err);
        }
      });
    }
  }

  function setSessionIdOnSocket (socket, cb) {
    if (socket && socket.request && socket.request.headers && socket.request.headers.cookie) {
      var sessionId = null;
      // io is the cookie name specified in the example
      if (socket.request.headers.cookie.match("io=") != null) {
        sessionId = socket.request.headers.cookie.split("io=")[1].split(';')[0];
      }
      if (sessionId) {
        socket.sessionId = sessionId;
      }
      cb();
    } else {
      cb();
    }
  }

  chassis.pool = {

    addSocket: function(socket, cb) {
      var error = null;
      setSessionIdOnSocket(socket, function(){
        sockets[socket.id] = socket;
        finish(cb,error);
      });
    },

    removeSocket: function(socketId, cb) {
      var error = null;
      if (sockets[socketId] == undefined) {
        error = "Did not find socket with id: "+ socket.id;
        finish(cb,error);
      } else {
        var socketChannels      = sockets[socketId].channels;
        if (socketChannels != undefined) {
          removeSocketFromChannels(socketChannels, socketId, function(err) {
            delete sockets[socketId];
            finish(cb,err);
          });
        } else {
          delete sockets[socketId];
          finish(cb,error);
        }
      }
    },

    getSockets: function(cb) {
      var error = null;
      cb(error, sockets);
    },

    getSocket: function(id,cb) {
      var error   = null;
      var socket  = sockets[id];
      if (socket == undefined) {error = new Error("socket not found with id:",id)}
      cb(error, socket);
    }

  };

}