var redis       = require("redis")
  , client      = redis.createClient()
  , internalKey = "chassisInternal"
  , message     = require("../message")
  , nSKey       = "chassis_"
  , pool        = require('../pool')
  , pub         = redis.createClient()
  , sub         = redis.createClient();

sub.subscribe(internalKey);

sub.on("message", function(channel, rocket){
  message.decode(rocket, function(err, cargo){
    var channelName = cargo.channelName;
    var data        = cargo.data;
    var subscriber  = cargo.subscriber;

    client.smembers(nSKey+channelName, function(err, subscribers){
      if (subscribers.length > 0) {
        pool.getSockets(function(err,sockets) {
          if (err == null) {
            for (var k=0;k<subscribers.length;k++) {
              var socket = sockets[subscribers[k]];
              if (socket != undefined) {
                message.encode({channelName: channelName, data:data, subscriber: subscriber}, function(err, rocket){
                  socket.send(rocket);
                });
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
  });
});


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

  publish: function(channelName, subscriber, data, cb) {
    var error = null;
    var cargo = {channelName: channelName, subscriber: subscriber, data: data};
    message.encode(cargo, function(err, rocket){    
      error = err;
      pub.publish(internalKey, rocket);
      if (typeof cb ===  "function") cb (error);
    });
  }

}