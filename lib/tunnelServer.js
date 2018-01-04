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
    this.verifyHandshake(client);
    return;
  }
  this.client = client;
  console.log('client connected');
  client.on('disconnect', () => {
    console.log('client disconnected');
    this.client = undefined;
  });
};

let activeConnections = {};

TunnelServer.prototype.verifyHandshake = function (client) {
  client.on('handshake', stamp => {
    if (activeConnections[stamp])
      activeConnections[stamp](client);
    client.on('disconnect', () => delete activeConnections[stamp]);
  });
}

TunnelServer.prototype.createNewConnection = function (onConnection, onError) {
  let id =`${Math.floor(Math.random() * 100)}${new Date().getTime()}`;
  activeConnections[id] = onConnection;
  if(!this.client){
    onError('No connection to server');
    return;
  }
  this.client.emit('handshake', `${id}`);
};

module.exports = TunnelServer;