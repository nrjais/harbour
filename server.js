//This is a expample server

const TunnelServer = require('./index.js');
const http = require('http');

let PORT = 3000;

let server = http.createServer(function (req, res) {
  requestRouter(req, res);
});

let tunnel = new TunnelServer();
let requestRouter = tunnel.createServer(server);

server.listen(PORT);
console.log(`listening on PORT ${PORT}`);