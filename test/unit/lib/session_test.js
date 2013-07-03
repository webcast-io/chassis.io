var assert  = require('assert')
  , chassis = require('../../../index');

describe("Session", function(){

  var sessionId = "d29h928dh29";
  var socketId  = "AAA8hdh92hd";

  beforeEach(function(done){
    chassis.session.getSocketsForSession(sessionId, function(err,sockets){

      if (sockets.length == 0) {
        done();
      } else {
        var length = sockets.length;
        for (var i =0; i<length;i++) {
          chassis.session.removeSocketFromSession(sockets[i],sessionId, function(err,response){
            if (i==length-1){
              done();
            };
          });
        }
      }

    });
  });


  describe("#addSocketToSession", function(){

    // Q - where, and how do we store this data? - in memory for now, but the thing is
    // say the server goes down, then comes back up. We haven't been able to trigger
    // the 'removeSocketFromSession' function.

    // However, if the session goes to the server and is new, then this isn't a worry
    // keeping this data in memory, because the session has no associated sockets, and 
    // will trigger the reconnection because the session-sockets is in-memory.

    it("should add the socket id to the session's list of sockets", function(done){
      chassis.session.addSocketToSession(socketId,sessionId, function(err,response){
        assert.equal(true, response);
        chassis.session.getSocketsForSession(sessionId,function(err,sockets){
          assert.equal(0, sockets.indexOf(socketId));
          done();
        });
      });
    });

    it("should set a sessionId variable on the socket, so that we can disassociate it with ease", function(done){

      // do the same as above, but check that socket.sessionId is equal to sessionId
      // you'll need to use a mock socket object
      var sessionId = "zcKXnzpqgaCdOn1oAAAA";
      var mockSocket = {
        id: "90ej1j90e1",
        request: {
          headers: {
            cookie: "io=zcKXnzpqgaCdOn1oAAAA; __utma=79318037.648842808.1352120656.1361279916.1361285341.56; __utmc=79318037; __utmz=79318037.1352120656.1.1.utmcsr=(direct)|utmccn=(direct)|utmcmd=(none); connect.sid=oB2jK5SrJynMymmulC7shDxQ.SR2tfe50YoqzaRPL8BTQ6PEqYmG4uMxij0f6yRpgIwUoB2jK5SrJynMymmulC7shDxQ.SR2tfe50YoqzaRPL8BTQ6PEqYmG4uMxij0f6yRpgIwU"
          }
        },
        transport: {},
        sessionId: "zcKXnzpqgaCdOn1oAAAA"
      };
      chassis.pool.addSocket(mockSocket, function(err,res){
        chassis.pool.getSocket(mockSocket.id, function(err,socket){
          assert.equal(sessionId, socket.sessionId);
          done();
        });
      });

    });

    it("should not add the socket id to the session, if the socket id is already there");

  });

  describe("#removeSocketFromSession", function(){

    it("should remove the socket id from the session's list of sockets", function(done){
      chassis.session.addSocketToSession(socketId,sessionId, function(err,response){
        assert.equal(null, err);
        assert.equal(true, response);
        chassis.session.removeSocketFromSession(socketId, sessionId, function(err2, response2){
          assert.equal(null, err2);
          assert.equal(true, response2);

          chassis.session.getSocketsForSession(sessionId,function(err,sockets){
            assert.equal(-1, sockets.indexOf(socketId));
            assert.equal([].length, sockets.length);
            done();
          });

        });
      });
    });

    it("should handle multiple requests to remove the same socket id from a session, just in case");

  });

  describe("#getSocketsForSession", function(){

    it("should return the list of socket ids for the session", function(done){
      chassis.session.addSocketToSession(socketId,sessionId, function(err,response){
        assert.equal(true, response);
        chassis.session.getSocketsForSession(sessionId,function(err,sockets){
          assert.equal(0, sockets.indexOf(socketId));
          done();
        });
      });
    });
  });

  describe("#unsubscribeSessionFromAllChannels", function(){
 
    it("should remove the session id from all of it's channel subscriptions");

  });

  // This is the magic bean function - handles engine.io's connection
  // strategy.
  describe("#getCurrentSocketForSession", function(){

    it("should fetch the latest socket for the session from the pool", function(done){
      var mockSocket1 = {
        id: "first",
        request: {
          headers: {
            cookie: "io=zcKXnzpqgaCdOn1oAAAA; __utma=79318037.648842808.1352120656.1361279916.1361285341.56; __utmc=79318037; __utmz=79318037.1352120656.1.1.utmcsr=(direct)|utmccn=(direct)|utmcmd=(none); connect.sid=oB2jK5SrJynMymmulC7shDxQ.SR2tfe50YoqzaRPL8BTQ6PEqYmG4uMxij0f6yRpgIwUoB2jK5SrJynMymmulC7shDxQ.SR2tfe50YoqzaRPL8BTQ6PEqYmG4uMxij0f6yRpgIwU"
          }
        },
        transport: {}
      };

      var mockSocket2 = {
        id: "second",
        request: {
          headers: {
            cookie: "io=zcKXnzpqgaCdOn1oAAAB; __utma=79318037.648842808.1352120656.1361279916.1361285341.56; __utmc=79318037; __utmz=79318037.1352120656.1.1.utmcsr=(direct)|utmccn=(direct)|utmcmd=(none); connect.sid=oB2jK5SrJynMymmulC7shDxQ.SR2tfe50YoqzaRPL8BTQ6PEqYmG4uMxij0f6yRpgIwUoB2jK5SrJynMymmulC7shDxQ.SR2tfe50YoqzaRPL8BTQ6PEqYmG4uMxij0f6yRpgIwU"
          }
        },
        transport: {}
      };      

      

      chassis.pool.addSocket(mockSocket1, function(err){
        chassis.pool.addSocket(mockSocket2, function(err){

          chassis.session.addSocketToSession(mockSocket1.id, sessionId, function(err, res){

            chassis.session.addSocketToSession(mockSocket2.id, sessionId, function(err, res){

              chassis.session.getCurrentSocketForSession(sessionId, function(err,socket){

                assert.equal(null, err);
                assert.equal(mockSocket2.id, socket.id);
                done();

              });

            });
 
          });

        });
      });

      // here's a question, doesn't pool add socket call session.addSocketToSession? 
      // - yes, it will, once we've implemented it to work that way
    });

  });  


});