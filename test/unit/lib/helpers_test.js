var assert  = require('assert')
  , helpers = require('../../../lib/helpers');

describe("Helpers", function(){  

  describe("#finish", function(){

    it("should execute the callback, if a callback is passed to the function", function(done){
      // If cb isn't executed, this test will fail.
      var cb  = function(){
        done();
      };
      var err = null;
      helpers.finish(cb,err);
    });

    it("should finish, if a callback is not passed to the function", function(done){
      var cb  = undefined
        , err = null;
      helpers.finish(cb,err);
      done();
      // What does this actually test?
    });

  });

  describe("#wrapError", function(){

    it("should return the error if the error is not null", function(done){

      var err,cb,next;
      cb    = function(error){
        assert.equal(error, err);
        done();
      };
      next  = function(){};
      err   = "Something went wrong";
      helpers.wrapError(err,cb,next);
    });

    it("should execute the next function if the error is null", function(done){
      var err,cb,next;
      cb    = function(error){};
      next  = function(){
        done();
      };
      err   = null;
      helpers.wrapError(err,cb,next);
    });

  });

  describe("#parseCookie", function(){

    it("should get the value of a cookie from the socket, from a LP connection", function(done){

      var mockSocket = {
        request: {
          headers: {
            cookie: "io=zcKXnzpqgaCdOn1oAAAA; __utma=79318037.648842808.1352120656.1361279916.1361285341.56; __utmc=79318037; __utmz=79318037.1352120656.1.1.utmcsr=(direct)|utmccn=(direct)|utmcmd=(none); connect.sid=oB2jK5SrJynMymmulC7shDxQ.SR2tfe50YoqzaRPL8BTQ6PEqYmG4uMxij0f6yRpgIwUoB2jK5SrJynMymmulC7shDxQ.SR2tfe50YoqzaRPL8BTQ6PEqYmG4uMxij0f6yRpgIwU"
          }
        },
        transport: {}
      };

      helpers.parseCookie(mockSocket, 'io', function(err, cookieValue){
        assert.equal(err, null);
        assert.equal(cookieValue, 'zcKXnzpqgaCdOn1oAAAA');
        done();
      });

    });

    it("should get the value of a cookie from the socket, from a WS connection", function(done){

      var mockSocket = {
        transport: {
          socket: {
            upgradeReq: {
              headers: {
                cookie: "io=zcKXnzpqgaCdOn1oAAAA; __utma=79318037.648842808.1352120656.1361279916.1361285341.56; __utmc=79318037; __utmz=79318037.1352120656.1.1.utmcsr=(direct)|utmccn=(direct)|utmcmd=(none); connect.sid=oB2jK5SrJynMymmulC7shDxQ.SR2tfe50YoqzaRPL8BTQ6PEqYmG4uMxij0f6yRpgIwUoB2jK5SrJynMymmulC7shDxQ.SR2tfe50YoqzaRPL8BTQ6PEqYmG4uMxij0f6yRpgIwU"
              }
            }
          }
        }
      };

      helpers.parseCookie(mockSocket, 'io', function(err, cookieValue){
        assert.equal(err, null);
        assert.equal(cookieValue, 'zcKXnzpqgaCdOn1oAAAA');
        done();
      });

    });

  });

});