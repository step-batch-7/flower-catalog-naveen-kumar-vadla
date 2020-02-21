'use strict';

const fs = require('fs');

const { Server } = require('http');
const app = require('./handlers');

const defaultPort = 7000;
const port = process.env.PORT || defaultPort;

const setUpDataBase = function() {
  const DATA_PATH = `${__dirname}/data`;
  if (!fs.existsSync(DATA_PATH)) {
    fs.mkdirSync(DATA_PATH);
  }
};

const main = port => {
  setUpDataBase();
  const server = new Server(app.handleRequests.bind(app));
  server.listen(port, () => process.stderr.write(`started listening: ${port}`));
};

main(port);
