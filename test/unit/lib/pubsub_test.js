var assert = require('assert')
  , pubsub = require('../../../lib/pubsub');

describe("pubsub", function(){

  before(function(done){
    var pool          = require('../../../lib/pool')
      , redis         = require('redis')
      , client        = redis.createClient();

    client.del("chassis_"+'boxes', function(err,res){
      pool.getSockets(function(err,sockets){
        var keyLength = Object.keys(sockets).length;
        if (keyLength == 0) return done();
        for (var socket in sockets){
          pool.removeSocket(socket, function(err){
            // TODO - detect that this is the last 
            // key in the object being looped through
            console.log("removing socket",socket);
            if (i == socket.length-1) {done()};
          });
        }
      });
    });

  });

  describe("#subscribe", function(){
    // what do we want to check?
    // that a socket is subscribed to a given channel
    // - the redis channel gets a subscriber (the socket id)
    // - the socket's channels includes the channel
    // - that the 'subscribe' event is emitted to all listeners for that event

    // edge case - subscribing a socket to a channel it is already subscribed to

    // what do we need?
    // - a socket
    // - a channel
    // - all of the dependencies of the pubsub library
    // - redis
    // - pool (so we can inspect the socket)
    // - eventHandler (so that we can listen to the subscribe event)

    // how do we test it?
    // we add a socket to the pool
    // then we call "subscribe" on the pubsub method
    // then we do all of our assertions.

    before(function(done){

      var id            = '12093213890nj98d'
        , socket        = {id: id}
        , channelName   = "boxes"
        , eventHandler  = require('../../../lib/eventHandler')
        , pool          = require('../../../lib/pool');

      eventHandler.on('subscribe', function(channel, subscriber){
        assert.equal(channel, channelName);
        assert.equal(subscriber, id);
        done();
      });

      pool.addSocket(socket, function(err){
        pubsub.subscribe(channelName, socket.id, function(err){
        });
      });

    });
    
    it("should add the channel to the socket", function(done){
      var channelName   = "boxes"
        , pool          = require('../../../lib/pool')
        , id            = '12093213890nj98d';
      pool.getSocket(id, function(err, returnedSocket){
        assert.equal(returnedSocket.channels.length, 1);
        assert.equal(returnedSocket.channels[0], channelName);
        done();
      });
    });

    it("should add the socket to the channel's Redis set of subscribed sockets", function(done){
      var redis         = require('redis')
        , client        = redis.createClient()
        , id            = '12093213890nj98d'
        , channelName   = "boxes";

      client.smembers('chassis_'+channelName, function(err, members){
        assert.equal(members.length, 1);
        assert.equal(members[0], id);
        done();
      });
    });
    
  });

  describe("#unsubscribe", function(){

  });

  describe("#publish", function(){

  });


});