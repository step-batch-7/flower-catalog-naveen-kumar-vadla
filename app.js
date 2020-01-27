'use strict';

const { existsSync, readFileSync, statSync, writeFileSync } = require('fs');
const { loadTemplate } = require('./lib/viewTemplate');
const Response = require('./lib/response');
const CONTENT_TYPES = require('./lib/mimeTypes');

const STATIC_FOLDER = `${__dirname}/public`;
const COMMENTS_PATH = `${__dirname}/data/comments.json`;

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

const serveStaticFile = req => {
  let path = `${STATIC_FOLDER}${req.url}`;
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

const loadComments = function() {
  if (existsSync(COMMENTS_PATH)) return JSON.parse(readFileSync(COMMENTS_PATH));
  return [];
};

const generateCommentsHtml = (commentsHtml, commentDetails) => {
  const { date, name, comment } = commentDetails;
  const html = `<tr>
    <td>${date}</td>
    <td>${name}</td>
    <td>${comment}</td>
  </tr>`;
  return html + commentsHtml;
};

const serveGuestBookPage = function(req) {
  const comments = loadComments();
  const commentsHtml = comments.reduce(generateCommentsHtml, '');
  const html = loadTemplate('GuestBook.html', { COMMENTS: commentsHtml });
  const res = new Response();
  res.setHeader('Content-Type', CONTENT_TYPES.html);
  res.setHeader('Content-Length', html.length);
  res.statusCode = 200;
  res.body = html;
  return res;
};

const registerCommentAndRedirect = req => {
  const comments = loadComments();
  const date = new Date().toGMTString();
  const { name, comment } = req.body;
  comments.push({ date, name, comment });
  writeFileSync(COMMENTS_PATH, JSON.stringify(comments), 'utf8');
  const res = new Response();
  res.setHeader('Location', '/GuestBook.html');
  res.setHeader('Content-Length', 0);
  res.statusCode = 301;
  return res;
};

const serveHomePage = req => {
  req.url = '/index.html';
  return serveStaticFile(req);
};

const findHandler = req => {
  if (req.method === 'GET' && req.url === '/') return serveHomePage;
  if (req.method === 'POST' && req.url === '/registerComment') return registerCommentAndRedirect;
  if (req.method === 'GET' && req.url === '/GuestBook.html') return serveGuestBookPage;
  if (req.method === 'GET') return serveStaticFile;
  return serveBadRequestPage;
};

const processRequest = req => {
  const handler = findHandler(req);
  return handler(req);
};

module.exports = { processRequest };
