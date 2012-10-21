var redis     = require("redis")
  , client    = redis.createClient()
  , nSKey     = "chassis_"
  , pool      = require('../pool');

module.exports = {
  
  subscribe: function(channelName, subscriber, cb) {
    var error = null;
    client.sismember(nSKey+channelName, subscriber, function(err, result){
      error = err;
      if (result == 0) {
        client.sadd(nSKey+channelName, subscriber, function(err, result){
          error = err;
          if (typeof cb === "function") cb(error);
        });
      } else {
        if (typeof cb === "function") cb(error);
      }
    });

  },

  // NOTE - I've decided not to raise an error if the subscriber is not
  // in the list when we wish to remove them.
  unsubscribe: function(channelName, subscriber, cb) {
    var error = null;
    client.srem(nSKey+channelName, subscriber, function(err, result){
      error = err;
      if (typeof cb === "function") cb(error);
    });
  },

  publish: function(channelName, data, cb) {
    var error = null;
    client.smembers(nSKey+channelName, function(err, subscribers){
      error = err;
      if (subscribers.length > 0) {
        pool.getSockets(function(err,sockets) {
          if (err == null) {
            for (var k=0;k<subscribers.length;k++) {
              var socket = sockets[subscribers[k]];
              if (socket != undefined) {
                var rocket = JSON.stringify(data);
                socket.send(rocket);
              }
            }
          } else {
            error = err;
            if (typeof cb === "function") cb(error);
          }
        });
      } else {
        if (typeof cb === "function") cb(error);        
      }
    });
  }

}