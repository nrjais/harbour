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
  tunnel.emit('url', req.url);
  tunnel.emit('method', req.method);
  tunnel.emit('headers', JSON.stringify(req.headers));
  sendStreamDataToTunnel(req, tunnel);

  let bindArgsTo = (fun, ...arg) => fun.bind(null, ...arg);

  tunnel.on('statusCode', bindArgTo(setStatusCode, res));
  tunnel.on('headers', bindArgTo(sendHeaders, res));
  tunnel.on('data', bindArgTo(writeDataToResponse, res));
  tunnel.on('end', ()=>res.end());
  tunnel.on('end', ()=>tunnel.disconnect(true));
}

const sendStreamDataToTunnel = function (req, tunnel) {
  req.on('data', (data) => {
    tunnel.emit('data',data);
  });
  req.on('end', () => {
    tunnel.emit('end');
  });
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