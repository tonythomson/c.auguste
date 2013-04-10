// var pg = require('pg');

exports.serveIndex = function(req, res) {
  res.send('Welcome to C.Auguste, an API prototype. See www.github.com/tonythomson/c.auguste for info.', 200);
};