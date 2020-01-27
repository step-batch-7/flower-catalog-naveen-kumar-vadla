'use strict';

const { existsSync, readFileSync, statSync } = require('fs');
const { loadTemplate } = require('./lib/viewTemplate');
const Response = require('./lib/response');
const CONTENT_TYPES = require('./lib/mimeTypes');

const STATIC_FOLDER = `${__dirname}/public`;

const serveStaticFile = (req, optionUrl) => {
  let path = `${STATIC_FOLDER}${optionUrl || req.url}`;
  const stat = existsSync(path) && statSync(path);
  if (!stat || !stat.isFile()) return serveBadRequestPage();
  const [, extension] = path.match(/.*\.(.*)$/) || [];
  const contentType = CONTENT_TYPES[extension];
  const content = readFileSync(path);
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

const serveHomePage = req => {
  return serveStaticFile(req, '/index.html');
};

const serveGuestBookPage = function(req) {
  const html = loadTemplate('guestBook.html', {});
  const res = new Response();
  res.setHeader('Content-Type', CONTENT_TYPES.html);
  res.setHeader('Content-Length', html.length);
  res.statusCode = 200;
  res.body = html;
  return res;
};

const findHandler = req => {
  if (req.method === 'GET' && req.url === '/') return serveHomePage;
  if (req.method === 'GET' && req.url === '/GuestBook.html') return serveGuestBookPage;
  if (req.method === 'GET') return serveStaticFile;
  return serveBadRequestPage;
};

const processRequest = req => {
  const handler = findHandler(req);
  return handler(req);
};

module.exports = { processRequest };
