"use strict";

var net = require('net');
var log = require('util').log;
var port = process.env.PORT || 13337;

// var server = net.createServer(function (sock) {
//   //let address = conn.address();
//   log('CONNECTED: ' + sock.remoteAddress + ':' + sock.remotePort);
//
//   log(sock.address());
//   log(server.address());
//
//   sock.write(sock.remoteAddress + ':' + sock.remotePort);
//
//
//   sock.on('close', function () {
//     log('Disconnecting from ' + sock.remoteAddress + ':' + sock.remotePort);
//   });
//
//   sock.on('data', function (data) {
//     log(sock.remoteAddress + ':' + sock.remotePort + ' says: ' + data.toString());
//   });
//
//   sock.on('error', function (err) {
//     log('An error occurred: ' + err);
//   });
//
// });
//
// log(port);
//
// server.listen(port, '0.0.0.0');


var udp = require('dgram');
var server = udp.createSocket('udp4');

server.on('listening', function () {
  var address = server.address();
  console.log('# listening [%s:%s]', address.address, address.port);
});

server.on('message', function (data, rinfo) {
  try {
   data = JSON.parse(data);
 } catch (e) {
   return console.log('! Couldn\'t parse data (%s):\n%s', e, data);
 }
  console.log('# Client registered: %s@[%s:%s | %s:%s]', data.name,
                rinfo.address, rinfo.port, data.linfo.address, data.linfo.port);
  send(rinfo.address, rinfo.port, {
    client: rinfo.address,
    port: rinfo.port
  });
});

var send = function(host, port, msg, cb) {
  var data = new Buffer(JSON.stringify(msg));
  server.send(data, 0, data.length, port, host, function(err, bytes) {
    if (err) {
      server.close();
      console.log('# stopped due to error: %s', err);
    } else {
      console.log('# sent '+msg.client);
      if (cb) cb();
    }
  });
};

server.bind(port);
