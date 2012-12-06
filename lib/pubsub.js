// Dependencies
//
var redis         = require("redis")
  , finish        = require('./helpers').finish
  , wrapError     = require('./helpers').wrapError
  , message       = require("./message")
  , pool          = require('./pool')
  , eventHandler  = require('./eventHandler');

// Redis Pubsub clients
//
var client        = redis.createClient()
  , pub           = redis.createClient()
  , sub           = redis.createClient();

// Redis namespace keys
//
var internalKey   = "chassisInternal"
  , nSKey         = "chassis_";

// Sends an internal message to a single subscriber (a socket)
//
function sendMessageToSubscriber (socket, cargo, outerCb, innerCb) {
  if (socket != undefined) {
    message.encode(cargo, function(err, rocket){
      wrapError(err, outerCb, function(){
        socket.send(rocket);
        innerCb();
      });
    });
  } else {
    innerCb();
  }
}

// Gets all of the subscribed sockets that the node.js process has, and sends 
// the internal message to all of them.
//
function sendMessageToSubscribers (subscribers, subscriber, channelName, data, cb, error) {
  pool.getSockets(function(err,sockets) {
    wrapError(err, cb, function(){
      for (var k=0;k<subscribers.length;k++) {
        var socket  = sockets[subscribers[k]]
          , cargo   = {channelName: channelName, subscriber: subscriber, data: data};
        sendMessageToSubscriber(socket, cargo, function(){
          if (k == subscribers.length-1) finish(cb,err);
        });
      }
    });
  });
}

// Adds the channel to the socket
//
function addChannelToSocket (socket, channelName) {
  if (socket.channels == undefined) {
    socket.channels = [channelName];
  } else {
    socket.channels.push(channelName);
  }
}

// Removes the channel from the socket
//
function removeChannelFromSocket (socket, channelName) {
  if (socket.channels != undefined) {
    var index   = socket.channels.indexOf(channelName);
    if (index != -1) {socket.channels.splice(index,1)};
  };
}

// Internal channel used to handle distributing
// publish events to all Node.js processes.
//
sub.subscribe(internalKey);

// Send an internal message to all Node.js 
// processes.
//
sub.on("message", function(channel, rocket){
  message.decode(rocket, function(err, cargo){
    wrapError(err,cb, function(){
      var channelName = cargo.channelName
        , data        = cargo.data
        , subscriber  = cargo.subscriber;
      client.smembers(nSKey+channelName, function(err, subscribers){
        wrapError(err,cb, function(){
          if (subscribers.length > 0) {
            sendMessageToSubscribers(subscribers, subscriber, channelName, data, cb, err);
          } else {
            finish(cb,err);
          }
        });
      });
    });
  });
});

// Module to export
//
module.exports = {
  
  // The subscribe command, used to subscribe a socket
  // to a channel.
  //
  subscribe: function(channelName, subscriber, cb) {
    client.sismember(nSKey+channelName, subscriber, function(err, result){
      wrapError(err,cb, function(){
        if (result == 0) {
          client.sadd(nSKey+channelName, subscriber, function(err, result){
            pool.getSocket(subscriber, function(err,socket){
              addChannelToSocket(socket, channelName);
              eventHandler.emit('subscribe', channelName, subscriber);
              finish(cb,err);
            });
          });
        } else {
          finish(cb,err);
        }
      });
    });
  },

  // The unsubscribe command, used to unsubscribe a socket
  // from a channel.
  //
  unsubscribe: function(channelName, subscriber, cb) {
    client.srem(nSKey+channelName, subscriber, function(err, result){
      wrapError(err,cb, function(){
        pool.getSocket(subscriber, function(err, socket){
          wrapError(err,cb, function(){
            removeChannelFromSocket(socket, channelName);
            eventHandler.emit('unsubscribe', channelName, subscriber);
            finish(cb, err);
          });
        });
      });      
    });
  },

  // The publish command, used to send data to a channel,
  // to be received by all subscribers to that channel.
  //
  publish: function(channelName, subscriber, data, cb) {
    var cargo = {channelName: channelName, subscriber: subscriber, data: data};
    message.encode(cargo, function(err, rocket){    
      pub.publish(internalKey, rocket);
      finish(cb, err);
    });
  }

}