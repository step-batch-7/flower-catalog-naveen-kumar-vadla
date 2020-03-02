'use strict';

const app = require('./lib/app');

const defaultPort = 7000;
const port = process.env.PORT || defaultPort;

const main = port => {
  app.listen(port, () => process.stderr.write(`started listening: ${port}`));
};

main(port);
