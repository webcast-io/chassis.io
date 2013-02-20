module.exports = function(chassis){
  chassis.eventHandler = new require('events').EventEmitter;
};