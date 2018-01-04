const http = require('http');
const TunnelServer = require('./tunnelServer');

const HttpRouter = function () {
  this.tunnelServer = new TunnelServer();
};

HttpRouter.prototype.createServer = function (httpServer) {
  let resHandler =  (req, res) => {
    this.tunnelServer.createNewConnection((client) => {
      this.requestRouter(client, req, res);
    }, (err) => {
      this.sendErrorResponse(req, res, err);
    });
  };
  this.tunnelServer.start(httpServer);
  return resHandler;
}

HttpRouter.prototype.sendErrorResponse = function (req, res, err) {
  res.statusCode = 404;
  res.write(err);
  res.end();
}

HttpRouter.prototype.requestRouter = function (tunnel, req, res) {
  tunnel.emit('url', req.url);
  tunnel.emit('method', req.method);
  tunnel.emit('headers', JSON.stringify(req.headers));
  sendStreamDataToTunnel(req, tunnel);

  let bindArgsTo = (fun, ...arg) => fun.bind(null, ...arg);

  tunnel.on('statusCode', bindArgsTo(setStatusCode, res));
  tunnel.on('headers', bindArgsTo(sendHeaders, res));
  tunnel.on('data', bindArgsTo(writeDataToResponse, res));
  tunnel.on('end', () => res.end());
  tunnel.on('end', () => tunnel.disconnect(true));
}

const sendStreamDataToTunnel = function (req, tunnel) {
  req.on('data', (data) => {
    tunnel.emit('data', data);
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