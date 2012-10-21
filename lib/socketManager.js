// This module handles the storage of sockets,
// so that we can add new sockets, remove
// closed sockets, and fetch sockets to send
// messages

var sockets = {};

module.exports = {

  addSocket: function(socket, cb) {
    var error = null;
    sockets[socket.id] = socket;
    cb(error);
  },

  removeSocket: function(socketId, cb) {
    var error = null;
    if (sockets[socketId] == undefined) {
      error = "Did not find socket with id: "+ socket.id;
    } else {
      delete sockets[socketId];
    }
    cb(error);
  },

  getSockets: function(cb) {
    var error = null
    cb(error, sockets);
  }

};