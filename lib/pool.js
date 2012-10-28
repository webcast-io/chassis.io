// This module handles the storage of sockets,
// so that we can add new sockets, remove
// closed sockets, and fetch sockets to send
// messages

// Sockets are bound to the Node.js process.


var sockets = {};

module.exports = {

  addSocket: function(socket, cb) {
    var error = null;
    sockets[socket.id] = socket;
    if (typeof cb === 'function') cb(error);
  },

  removeSocket: function(socketId, cb) {
    var error = null;
    if (sockets[socketId] == undefined) {
      error = "Did not find socket with id: "+ socket.id;
      if (typeof cb === 'function') cb(error);
    } else {
      var socketChannels      = sockets[socketId].channels;
      if (socketChannels != undefined) {
        var socketChannelCount  = socketChannels.length;
        for (var i=0;i<socketChannels.length;i++) {
          var channel = socketChannels[i];
          // We put this here, otherwise circular dependency hell breaks out
          var pubsub  = require('./pubsub');
          pubsub.unsubscribe(channel, socketId, function(err){
            if (i == socketChannelCount) {
              // call delete on the socket.
              delete sockets[socketId];
              if (typeof cb === 'function') cb(error);
            }
          });
        }
      } else {
        delete sockets[socketId];
        if (typeof cb === 'function') cb(error);
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
    cb(error, socket);
  }

};