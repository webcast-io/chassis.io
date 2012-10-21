// Dependencies
var engine          = require('engine.io')
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
        message.decode(rocket, function(err, unpackedRocket){
          switch(unpackedRocket.action) {
            case 'subscribe': 
              pubsub.subscribe(unpackedRocket.channel, socket.id);
              break;
            case 'unsubscribe':
              pubsub.unsubscribe(unpackedRocket.channel, socket.id);
              break;
            case 'publish':
              pubsub.publish(unpackedRocket.channel, unpackedRocket.data);
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
  , message         : message
  , pool            : pool  
  , pubsub          : pubsub
};