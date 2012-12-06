// The common collection of helper functions

// Handles conditional callbacks
//
exports.finish = function (cb,err){
  if (typeof cb === "function") cb(err);
}

// Handles errors
//
exports.wrapError = function (err, cb, next) {
  err != null ? cb(err) : next();
}