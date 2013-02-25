var redis = require('redis');

module.exports = function(chassis) {

  // namespace helper functions
  //
  var finish    = chassis.helpers.finish
    , wrapError = chassis.helpers.wrapError;

  // Set the redis options for the pubsub clients
  //
  if (chassis.options != undefined && chassis.options.server != undefined && chassis.options.server.redis != undefined) {
    var redisOptions = chassis.options.server.redis;
  } else {
    var redisOptions = {host:'localhost', port: 6379};
  }

  // Redis Pubsub clients
  //
  var client  = redis.createClient(redisOptions.port, redisOptions.host)
    , pub     = redis.createClient(redisOptions.port, redisOptions.host)
    , sub     = redis.createClient(redisOptions.port, redisOptions.host);

  // Authenticate Redis if it has a pass
  if (redisOptions.pass != undefined) {
    client.auth(redisOptions.pass);
    pub.auth(redisOptions.pass);
    sub.auth(redisOptions.pass);
  }

  // Redis namespace keys
  //
  var internalKey   = "chassisInternal"
    , nSKey         = "chassis_";


  // Sends an internal message to a single subscriber (a socket)
  //
  function sendMessageToSubscriber (socket, cargo, cb) {
    if (socket != undefined) {
      chassis.message.encode(cargo, function(err, rocket){
        if (err == null) {
          socket.send(rocket);
          cb();
        } else {
          throw err;
        }
      });
    } else {
      cb();
    }
  }

  // Gets all of the subscribed sockets that the node.js process has, and sends 
  // the internal message to all of them.
  //
  function sendMessageToSubscribers (subscribers, subscriber, channelName, data) {
    chassis.pool.getSockets(function(err,sockets) {
      if ( err== null) {
        for (var k=0;k<subscribers.length;k++) {
          var socket  = sockets[subscribers[k]]
            , cargo   = {channelName: channelName, subscriber: subscriber, data: data};
          sendMessageToSubscriber(socket, cargo, function(){
            if (k == subscribers.length-1) finish(undefined,err);
          });
        }
      } else {
        throw err;
      }
    });
  }

  // Adds the channel to the socket
  //
  function addChannelToSocket (socket, channelName) {
    if (socket != undefined) {
      if (socket.channels == undefined) {
        socket.channels = [channelName];
      } else {
        socket.channels.push(channelName);
      }
    }
  }

  // Removes the channel from the socket
  //
  function removeChannelFromSocket (socket, channelName) {
    if (socket != undefined && socket.channels != undefined) {
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
    chassis.message.decode(rocket, function(err, cargo){
      if (err == null) {
        var channelName = cargo.channelName
          , data        = cargo.data
          , subscriber  = cargo.subscriber;
        client.smembers(nSKey+channelName, function(err, subscribers){
          if (err==null) {
            if (subscribers.length > 0) {
              sendMessageToSubscribers(subscribers, subscriber, channelName, data);
            }
          } else {
            throw err;
          }
        });
      } else {
        throw err;
      };
    });
  });

  chassis.pubsub = {

    // The subscribe command, used to subscribe a socket
    // to a channel.
    //
    subscribe: function(channelName, subscriber, cb) {
      client.sismember(nSKey+channelName, subscriber, function(err, result){
        wrapError(err,cb, function(){
          if (result == 0) {
            client.sadd(nSKey+channelName, subscriber, function(err, result){
              chassis.pool.getSocket(subscriber, function(err,socket){
                addChannelToSocket(socket, channelName);
                chassis.eventHandler.emit('subscribe', channelName, subscriber);
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
          chassis.pool.getSocket(subscriber, function(err, socket){
            wrapError(err,cb, function(){
              removeChannelFromSocket(socket, channelName);
              chassis.eventHandler.emit('unsubscribe', channelName, subscriber);
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
      chassis.message.encode(cargo, function(err, rocket){    
        pub.publish(internalKey, rocket);
        finish(cb, err);
      });
    }


  };

}