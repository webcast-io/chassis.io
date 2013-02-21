var assert      = require('assert')
  , chassis     = require('../../../index')
  , redis       = require('redis')
  , redisClient = redis.createClient();

chassis.loadLibraries();

describe("Pool", function(){

  describe("#addSocket", function(){

    after(function(done){
      chassis.pool.removeSocket('uniqueId', function(err){
        assert.equal(null, err);
        done();
      })
    });

    it("should add the socket to the pool of sockets", function(done){
      chassis.pool.getSockets(function(err,sockets){
        assert.equal(null, err);
        assert.equal(undefined,sockets['uniqueId']);
        var mockSocket = {id: 'uniqueId'};
        chassis.pool.addSocket(mockSocket, function(err){
          assert.equal(null, err);
          chassis.pool.getSockets(function(err,sockets){
            assert.equal(mockSocket, sockets['uniqueId']);
            done();
          });
        });
      });      
    });

  });

  describe("#removeSocket", function(){

    after(function(done){
      redisClient.del('chassis_presentation_xxxx', function(err,res){
        done();
      });
    });

    it("should remove the socket from the pool of sockets", function(done){
      var mockSocket = {id:'anotherUniqueId'};
      chassis.pool.addSocket(mockSocket, function(err){
        chassis.pool.removeSocket('anotherUniqueId', function(err){
          assert.equal(null,err);
          chassis.pool.getSockets(function(err, sockets){
            assert.equal(undefined, sockets['anotherUniqueId']);
            done();
          });
        });
      });
    });

    // Note - this is more of a functional test
    it("should remove the socket from all of the channels that it is subscribed to", function(done){
      var mockSocket  = {id: '90ej1j90e1'}
        , channelName = "presentation_xxxx"
        , data        = {name:"paul"};
      chassis.pool.addSocket(mockSocket, function(err){
        chassis.pubsub.subscribe(channelName, mockSocket.id, function(err){

            chassis.pool.removeSocket(mockSocket.id, function(err){
              redisClient.smembers('chassis_'+channelName, function(err, members){              
                assert.deepEqual([],members);
                done();
              });
            });

        });
      });
    });

  });

  describe("#getSockets", function(){

    it("should return the entire pool of sockets", function(done){
      var mockSocketOne = {id:'tango'};
      var mockSocketTwo = {id:'cash'};
      chassis.pool.addSocket(mockSocketOne, function(err){
        chassis.pool.addSocket(mockSocketTwo, function(err){
          chassis.pool.getSockets(function(err,sockets){
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