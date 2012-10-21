var channels  = {}
  , message   = require('../message')
  , pool      = require('../pool');

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
    if (typeof cb === "function") cb(error);
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
    if (typeof cb === "function") cb(error);
  },

  publish: function(channelName, data, cb) {
    var error = null;
    var subscribers = channels[channelName];
    if (subscribers == undefined) {
      var error = "Channel does not exist";
      if (typeof cb === "function") cb(error);
    } else {

      pool.getSockets(function(err,sockets) {
        if (err == null) {
          for (var k=0;k<subscribers.length;k++) {
            var socket = sockets[subscribers[k]];
            if (socket != undefined) {
              message.encode(data, function(err, rocket){                
                socket.send(rocket);
              });
            }
          }
        } else {
          error = err;
          if (typeof cb === "function") cb(error);
        }
      });

    }
  }

}