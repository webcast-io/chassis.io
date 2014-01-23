'use strict';


var EventEmitter = require('events').EventEmitter;

module.exports = function(chassis){
  chassis.eventHandler = new EventEmitter();
};