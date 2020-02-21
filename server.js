'use strict';

const { Server } = require('http');
const app = require('./handlers');

const defaultPort = 7000;
const port = process.env.PORT || defaultPort;

const main = (port) => {
  const server = new Server(app.handleRequests.bind(app));
  server.listen(port, () => process.stderr.write(`started listening: ${port}`));
};

main(port);
