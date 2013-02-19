// Dependencies
var engine          = require('engine.io')
  , eventHandler    = require('./lib/eventHandler')
  , helpers         = require('./lib/helpers')
  , message         = require('./lib/message')
  , pool            = require('./lib/pool')
  , pubsub          = require('./lib/pubsub')
  , rfc             = require('./lib/rfc');

// This function binds engine.io to the http server,
// and hooks up pubsub and socket pool management.
var attach = function(server, options, cb) {

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

    var socketServer = engine.attach(server, options);

    // TODO - How do we specify the use of Redis PubSub?

    socketServer.on('connection', function (socket) {

      socket.on('message', function(rocket){
        message.decode(rocket, function(err, cargo){
          switch(cargo.action) {
            
            case 'set':
              socket.data = cargo.data;
              eventHandler.emit('set', socket.id, cargo.data);
              break;

            case 'subscribe':
              pubsub.subscribe(cargo.channel, socket.id);
              break;

            case 'unsubscribe':
              pubsub.unsubscribe(cargo.channel, socket.id);
              break;

            case 'publish':
              pubsub.publish(cargo.channel, socket.id, cargo.data, function(err){
                eventHandler.emit('publish', cargo.channel, socket.id, cargo.data);
              });
              break;

            case 'rfc':
              rfc.executeCommand(cargo, socket);
              break;
          }
        });
      });

      socket.on('close', function () {
        pool.removeSocket(socket.id);
        eventHandler.emit('close', socket.id);
      });

      pool.addSocket(socket);

    });

    // Standardise this to have a uniform format cb(err, thing) or cb(err);
    if (typeof cb === 'function') cb(socketServer);
}

// Make the libraries available 
module.exports = {
    attach          : attach
  , engine          : engine
  , eventHandler    : eventHandler
  , message         : message
  , pool            : pool  
  , pubsub          : pubsub
  , rfc             : rfc
};