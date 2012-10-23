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