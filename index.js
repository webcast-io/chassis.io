// Dependencies
var engine          = require('engine.io')
  , eventHandler    = require('./lib/eventHandler')
  , message         = require('./lib/message')
  , pool            = require('./lib/pool')
  , pubsub          = require('./lib/pubsub');

// This function binds engine.io to the http server,
// and hooks up pubsub and socket pool management.
var attach = function(server, cb) {
    var socketServer = engine.attach(server);

    // How do we specify the use of Redis PubSub?

    socketServer.on('connection', function (socket) {

      socket.on('message', function(rocket){
        message.decode(rocket, function(err, cargo){
          switch(cargo.action) {
            case 'set':
              socket.data = cargo.data;
              eventHandler.emit('set', socket.id, cargo.data);
              break;

            case 'subscribe':
              // log the channel added to the socket
              pubsub.subscribe(cargo.channel, socket.id, function(err){
                // if (socket.channels == undefined) {
                //   socket.channels = [cargo.channel];
                // } else {
                //   socket.channels.push(cargo.channel);
                // }
                // eventHandler.emit('subscribe', cargo.channel, socket.id);
              });
              break;

            case 'unsubscribe':

              pubsub.unsubscribe(cargo.channel, socket.id, function(err){
                // if (socket.channels != undefined) {
                //   var index   = socket.channels.indexOf(cargo.channel);
                //   if (index != -1) {socket.channels.splice(index,1)};
                // };
                // eventHandler.emit('unsubscribe', cargo.channel, socket.id);
              });
              break;

            case 'publish':
              pubsub.publish(cargo.channel, socket.id, cargo.data, function(err){
                eventHandler.emit('publish', cargo.channel, socket.id, cargo.data);
              });
              break;
          }
        });
      });

      socket.on('close', function () {
        // TODO - remove socket from all of it's subscribed channels.
        // we need to be able to bind on the socket close event
        pool.removeSocket(socket.id);
        eventHandler.emit('close', socket.id);
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