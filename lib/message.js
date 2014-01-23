'use strict';


// This module handles the encoding and
// decoding of messages.
module.exports = function (chassis) {

  chassis.message = {

    encode: function (data, cb) {
      var error       = null;
      var encodedData = JSON.stringify(data);
      cb(error,encodedData);
    },

    decode: function(data, cb) {
      var error       = null;
      var decodedData = JSON.parse(data);
      cb(error, decodedData);
    }

  };
  
};