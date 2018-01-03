let socketServer = require('socket.io');

const TunnelServer = function () {
  this.client = undefined;
  this.server = undefined;
}

TunnelServer.prototype.start = function (server, port) {
  this.server = socketServer(server);
  this.server.on('connect', client => this.handleClient(client));
};

TunnelServer.prototype.handleClient = function (client) {
  if (this.client) {
    this.handleHandshake(client);
    return;
  }
  this.client = client;
  console.log('client connected');
  client.on('close', () => {
    console.log('client disconnected');
    this.client = undefined;
  });
};

let connectionReq = {};

TunnelServer.prototype.handleHandshake = function (client) {
  client.on('handshake', stamp => {
    if (connectionReq[stamp])
      connectionReq[stamp](client);
  });
}

TunnelServer.prototype.createNewConnection = function (onConnection) {
  let stamp = new Date().getTime() + Math.floor(Math.random() * 100000);
  connectionReq[stamp] = onConnection;
  this.client.emit('handshake', `${stamp}`);
};

module.exports = TunnelServer;