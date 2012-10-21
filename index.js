// Dependencies
var engine          = require('engine.io')
  , sessionManager  = require('./lib/sessionManager')
  , socketManager   = require('./lib/socketManager')
  , parseCookie     = require('./lib/parseCookie')
  , pubsub          = require('./lib/pubsub');

// Make the libraries available 
module.exports = {
    engine          : engine
  , sessionManager  : sessionManager
  , socketManager   : socketManager  
  , parseCookie     : parseCookie
  , pubsub          : pubsub
};