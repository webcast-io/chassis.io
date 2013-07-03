var chassis = {};

chassis.loadLibraries = function(){

  require('./lib/eventHandler')(chassis);
  require('./lib/helpers')(chassis);
  require('./lib/message')(chassis);
  require('./lib/pool')(chassis);
  require('./lib/pubsub')(chassis);
  require('./lib/rfc')(chassis);
  require('./lib/session')(chassis);
};

// This function binds engine.io to the http server,
// and hooks up pubsub and socket pool management.
chassis.attach = function(server, options, cb) {

    chassis.options = options || {};

    // set a cookie option if one is not passed
    if (options.server == undefined) {
      options.server = {
        cookie: 'io'
      };
    } else {
      if (options.server.cookie == undefined) {
        options.server.cookie = 'io';
      }
    }

    chassis.engine = require('engine.io');

    chassis.loadLibraries();

    var socketServer = chassis.engine.attach(server, chassis.options);

    socketServer.on('connection', function (socket) {

      socket.on('message', function(rocket){
        chassis.message.decode(rocket, function(err, cargo){
          switch(cargo.action) {
            
            case 'set':
              socket.data = cargo.data;
              chassis.eventHandler.emit('set', socket.id, cargo.data);
              break;

            case 'subscribe':
              chassis.pubsub.subscribe(cargo.channel, socket.id);
              break;

            case 'unsubscribe':
              chassis.pubsub.unsubscribe(cargo.channel, socket.id);
              break;

            case 'publish':
              chassis.pubsub.publish(cargo.channel, socket.id, cargo.data, function(err){
                chassis.eventHandler.emit('publish', cargo.channel, socket.id, cargo.data);
              });
              break;

            case 'rfc':
              chassis.rfc.executeCommand(cargo, socket);
              break;
          }
        });
      });

      socket.on('close', function () {
        chassis.pool.removeSocket(socket.id);
        chassis.eventHandler.emit('close', socket.id);
      });

      chassis.pool.addSocket(socket);

    });

    // Standardise this to have a uniform format cb(err, thing) or cb(err);
    if (typeof cb === 'function') cb(socketServer);
}

// Make the libraries available 
module.exports = chassis;