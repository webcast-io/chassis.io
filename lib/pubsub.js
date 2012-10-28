// Dependencies
var redis         = require("redis")
  , message       = require("./message")
  , pool          = require('./pool')
  , eventHandler  = require('./eventHandler');

// Redis Pubsub clients
var client        = redis.createClient()
  , pub           = redis.createClient()
  , sub           = redis.createClient();

// Redis namespace keys
var internalKey   = "chassisInternal"
  , nSKey         = "chassis_";

// Internal channel used to handle distributing
// publish events to all Node.js processes.
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
                  if (k == subscribers.length-1) {
                    if (typeof cb === "function") cb(error);
                  } 
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
          pool.getSocket(subscriber, function(err,socket){
            if (socket.channels == undefined) {
              socket.channels = [channelName];
            } else {
              socket.channels.push(channelName);
            }
            eventHandler.emit('subscribe', channelName, subscriber);
            error = err;
            if (typeof cb === "function") cb(error);
          });
        });
      } else {
        if (typeof cb === "function") cb(error);
      }
    });

  },

  unsubscribe: function(channelName, subscriber, cb) {
    var error = null;
    client.srem(nSKey+channelName, subscriber, function(err, result){
      error = err;
      pool.getSocket(subscriber, function(err, socket){
        if (socket.channels != undefined) {
          var index   = socket.channels.indexOf(channelName);
          if (index != -1) {socket.channels.splice(index,1)};
        };
        eventHandler.emit('unsubscribe', channelName, subscriber);
        if (typeof cb === "function") cb(error);
      });
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