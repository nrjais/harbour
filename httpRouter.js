const http = require('http');

const HttpRouter = function (tunnelServer) {
  this.server = undefined;
  this.tunnelServer = tunnelServer;
};

HttpRouter.prototype.createServer = function () {
  this.server = http.createServer((req, res) => {
    this.tunnelServer.createNewConnection((client) => {
      this.requestRouter(client, req, res);
    });
  });
}

HttpRouter.prototype.startServer = function (port) {
  this.server.listen(port);
  console.log(`listening on ${port}`);
}

HttpRouter.prototype.getServer = function () {
  return this.server;
}

HttpRouter.prototype.requestRouter = function (tunnel, req, res) {
  sendToTunnel(tunnel, req.url);
  sendToTunnel(tunnel, req.method);
  sendToTunnel(tunnel, JSON.stringify(req.headers));
  sendStreamDataToTunnel(req, tunnel);

  let responders = [sendHeaders, writeDataToResponse];
  let currentResponder = setStatusCode;

  tunnel.on('message', function (message) {
    currentResponder(res, message);
  });

  tunnel.on('ping', function () {
    currentResponder = responders.shift();
    if (!currentResponder) {
      res.end();
    };
  });
}

const sendStreamDataToTunnel = function (req, tunnel) {
  req.on('data', (data) => {
    tunnel.send(data);
  });
  req.on('end', () => {
    tunnel.ping();
  });
}

const sendToTunnel = (tunnel, data) => {
  tunnel.send(data);
  tunnel.ping();
}

const writeDataToResponse = (res, data) => {
  res.write(data);
}

const setStatusCode = (res, data) => {
  res.statusCode = data;
}

const sendHeaders = (res, headers) => {
  res.writeHead(res.statusCode, JSON.parse(headers));
};

module.exports = HttpRouter;