"use strict";

var net = require('net');
var log = require('util').log;

var server = net.createServer(function (sock) {
  //let address = conn.address();
  log('CONNECTED: ' + sock.remoteAddress + ':' + sock.remotePort);

  sock.on('end', function () {
    log('Disconnecting from ' + sock.remoteAddress + ':' + sock.remotePort);
  });

});

server.listen(process.env.PORT || 13337);
