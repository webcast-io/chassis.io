var assert      = require('assert')
  , pool        = require('../../../lib/pool')
  , session     = require('../../../lib/session')
  , chassis     = require('../../../index')
  , redis       = require('redis')
  , redisClient = redis.createClient();

describe("Pool", function(){

  beforeEach(function(done){
    pool.getSockets(function(err,sockets){
      var length = Object.keys(sockets).length;
      if (length == 0) { 
        done();
      } else {

        var count  = 0;
        for (var socketId in sockets) {
          pool.removeSocket(socketId, function(err,res){
            count++;
            if (count == length) {
              done();
            }
          });
        }

      };
    });
  });

  describe("#addSocket", function(){

    it("should add the socket to the pool of sockets", function(done){
      pool.getSockets(function(err,sockets){
        assert.equal(null, err);
        assert.equal(undefined,sockets['uniqueId']);
        
      var mockSocket = {
        id: "uniqueId",
        request: {
          headers: {
            cookie: "io=zcKXnzpqgaCdOn1oAAAA; __utma=79318037.648842808.1352120656.1361279916.1361285341.56; __utmc=79318037; __utmz=79318037.1352120656.1.1.utmcsr=(direct)|utmccn=(direct)|utmcmd=(none); connect.sid=oB2jK5SrJynMymmulC7shDxQ.SR2tfe50YoqzaRPL8BTQ6PEqYmG4uMxij0f6yRpgIwUoB2jK5SrJynMymmulC7shDxQ.SR2tfe50YoqzaRPL8BTQ6PEqYmG4uMxij0f6yRpgIwU"
          }
        },
        transport: {}
      };


        pool.addSocket(mockSocket, function(err){
          assert.equal(null, err);
          pool.getSockets(function(err,sockets){
            assert.equal(mockSocket, sockets['uniqueId']);
            done();
          });
        });
      });      
    });

    it("should associate the socket with a session", function(done){
      var sessionId  = "zcKXnzpqgaCdOn1oAAAA";
      var mockSocket = {
        id: "2d020hd02hk",
        request: {
          headers: {
            cookie: "io=zcKXnzpqgaCdOn1oAAAA; __utma=79318037.648842808.1352120656.1361279916.1361285341.56; __utmc=79318037; __utmz=79318037.1352120656.1.1.utmcsr=(direct)|utmccn=(direct)|utmcmd=(none); connect.sid=oB2jK5SrJynMymmulC7shDxQ.SR2tfe50YoqzaRPL8BTQ6PEqYmG4uMxij0f6yRpgIwUoB2jK5SrJynMymmulC7shDxQ.SR2tfe50YoqzaRPL8BTQ6PEqYmG4uMxij0f6yRpgIwU"
          }
        },
        transport: {}
      };

      pool.addSocket(mockSocket, function(err){
        assert.equal(err, null);
        session.getSocketsForSession(sessionId, function(err, socketIds){
          assert.equal(socketIds[0], mockSocket.id);
          done();
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
      var mockSocket = {
        id: "anotherUniqueId",
        request: {
          headers: {
            cookie: "io=zcKXnzpqgaCdOn1oAAAA; __utma=79318037.648842808.1352120656.1361279916.1361285341.56; __utmc=79318037; __utmz=79318037.1352120656.1.1.utmcsr=(direct)|utmccn=(direct)|utmcmd=(none); connect.sid=oB2jK5SrJynMymmulC7shDxQ.SR2tfe50YoqzaRPL8BTQ6PEqYmG4uMxij0f6yRpgIwUoB2jK5SrJynMymmulC7shDxQ.SR2tfe50YoqzaRPL8BTQ6PEqYmG4uMxij0f6yRpgIwU"
          }
        },
        transport: {}
      };


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

    it("should disassociate the socket from the session it was associated with", function(done){
      var sessionId = "zcKXnzpqgaCdOn1oAAAA";
      var mockSocket = {
        id: "anotherUniqueId",
        request: {
          headers: {
            cookie: "io=zcKXnzpqgaCdOn1oAAAA; __utma=79318037.648842808.1352120656.1361279916.1361285341.56; __utmc=79318037; __utmz=79318037.1352120656.1.1.utmcsr=(direct)|utmccn=(direct)|utmcmd=(none); connect.sid=oB2jK5SrJynMymmulC7shDxQ.SR2tfe50YoqzaRPL8BTQ6PEqYmG4uMxij0f6yRpgIwUoB2jK5SrJynMymmulC7shDxQ.SR2tfe50YoqzaRPL8BTQ6PEqYmG4uMxij0f6yRpgIwU"
          }
        },
        transport: {}
      };
      pool.addSocket(mockSocket, function(err,res){
        assert.equal(err, null);

        pool.removeSocket(mockSocket.id, function(err,res){
          assert.equal(err, null);
          session.getSocketsForSession(sessionId, function(err, socketIds){
            assert.equal(socketIds.length, [].length);
            done();
          });
        });

      });

    });

    // Note - this is more of a functional test
    it("should remove the socket from all of the channels that it is subscribed to", function(done){
      var channelName = "presentation_xxxx"
        , data        = {name:"paul"};

      var mockSocket = {
        id: "90ej1j90e1",
        request: {
          headers: {
            cookie: "io=zcKXnzpqgaCdOn1oAAAA; __utma=79318037.648842808.1352120656.1361279916.1361285341.56; __utmc=79318037; __utmz=79318037.1352120656.1.1.utmcsr=(direct)|utmccn=(direct)|utmcmd=(none); connect.sid=oB2jK5SrJynMymmulC7shDxQ.SR2tfe50YoqzaRPL8BTQ6PEqYmG4uMxij0f6yRpgIwUoB2jK5SrJynMymmulC7shDxQ.SR2tfe50YoqzaRPL8BTQ6PEqYmG4uMxij0f6yRpgIwU"
          }
        },
        transport: {}
      };

      pool.addSocket(mockSocket, function(err){
        chassis.pubsub.subscribe(channelName, mockSocket.id, function(err){
          pool.removeSocket(mockSocket.id, function(err){
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
      var mockSocketOne = {
        id: "tango",
        request: {
          headers: {
            cookie: "io=zcKXnzpqgaCdOn1oAAAA; __utma=79318037.648842808.1352120656.1361279916.1361285341.56; __utmc=79318037; __utmz=79318037.1352120656.1.1.utmcsr=(direct)|utmccn=(direct)|utmcmd=(none); connect.sid=oB2jK5SrJynMymmulC7shDxQ.SR2tfe50YoqzaRPL8BTQ6PEqYmG4uMxij0f6yRpgIwUoB2jK5SrJynMymmulC7shDxQ.SR2tfe50YoqzaRPL8BTQ6PEqYmG4uMxij0f6yRpgIwU"
          }
        },
        transport: {}
      };

      var mockSocketTwo = {
        id: "cash",
        request: {
          headers: {
            cookie: "io=zcKXnzpqgaCdOn1oAAAB; __utma=79318037.648842808.1352120656.1361279916.1361285341.56; __utmc=79318037; __utmz=79318037.1352120656.1.1.utmcsr=(direct)|utmccn=(direct)|utmcmd=(none); connect.sid=oB2jK5SrJynMymmulC7shDxQ.SR2tfe50YoqzaRPL8BTQ6PEqYmG4uMxij0f6yRpgIwUoB2jK5SrJynMymmulC7shDxQ.SR2tfe50YoqzaRPL8BTQ6PEqYmG4uMxij0f6yRpgIwU"
          }
        },
        transport: {}
      };


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