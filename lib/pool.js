// This module handles the storage of sockets,
// so that we can add new sockets, remove
// closed sockets, and fetch sockets to send
// messages

// Sockets are bound to the Node.js process.

var finish      = require('./helpers').finish
  , parseCookie = require('./helpers').parseCookie
  , sockets     = {};


// TODO - replace this function with removeSocketFromSession,
// and make the session remove itself from the channel, if
// there are no sockets attached to it.
//
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
    var error           = null;
    // We put this here, otherwise circular dependency hell breaks out
    var session         = require('./session');
    sockets[socket.id]  = socket;

    parseCookie(socket, 'io', function(err, sessionId){
      sockets[socket.id].sessionId = sessionId;
      session.addSocketToSession(socket.id, sessionId, function(err, altered){
        finish(cb,error);
      });
    });
  },

  removeSocket: function(socketId, cb) {
    var error = null;
    var session = require('./session');
    if (sockets[socketId] == undefined) {
      error = "Did not find socket with id: "+ socketId;
      finish(cb,error);
    } else {
      var socketChannels      = sockets[socketId].channels;
      if (socketChannels != undefined) {

        session.removeSocketFromSession(socketId, sockets[socketId].sessionId, function(err,res){

          removeSocketFromChannels(socketChannels, socketId, function(err) {
            delete sockets[socketId];
            finish(cb,err);
          });

        });


      } else {

        session.removeSocketFromSession(socketId, sockets[socketId].sessionId, function(err,res){

          delete sockets[socketId];
          finish(cb,error);

        });
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