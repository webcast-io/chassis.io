var assert  = require('assert')
  , session = require('../../../lib/session');


describe("Session", function(){

  var sessionId = "d29h928dh29";
  var socketId  = "AAA8hdh92hd";

  beforeEach(function(done){
    session.getSocketsForSession(sessionId, function(err,sockets){

      if (sockets.length == 0) {
        done();
      } else {
        var length = sockets.length;
        for (var i =0; i<length;i++) {
          session.removeSocketFromSession(sockets[i],sessionId, function(err,response){
            if (i==length-1){
              done();
            };
          });
        }
      }

    });
  });

  describe("#addSocketToSession", function(){

    // Q - where, and how do we store this data?
    it("should add the socket id to the session's list of sockets", function(done){
      session.addSocketToSession(socketId,sessionId, function(err,response){
        assert.equal(true, response);
        session.getSocketsForSession(sessionId,function(err,sockets){
          assert.equal(0, sockets.indexOf(socketId));
          done();
        });
      });
    });

    it("should not add the socket id to the session, if the socket id is already there");

  });

  describe("#removeSocketFromSession", function(){

    it("should remove the socket id from the session's list of sockets", function(done){
      session.addSocketToSession(socketId,sessionId, function(err,response){
        assert.equal(null, err);
        assert.equal(true, response);
        session.removeSocketFromSession(socketId, sessionId, function(err2, response2){
          assert.equal(null, err2);
          assert.equal(true, response2);

          session.getSocketsForSession(sessionId,function(err,sockets){
            assert.equal(-1, sockets.indexOf(socketId));
            assert.equal([].length, sockets.length);
            done();
          });

        });
      });
    });

  });

  describe("#getSocketsForSession", function(){

    it("should return the list of socket ids for the session", function(done){
      session.addSocketToSession(socketId,sessionId, function(err,response){
        assert.equal(true, response);
        session.getSocketsForSession(sessionId,function(err,sockets){
          assert.equal(0, sockets.indexOf(socketId));
          done();
        });
      });
    });
  });

  describe("#unsubscribeSessionFromAllChannels", function(){
 
    it("should remove the session id from all of it's channel subscriptions");

  });

});