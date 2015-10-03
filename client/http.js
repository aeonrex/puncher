"use strict";
var log = require('util').log;
var express = require('express');
var app = express();

app.get('/', function (req, res) {
  res.send('FUCK YEAH!');
});

app.on('error', function (err) {
    log('An error occurred');
    log(err);
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
