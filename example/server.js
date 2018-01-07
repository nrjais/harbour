//This is a expample server

const TunnelServer = require('harbour-server');
const http = require('http');

let PORT = 3000;

let server = http.createServer(function (req, res) {
  requestRouter(req, res);
});

let tunnel = new TunnelServer();
let requestRouter = tunnel.createRouter(server);

server.listen(PORT);
console.log(`listening on PORT ${PORT}`);