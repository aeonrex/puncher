"use strict";
var log = require('util').log;
var express = require('express');
var http = require('http');
var net = require('net');
var httpChoice = process.env.HTTP || 'express';

var _connectWithExpress = function (options, cb) {
  var app = express();

  app.get('/', function (req, res) {
    res.send('FUCK YEAH!');
  });

  app.on('error', function (err) {
    log('An error occurred');
    log(err);
  });

  var port = options.port;

  if (!port) {
    return cb(new Error('Invalid port exception.'));
  }
  try {
    app.listen(port, '0.0.0.0', cb);
  } catch (e) {
    cb(e);
  }
};

var _connectWithHttp = function (options, cb) {

  var server = http.createServer(function (request, response) {
    response.writeHead(200, {"Content-Type": "text/plain"});
    response.end("FUCK YEAH!\n");
  });

  server.listen(options.port);

  cb();
};

var _basic = function (options, cb) {
  var server = net.createServer(function (sock) {
    //let address = conn.address();
    log('Client-server setup: ' + sock.remoteAddress + ':' + sock.remotePort);

    sock.on('data', function (data) {

    });
  });

  server.listen(options.port, function () {
    log('listening on port ' + options.port);
  });
};

process.on('uncaughtException', function(err) {
  if(err.errno === 'EADDRINUSE') {
    console.log(err);
  }
  else  {
    console.log(err);
    process.exit(1);
  }
});

module.exports.bootstrap = function (options, cb) {
  var factory = undefined;

  switch (httpChoice.toUpperCase()) {
    case 'HTTP':
      factory = _connectWithHttp;
      break;
    case 'BASIC':
      factory = _basic;
      break;
    case 'EXPRESS':
    default:
    factory = _connectWithExpress;
    break;
  }
  factory(options, cb);
};
