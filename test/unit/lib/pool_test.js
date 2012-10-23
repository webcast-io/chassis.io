var assert = require('assert')
  , pool   = require('../../../lib/pool');

describe("Pool", function(){

  describe("#addSocket", function(){

    after(function(done){
      pool.removeSocket('uniqueId', function(err){
        assert.equal(null, err);
        done();
      })
    });

    it("should add the socket to the pool of sockets", function(done){
      pool.getSockets(function(err,sockets){
        assert.equal(null, err);
        assert.equal(undefined,sockets['uniqueId']);
        var mockSocket = {id: 'uniqueId'};
        pool.addSocket(mockSocket, function(err){
          assert.equal(null, err);
          pool.getSockets(function(err,sockets){
            assert.equal(mockSocket, sockets['uniqueId']);
            done();
          });
        });
      });      
    });

  });

  describe("#removeSocket", function(){

    it("should remove the socket from the pool of sockets", function(done){
      var mockSocket = {id:'anotherUniqueId'};
      pool.addSocket(mockSocket, function(err){
        pool.removeSocket('anotherUniqueId', function(err){
          assert.equal(null,err);
          pool.getSockets(function(err, sockets){
            assert.equal(undefined, sockets['anotherUniqueId']);
            done();
          });
        });
      });
    });

    // Note - this is more of a functional test
    it("should remove the socket from all of the channels that it is subscribed to", function(done){
      // we need a channel, a socket, and some data
      var mockSocket  = {id: '90ej1j90e1'}
        , channelName = "presentation_xxxx"
        , data        = {name:"paul"};
      // we add a socket
      pool.addSocket(mockSocket, function(err){
        // we simulate calling chassis.subscribe("channel",socket.id, data);
        // We then call pool.removeSocket
        // We check that the pubsub.unsubscribe is called as well
        // we check that the channel's subscribers does not include socket.id                
      })
    });



    // We need to find out what channels a socket is subscribed to
    // We then need to cleanup the channel subscriptions, by calling
    // pubsub.unsubscribe
    // Ahh, the problem is that we won't have the user's data to pass to the unsubscribe,
    // Or we pass the data that was passed for subscribe to unsubscribe.
    // Would mean that unsubscribe works when the browser closes.
    // This is a hack, but would work for now.
  });

  describe("#getSockets", function(){

    it("should return the entire pool of sockets", function(done){
      var mockSocketOne = {id:'tango'};
      var mockSocketTwo = {id:'cash'};
      pool.addSocket(mockSocketOne, function(err){
        pool.addSocket(mockSocketTwo, function(err){
          pool.getSockets(function(err,sockets){
            assert.equal(sockets['tango'], mockSocketOne);
            assert.equal(sockets['cash'], mockSocketTwo);
            assert.deepEqual(sockets,{'tango':mockSocketOne, 'cash':mockSocketTwo});
            done();
          });
        });
      });
    });

  });
  
});