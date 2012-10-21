module.exports = function(cookie, sessionKey, cb) {
  var error       = null;
  var sessionId   = null;
  var cookieVars  = cookie.split("; ");

  for (var i=0; i<cookieVars.length;i++) {
    if (cookieVars[i].match(sessionKey) != null) {
      sessionId = cookieVars[i].split(sessionKey+'=')[1];
    }
  }

  if (sessionId == null) {
    error = "cookie session not found for session key: " + sessionKey;
  }
  cb(error, sessionId);
}