var assert        = require('assert')
  , pubsub        = require('../../../lib/pubsub')
  , pool          = require('../../../lib/pool')
  , eventHandler  = require('../../../lib/eventHandler')
  , redis         = require('redis')
  , client        = redis.createClient()
  , id            = '12093213890nj98d'
  , secondId      = '12033ei12ksas1df'
  , channelName   = "boxes"
  , emitted       = false
  , m1Received    = false
  , m2Received    = false
  , encodedData   = null;

var socket = {
  id: id,
  request: {
    headers: {
      cookie: "io=zcKXnzpqgaCdOn1oAAAA; __utma=79318037.648842808.1352120656.1361279916.1361285341.56; __utmc=79318037; __utmz=79318037.1352120656.1.1.utmcsr=(direct)|utmccn=(direct)|utmcmd=(none); connect.sid=oB2jK5SrJynMymmulC7shDxQ.SR2tfe50YoqzaRPL8BTQ6PEqYmG4uMxij0f6yRpgIwUoB2jK5SrJynMymmulC7shDxQ.SR2tfe50YoqzaRPL8BTQ6PEqYmG4uMxij0f6yRpgIwU"
    }
  },
  transport: {},
  send: function(data){
    m1Received = data
  }
};

var secondSocket = {
  id: secondId,
  request: {
    headers: {
      cookie: "io=zcKXnzpqgaCdOn1oAAAB; __utma=79318037.648842808.1352120656.1361279916.1361285341.56; __utmc=79318037; __utmz=79318037.1352120656.1.1.utmcsr=(direct)|utmccn=(direct)|utmcmd=(none); connect.sid=oB2jK5SrJynMymmulC7shDxQ.SR2tfe50YoqzaRPL8BTQ6PEqYmG4uMxij0f6yRpgIwUoB2jK5SrJynMymmulC7shDxQ.SR2tfe50YoqzaRPL8BTQ6PEqYmG4uMxij0f6yRpgIwU"
    }
  },
  transport: {},
  send: function(data){
    m2Received = data
  }
};

describe("pubsub", function(){

  before(function(done){

    client.del("chassis_"+'boxes', function(err,res){
      pool.getSockets(function(err,sockets){
        var keyLength = Object.keys(sockets).length;
        var i = 0;
        if (keyLength == 0) return done();
        for (var socket in sockets){
          pool.removeSocket(socket, function(err){
            i++;
            if (i == keyLength) {done()};
          });
        }
      });
    });

  });

  describe("#subscribe", function(){

    before(function(done){
      
      // This is in itself a test of the eventEmitter, because
      // if the event isn't emitted, then the done() function
      // won't be called, and thus the test will fail
      var called = false;
      eventHandler.on('subscribe', function(channel, subscriber){
        if (!called) {
          called = true;
          assert.equal(channel, channelName);
          assert.equal(subscriber, id);
          done();
        }
      });

      pool.addSocket(socket, function(err){
        pubsub.subscribe(channelName, socket.id, function(err){
        });
      });

    });
    
    it("should add the channel to the socket", function(done){
      pool.getSocket(id, function(err, returnedSocket){
        assert.equal(returnedSocket.channels.length, 1);
        assert.equal(returnedSocket.channels[0], channelName);
        done();
      });
    });

    it("should add the socket to the channel's Redis set of subscribed sockets", function(done){
      client.smembers('chassis_'+channelName, function(err, members){
        assert.equal(members.length, 1);
        assert.equal(members[0], id);
        done();
      });
    });
    
  });

  describe("#publish", function(){

    before(function(done){

      pool.addSocket(socket, function(err){
        pubsub.subscribe(channelName, socket.id, function(err){      
          pool.addSocket(secondSocket, function(err){
            pubsub.subscribe(channelName, secondSocket.id, function(err){
              done();
            });
          });
        });
      });

    });

    it("should send the data to all of the subscribers of that channel", function(done){
      var data    = {message: "Hello Mars"};

      pubsub.publish(channelName, id, data, function(err){
        // We have to delay the check by a few ms for Redis
        // roundtrip
        setTimeout(function(){
          assert.equal(m1Received, m2Received);
          assert(m1Received);
          assert(m2Received);
          var message = JSON.parse(m1Received);
          assert.deepEqual(message.subscriber, id);
          assert.deepEqual(message.channelName, channelName);
          assert.deepEqual(message.data, data);
          done();
        },3);
      });
    });

  });

  describe("#unsubscribe", function(){

    before(function(done){

      pool.addSocket(socket, function(err){
        pubsub.subscribe(channelName, socket.id, function(err){      
          pool.addSocket(secondSocket, function(err){
            pubsub.subscribe(channelName, secondSocket.id, function(err){
              done();
            });
          });
        });
      });

    });

    it("should remove a subscriber from the channel", function(done){
      m1Received = false;
      m2Received = false;
      var error  = new Error("Event not emitted");

      eventHandler.on('unsubscribe', function(chnlName, subscriber){
        assert.equal(chnlName, channelName);
        assert.equal(subscriber, secondId);
        error = null;
      });

      pubsub.unsubscribe(channelName,secondId, function(err){

        pool.getSocket(secondId, function(err, socket){
          assert.equal(null, err);
          assert.deepEqual(socket.channels,[]);
          client.smembers("chassis_"+channelName, function(err,members){
            assert.equal(members.indexOf(secondId),-1);
            var data    = {message: "Hello Venus"};
            pubsub.publish(channelName, id, data, function(err){
              setTimeout(function(){
                assert(m1Received);
                assert(!m2Received);
                done(error);
              },10);
            });
          });
        })        
      });
    });

  });

});