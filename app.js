'use strict';

const { existsSync, readFileSync, statSync } = require('fs');
const Response = require('./lib/response');
const CONTENT_TYPES = require('./lib/mimeTypes');

const STATIC_FOLDER = `${__dirname}/public`;

const serveStaticFile = req => {
  const [, extension] = req.url.match(/.*\.(.*)$/) || [];
  const contentType = CONTENT_TYPES[extension];
  const content = readFileSync(req.url);
  const res = new Response();
  res.setHeader('Content-Type', contentType);
  res.setHeader('Content-Length', content.length);
  res.statusCode = 200;
  res.body = content;
  return res;
};

const serveBadRequestPage = req => {
  const content = `<html>
    <head><title>Cookies Trial</title></head>
    <body>
      <p>File Not Found</p>
    </body>
  </html>`;
  const res = new Response();
  res.setHeader('Content-Type', CONTENT_TYPES.html);
  res.setHeader('Content-Length', content.length);
  res.body = content;
  return res;
};

const findHandler = req => {
  let path = `${STATIC_FOLDER}${req.url}`;
  if (req.url == '/') path = `${STATIC_FOLDER}/index.html`;
  req.url = path;
  const stat = existsSync(req.url) && statSync(req.url);
  if (req.method === 'GET' && stat && stat.isFile()) return serveStaticFile;
  return serveBadRequestPage;
};

const processRequest = req => {
  const handler = findHandler(req);
  return handler(req);
};

module.exports = { processRequest };
