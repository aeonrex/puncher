// "use strict";
var http = require('./http');
var log = require('util').log;
var dgram = require('dgram');
var net = require('net');

var httpRequest = function (remote, linfo) {

  var client = new net.Socket();

  client.setKeepAlive(true);

  client.on('data', function (data) {
    log(data.toString());
  });

  client.on('error', function (err) {
    log(err);
  });

  client.connect({
    port: remote.port,
    host: remote.address,
    localAddress: linfo.address, // 127.0.0.1 for mac, linux likes 0.0.0.0 - need to try 'localhost'
    localPort: linfo.port
  }, function () {
    log('Connected to server.');
    log(client.address());
    var address = client.address();

    var request = 'GET http://'+remote.host+':'+remote.port+'/ HTTP/1.1\r\n' +
    '\r\n\r\n';
    log(request);

    client.write(request);

  });

};



var clientName = process.argv[3];
var remoteName = process.argv[4];

var rendezvous = {
  address: process.argv[2],
  port: 6312
};

var client = {
  ack: false,
  connection: {}
};

var linfo = {};

var udpClient = dgram.createSocket('udp4');

var getNetworkIP = function(callback) {
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

  udpClient.send(data, 0, data.length, connection.port, connection.address, function(err, bytes) {
    if (err) {
      udpClient.close();
      log('# stopped due to error: %s', err);
    } else {
      log('# sent %s to %s:%s', msg.type, connection.address, connection.port);
      if (cb) cb();
    }
  });
};

var connect = function () {
  send(rendezvous, { type: 'connect', from: clientName, to: remoteName });
};

var keepAlive = function (endPoint) {
  var pid = setInterval(function () {
    send(endPoint, { type: 'keep-alive'});
  }, 60000);
};

udpClient.on("listening", function() {
  linfo = { port: udpClient.address().port };
  getNetworkIP(function(error, ip) {
    if (error) return log("! Unable to obtain connection information!");
    linfo.address = ip;
    log('# listening as %s@%s:%s', clientName, linfo.address, linfo.port);
    send(rendezvous, { type: 'register', name: clientName, linfo: linfo }, function () {
      if (remoteName) {
        send(rendezvous, { type: 'connect', from: clientName, to: remoteName });
      }
    //  keepAlive(rendezvous);
    });
  });
});

udpClient.on('message', function(data, rinfo) {
  try {
    data = JSON.parse(data);
  } catch (e) {
    log('! Couldn\'t parse data(%s):\n%s', e, data);
    return;
  }

  if (data.type == 'connection') {
    log('# connecting with %s@[%s:%s | %s:%s]', data.client.name,
      data.client.connections.local.address, data.client.connections.local.port, data.client.connections.public.address, data.client.connections.public.port);
    remoteName = data.client.name;
    var punch = { type: 'punch', from: clientName, to: remoteName };
    for (var con in data.client.connections) {
      doUntilAck(1000, function() {
        send(data.client.connections[con], punch);
      });
    }
  } else if (data.type == 'punch' && data.to == clientName) {
    var ack = { type: 'ack', from: clientName };
    log("# got punch, sending ACK");
    send(rinfo, ack);
  } else if (data.type == 'ack' && !client.ack) {
    client.ack = true;
    client.connection = rinfo;
    log("# got ACK, sending MSG");
    send(client.connection, {
      type: 'message',
      from: clientName,
      msg: 'Hello World, '+remoteName+'!'
    });

    setInterval(function () {
      send(client.connection, {
        type: 'message',
        from: clientName,
        msg: 'keep alive.'
      });
    }, 60000);

    http.bootstrap(linfo, function connected(err) {
        if (err) {
          return log(err);
        }
        log('aw yiss');
        setTimeout(function () {
          httpRequest(client.connection, linfo);
        }, 2000);
    });


  } else if (data.type == 'message') {
    log('> %s [from %s@%s:%s]', data.msg, data.from, rinfo.address, rinfo.port)
  }
});


var doUntilAck = function(interval, fn) {
  if (client.ack) return;
  fn();
  setTimeout(function() {
    doUntilAck(interval, fn);
  }, interval);
}

udpClient.bind();
