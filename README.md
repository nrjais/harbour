# Harbour-Server

This is a tunnel server that can be used to route the __http__ requests to your localhost server using [__harbour-client__](https://github.com/nrjais/harbour-client) that will be running on your local machine.

## Installation
__`$ npm install harbour-server --save`__

## Usage

#### Server-Side
This needs to run on public domain server.
```` javascript
const Harbour = require('harbour-server');
const http = require('http');

const PORT = 80;

const server = http.createServer(function (req, res) {
  /**
   * this function can be called whenever the request
   * is needed to be transferred to the server running on your
   * local machine.
  */
  requestRouter(req, res);
});

const harbour = new Harbour();
const requestRouter = harbour.createRouter(server);

server.listen(PORT);
console.log(`listening on PORT ${PORT}`);
````

#### Local Machine
To route all your requests to localhost a client is needed that can be installed by

__`$ npm install -g harbour-client`__

After installing run this command on command-line.

`$ harbour www.example.com localhost-port`

localhost-port is the on which the local server is running.

###### Example
__`$ harbour www.example.com 8000`__

Now all http requests coming to __`www.example.com`__ will be routed to __`localhost:8000`__
