'use strict';

const { Server } = require('http');
const { processRequest } = require('./app');

const main = (port = 7000) => {
  const server = new Server(processRequest);
  server.listen(port, () => console.log(`started listening: ${port}`));
};

main(process.argv[2]);
