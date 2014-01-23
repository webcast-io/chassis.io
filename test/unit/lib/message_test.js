'use strict';



// Dependencies
//
var assert  = require('assert'),
    chassis = require('../../../index');



chassis.loadLibraries();



// NOTE - Message encode/decode is basically a wrapper around
// JSON.stringify and JSON.parse. In the future, we may change
// to using a more efficient encoder/decoder, so we have the 
// tests in place just in case we switch JSON out for something
// else.
//
describe('Message', function () {
  
  describe('#encode', function () {

    it('should convert the JSON payload into a string-based form for WebSocket transmission', function (done) {
      var cargo = {name: 'Paul'};
      chassis.message.encode(cargo, function(err, rocket){
        assert.deepEqual(rocket, JSON.stringify(cargo));
        done();
      });
    });

  });

  describe('#decode', function(){

    it('should convert the string-based message into a JSON payload', function (done) {
      var rocket = JSON.stringify({name: 'Paul'});
      chassis.message.decode(rocket, function(err, cargo){
        assert.deepEqual(cargo, JSON.parse(rocket));
        done();
      });
    });

  });
  
});