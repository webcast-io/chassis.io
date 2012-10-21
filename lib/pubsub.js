var channels = {}

// We are relying on Node.js's module caching here,
// it's a dirty trick but we'll use it for now.
//
var sessionManager  = require('./sessionManager');
var socketManager   = require('./socketManager');

module.exports = {
  
  subscribe: function(channelName, subscriber, cb) {
    var error = null;
    if (channels[channelName] == undefined) {
      channels[channelName] = [subscriber];
    } else {
      // Prevent a subscriber from being added
      // to the channel more than once.
      if (channels[channelName].indexOf(subscriber) == -1) {
        channels[channelName].push(subscriber);
      }
    }
    cb(error);
  },

  unsubscribe: function(channelName, subscriber, cb) {
    var error = null;
    if (channels[channelName] == undefined) {
      error = "Channel does not exist";
    } else {
      var index = channels[channelName].indexOf(subscriber);
      if (index == -1) {
        error = "Channel does not have the subscriber "+subscriber;
      } else {
        channels[channelName].splice(index,1);
      }
    }
    cb(error);
  },

  publish: function(channelName, data, cb) {
    var error = null;
    var subscribers = channels[channelName];
    if (subscribers == undefined) {
      var error = "Channel does not exist";
      cb(error);
    } else {
      sessionManager.getSocketIdsFromSessionIds(subscribers, function(err, socketIds){        
        if (err == null) {
          socketManager.getSockets(function(err,sockets) {
            if (err == null) {
              for (var k=0;k<socketIds.length;k++) {
                sockets[socketIds[k]].send(data);
              }
            } else {
              error = err;
              cb(error);
            }
          });
        } else {
          error = err;
          cb(error);
        }

      });
    }
  }

}