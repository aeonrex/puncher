"use strict";
var log = require('util').log;
var express = require('express');
var http = require('http');
var net = require('net');
var httpChoice = process.env.HTTP || 'express';
var wildCard = '::' || '0.0.0.0';

var _connectWithExpress = function (options, cb) {
  var app = express();

  app.get('/', function (req, res) {
    res.send('FUCK YEAH!');
  });

  app.on('error', function (err) {
    log('An error occurred');
    log(err);
  });

  var port = options.port
  var addr = options.address;

  if (!port) {
    return cb(new Error('Invalid port exception.'));
  }
  try {
    var server = app.listen(port, wildCard, function () {
      console.log(server.address().address);
      cb();
    });
  } catch (e) {
    cb(e);
  }
};

var _connectWithHttp = function (options, cb) {

  var server = http.createServer(function (request, response) {
    response.writeHead(200, {"Content-Type": "text/plain"});
    response.end("FUCK YEAH!\n");
  });

  server.listen(options.port, wildCard);

  cb();
};

var _basic = function (options, cb) {
  var server = net.createServer(function (sock) {
    //let address = conn.address();
    log('Client-server setup: ' + sock.remoteAddress + ':' + sock.remotePort);

    sock.on('data', function (data) {
        console.log(data.toString());
    });
  });

  server.listen(options.port, wildCard, function () {
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
