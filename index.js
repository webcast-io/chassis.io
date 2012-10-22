// Dependencies
var engine          = require('engine.io')
  , eventHandler    = require('./lib/eventHandler')
  , message         = require('./lib/message')
  , pool            = require('./lib/pool')
  , pubsub          = require('./lib/pubsub/redis');

// This function binds engine.io to the http server,
// and hooks up pubsub and socket pool management.
var attach = function(server, cb) {
    var socketServer = engine.attach(server);

    // How do we specify the use of Redis PubSub?

    socketServer.on('connection', function (socket) {

      socket.on('message', function(rocket){
        message.decode(rocket, function(err, cargo){
          switch(cargo.action) {
            case 'subscribe':
              eventHandler.emit('subscribe', cargo.channel, socket.id, cargo.data);
              pubsub.subscribe(cargo.channel, socket.id);
              break;
            case 'unsubscribe':
              eventHandler.emit('unsubscribe', cargo.channel, socket.id, cargo.data);
              pubsub.unsubscribe(cargo.channel, socket.id);
              break;
            case 'publish':
              eventHandler.emit('publish', cargo.channel, socket.id, cargo.data);            
              pubsub.publish(cargo.channel, socket.id, cargo.data);
              break;
          }
        });
      });

      socket.on('close', function () {
        pool.removeSocket(socket.id);
      });

      pool.addSocket(socket);

    });

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
};