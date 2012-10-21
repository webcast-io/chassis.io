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
    } else {
      delete sockets[socketId];
    }
    if (typeof cb === 'function') cb(error);
  },

  getSockets: function(cb) {
    var error = null
    cb(error, sockets);
  }

};