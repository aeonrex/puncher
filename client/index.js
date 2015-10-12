"use strict";

var net = require('net');
var http = require('./http');
var host = process.env.HOST || '127.0.0.1';
var port = process.env.PORT || 13337;
var localAddress = '127.0.0.1';

var client = new net.Socket();

client.setKeepAlive(true);

client.on('data', function (data) {
  console.log(data.toString());
});


client.connect({
  port: port,
  host: host,
  localAddress: localAddress
}, function () {
  console.log('Connected to server.');
  console.log(client.address());
  var address = client.address();

  http.bootstrap(address, function connected(err) {
    if (err) {
      return console.log(err);
    }
    console.log('aw yiss');
    client.write('Come on and connect');
  });
});
