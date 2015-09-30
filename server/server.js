"use strict";

var net = require('net');
var log = require('util').log;
var port = process.env.PORT || 13337;

var server = net.createServer(function (sock) {
  //let address = conn.address();
  log('CONNECTED: ' + sock.remoteAddress + ':' + sock.remotePort);

  sock.write(sock.remoteAddress + ':' + sock.remotePort);

  sock.on('end', function () {
    log('Disconnecting from ' + sock.remoteAddress + ':' + sock.remotePort);
  });

  sock.on('data', function (data) {
    log(sock.remoteAddress + ':' + sock.remotePort + ' says: ' + data.toString());
  });

});

log(port);

server.listen(port);
