// The common collection of helper functions

// Handles conditional callbacks
//
exports.finish = function (cb,err) {
  if (typeof cb === "function") cb(err);
}

// Handles errors
//
exports.wrapError = function (err, cb, next) {
  err != null ? cb(err) : next();
}

// Parses cookies stored in the socket
//
exports.parseCookie = function(socket, cookieName, cb) {
  var err = null;

  if (socket.transport.socket != undefined) {
    var cookie = socket.transport.socket.upgradeReq.headers.cookie;
  } else {
    var cookie = socket.request.headers.cookie;
  }
  var cookieValue = cookie.split(cookieName+'=')[1].split(';')[0];
  cb(err, cookieValue);
}