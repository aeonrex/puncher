"use strict";

var express = require('express');
var app = express();

app.get('/', function (req, res) {
  res.send('FUCK YEAH!');
});

module.exports.bootstrap = function (options, cb) {
  var port = options.port;

  if (!port) {
    return cb(new Error('Invalid port exception.'));
  }
  try {
    app.listen(port, cb);
  } catch (e) {
    cb(e);
  }
};
