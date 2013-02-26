var assert  = require('assert')
  , chassis = require('../../../index');

describe("rfc", function(){

  describe("#addCommand", function(){

    it("should store a command locally for future reference", function(done){
      var executed = false;
      var commando = function(data, cb){ // one of the best Arnie films ever!
        executed = true;
      };

      chassis.rfc.addCommand('getFilm', commando);
      chassis.rfc.getCommands(function(err, commands){
        assert.equal(commands['getFilm'],commando);
        done();
      });
    });

  });



  describe("#executeCommand", function(){

    it("should call a stored command", function(done){

      var executed = false;
      var received = false;
      var commando = function(data, cb){
        executed = true;
        cb(data);
      };

      var cargo = {
        command: 'getFilm',
        data:    {'year':1985, 'genre':'action'},
        rfcUid:  '1292831293'
      };

      var mockSocket = {
        send: function(data){
          received = true;
        }
      }

      chassis.rfc.addCommand('getFilm', commando);
      chassis.rfc.executeCommand(cargo, mockSocket);

      assert(executed);
      assert(received);
      done();

    });

    it("should make the socket send the result of the command's callback", function(done){

      var theData  = null;
      var commando = function(data, cb){
        cb(data);
      };

      var cargo = {
        command: 'getFilm',
        data:    {'year':1985, 'genre':'action'},
        rfcUid:  '1292831293'
      };

      var mockSocket = {
        send: function(data){
          theData  = data;
        }
      }

      chassis.rfc.addCommand('getFilm', commando);
      chassis.rfc.executeCommand(cargo, mockSocket);
      assert.deepEqual(JSON.parse(theData).rfcUid, '1292831293');
      assert.deepEqual(JSON.parse(theData).res.year, 1985);
      assert.deepEqual(JSON.parse(theData).res.genre, 'action');        
      done();

    });

  });

});