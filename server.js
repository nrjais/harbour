const http = require('http');
const SocketServer = require('ws').Server;

const PORT = process.env.PORT || 3000;
let mainClient = "";

let noConnectionResponder = function (req, res) {
  res.end("no Connection found");
}

let reqTunneler = noConnectionResponder;

let realTunneler = function (req, res) {
  let headers = JSON.stringify(req.headers);
  let url = req.url;

  mainClient.ping();
  mainClient.send(url);
  mainClient.ping();
  mainClient.send(req.method);
  mainClient.ping();
  mainClient.send(headers);
  mainClient.ping();

  req.on('data', (data) => {
    mainClient.send(data);
  });
  req.on('end', () => {
    mainClient.ping();
    mainClient.send();
  });

  let data = (d) => {
    res.write(d);
  }

  let end = function () {
    res.end();
    console.log('ended Response');
  }

  let sendHeaders = (data) => {
    res.writeHead(200, JSON.parse(data));
  };

  let collecters = [sendHeaders, data, end];
  let state = 0;
  let currentCollector = sendHeaders;

  mainClient.on('message', function (message) {
    currentCollector(message);
  });
  mainClient.on('ping', function () {
    state %= collecters.length;
    currentCollector = collecters[state++];
  });
}

const server = http.createServer((req, res) => {
  // mainClient.ping();
  reqTunneler(req, res);
});

server.listen(PORT, () => console.log(`Listening on ${PORT}`));

const wss = new SocketServer({ server });

wss.on('connection', (ws) => {
  console.log('Client Connected');
  reqTunneler = realTunneler;
  mainClient = ws;
  ws.on('close', () => {
    mainClient = "";
    console.log('Client disconnected');
    reqTunneler = noConnectionResponder;
  });
});