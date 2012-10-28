var commands = {}
  , message  = require("./message");

module.exports = {

  addCommand: function(command, funktion) {
    commands[command] = funktion;
  },

  executeCommand: function(cargo, socket) {
    var res = commands[cargo.command](cargo.data, function(res){
      message.encode({rfcUid: cargo.rfcUid, res:res}, function(err, rocket){
        socket.send(rocket);
      });
    });
  }

};