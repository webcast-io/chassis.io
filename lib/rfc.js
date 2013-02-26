var commands = {}

module.exports = function(chassis){

  chassis.rfc = {

    addCommand: function(command, funktion) {
      commands[command] = funktion;
    },

    getCommands: function(cb){
      var err = null;
      cb(err, commands);
    },

    executeCommand: function(cargo, socket) {
      var res = commands[cargo.command](cargo.data, function(res){
        chassis.message.encode({rfcUid: cargo.rfcUid, res:res}, function(err, rocket){
          socket.send(rocket);
        });
      });
    }

  }

};