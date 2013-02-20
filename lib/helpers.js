module.exports = function(chassis){

  chassis.helpers = {

    // Handles conditional callbacks
    finish: function (cb,err){
      if (typeof cb === "function") cb(err);
    },

    // Handles errors
    wrapError: function (err, cb, next) {
      err != null ? cb(err) : next();
    }
  }

};