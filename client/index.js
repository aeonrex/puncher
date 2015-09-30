"use strict";

var net = require('net');
var http = require('./http');

var client = new net.Socket();

client.setKeepAlive(true);

client.on('data', function (data) {
  console.log(data.toString());
});


client.connect({
  port: 80,//13337,
  host: 'puncher.herokuapp.com'//'127.0.0.1'
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

