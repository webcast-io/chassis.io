var assert  = require('assert')
  , chassis = require('../../../index');

chassis.loadLibraries();

describe("Helpers", function(){  

  describe("#finish", function(){

    it("should execute the callback, if a callback is passed to the function", function(done){
      // If cb isn't executed, this test will fail.
      var cb  = function(){
        done();
      };
      var err = null;

      chassis.helpers.finish(cb,err);
    });

    it("should finish, if a callback is not passed to the function", function(done){
      var cb  = undefined
        , err = null;
      chassis.helpers.finish(cb,err);
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
      chassis.helpers.wrapError(err,cb,next);
    });

    it("should execute the next function if the error is null", function(done){
      var err,cb,next;
      cb    = function(error){};
      next  = function(){
        done();
      };
      err   = null;
      chassis.helpers.wrapError(err,cb,next);
    });

  });

});