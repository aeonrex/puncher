"use strict";

var net = require('net');
var http = require('./http');
var host = process.env.HOST || '127.0.0.1';
var port = process.env.PORT || 13337;
var clientName = process.env.CLIENT_NAME || 'client1';
var localAddress = '0.0.0.0' || '127.0.0.1';

// var client = new net.Socket();
//
// client.setKeepAlive(true);
//
// client.on('data', function (data) {
//   console.log(data.toString());
// });
//
//
// client.connect({
//   port: port,
//   host: host,
// //  localAddress: localAddress, // 127.0.0.1 for mac, linux likes 0.0.0.0 - need to try 'localhost'
//
// }, function () {
//   console.log('Connected to server.');
//   console.log(client.address());
//   var address = client.address();
//
//   http.bootstrap(address, function connected(err) {
//     if (err) {
//       return console.log(err);
//     }
//     console.log('aw yiss');
//     client.write('Come on and connect');
//   });
// });
var udp = require('dgram');
var client = udp.createSocket('udp4');

var getNetworkIP = function (callback) {
  var socket = net.createConnection(80, 'www.google.com');
  socket.on('connect', function() {
    callback(undefined, socket.address().address);
      socket.end();
  });
  socket.on('error', function(e) {
    callback(e, 'error');
  });
};

var send = function (connection, msg, cb) {
  var data = new Buffer(JSON.stringify(msg));

  client.send(data, 0, data.length, connection.port, connection.address,
    function(err, bytes) {
    if (err) {
      client.close();
      console.log('# stopped due to error: %s', err);
    } else {
      console.log('# sent %s to %s:%s', msg.type, connection.address, connection.port);
      if (cb) cb();
    }
  });
};

client.on('listening', function () {
  var linfo = { port: client.address().port };
  getNetworkIP(function(error, ip) {
    if (error) {
      console.log(error);
      return console.log("! Unable to obtain connection information!");
    }
    linfo.address = ip;
    console.log('# listening as %s@%s:%s', clientName, linfo.address, linfo.port);
    send({address: host, port: port}, {type: 'register', name: clientName, linfo: linfo});
    setInterval(function () {
      send({address: host, port: port}, {type: 'register', name: clientName, linfo: linfo});
    }, 2000);
  });
});

client.on('message', function (data, rinfo) {
  console.log('Message from %s:%s', rinfo.address, rinfo.port);
  console.log(data.toString());
  send(rinfo.address, rinfo.port, {
    msg: 'ping'
  });
});

client.bind();
