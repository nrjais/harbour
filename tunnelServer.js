let SocketServer = require('ws').Server;

const TunnelServer = function () {
  this.client = undefined;
  this.server = undefined;
}

TunnelServer.prototype.start = function (server, port) {
  this.server = new SocketServer({ server });
  this.server.on('connection', client => this.handleClient(client));
};

TunnelServer.prototype.handleClient = function (client) {
  this.client = this.client || client;
  console.log('client connected');
  client.on('close', () => {
    console.log('client disconnected');
    this.client = undefined;
  });
};

let connectionReq = {};

TunnelServer.prototype.createNewConnection = function (onConnection) {
  let stamp = new Date().getTime();
  connectionReq[stamp] = onConnection;
  this.client.ping(`${stamp}`);
  this.handleClient = client => {
    client.on('ping', stamp => {
      if (connectionReq[stamp])
        connectionReq[stamp](client);
    });
  };
};

module.exports = TunnelServer;