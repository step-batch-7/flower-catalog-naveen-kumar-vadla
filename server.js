'use strict';

const fs = require('fs');

const app = require('./lib/app');

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
  app.listen(port, () => process.stderr.write(`started listening: ${port}`));
};

main(port);
