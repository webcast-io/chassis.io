// This module handles the storage of sockets,
// so that we can add new sockets, remove
// closed sockets, and fetch sockets to send
// messages

// Sockets are bound to the Node.js process.

var finish  = require('./helpers').finish
  , sockets = {};


function removeSocketFromChannels (socketChannels, socketId, callback) {
  var socketChannelCount  = socketChannels.length;
  for (var i=0;i<socketChannelCount;i++) {
    var channel = socketChannels[i];
    // We put this here, otherwise circular dependency hell breaks out
    var pubsub  = require('./pubsub');
    pubsub.unsubscribe(channel, socketId, function(err){
      if (i == socketChannelCount) {
        callback(err);
      }
    });
  }
}

module.exports = {

  addSocket: function(socket, cb) {
    var error = null;
    sockets[socket.id] = socket;
    finish(cb,error);
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
    cb(error, socket);
  }

};