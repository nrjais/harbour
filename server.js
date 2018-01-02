const HttpRouter = require('./httpRouter');
const TunnelServer = require('./tunnelServer');

const PORT = process.env.PORT || 3000;

let tunnelServer = new TunnelServer(); 

let httpRouter = new HttpRouter(tunnelServer);
httpRouter.createServer();

tunnelServer.start(httpRouter.getServer(), PORT);
httpRouter.startServer(PORT);