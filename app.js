'use strict';

const { existsSync, readFileSync, statSync, writeFileSync } = require('fs');
const { loadTemplate } = require('./lib/viewTemplate');
const queryString = require('querystring');
const CONTENT_TYPES = require('./lib/mimeTypes');

const STATIC_FOLDER = `${__dirname}/public`;
const COMMENTS_PATH = `${__dirname}/data/comments.json`;

const serveNotFoundPage = (req, res) => {
  const content = `<html>
    <head><title>Not Found</title></head>
    <body>
      <p>404 File Not Found</p>
    </body>
  </html>`;
  res.setHeader('Content-Type', CONTENT_TYPES.html);
  res.setHeader('Content-Length', content.length);
  res.statusCode = 404;
  res.end(content);
};

const serveBadRequestPage = (req, res) => {
  const content = `<html>
    <head><title>Bad Request</title></head>
    <body>
      <p>400 Method not allowed</p>
    </body>
  </html>`;
  res.setHeader('Content-Type', CONTENT_TYPES.html);
  res.setHeader('Content-Length', content.length);
  res.statusCode = 400;
  res.end(content);
};

const serveStaticFile = (req, res) => {
  let path = `${STATIC_FOLDER}${req.url}`;
  const stat = existsSync(path) && statSync(path);
  if (!stat || !stat.isFile()) return serveNotFoundPage(req , res);
  const [, extension] = path.match(/.*\.(.*)$/) || [];
  const content = readFileSync(path);
  res.setHeader('Content-Type', CONTENT_TYPES[extension]);
  res.setHeader('Content-Length', content.length);
  res.statusCode = 200;
  res.end(content);
};

const loadComments = () => {
  if (existsSync(COMMENTS_PATH)) return JSON.parse(readFileSync(COMMENTS_PATH, 'utf8') || '[]');
  return [];
};

const generateCommentsHtml = (commentsHtml, commentDetails) => {
  const { date, name, comment } = commentDetails;
  const html = `<tr>
    <td class = "date">${new Date(date).toGMTString()}</td>
    <td class = "name">${name}</td>
    <td class = "comment">${comment.replace(/\r\n/g, '</br>')}</td>
  </tr>`;
  return html + commentsHtml;
};

const serveGuestBookPage = (req, res) => {
  const comments = loadComments();
  const commentsHtml = comments.reduce(generateCommentsHtml, '');
  const html = loadTemplate('GuestBook.html', { COMMENTS: commentsHtml });
  res.setHeader('Content-Type', CONTENT_TYPES.html);
  res.setHeader('Content-Length', html.length);
  res.statusCode = 200;
  res.end(html);
};

const redirectTo = (url, res) => {
  res.setHeader('Location', url);
  res.setHeader('Content-Length', 0);
  res.statusCode = 301;
  res.end();
};

const registerCommentAndRedirect = (req, res) => {
  let data = '';
  const comments = loadComments();
  const date = new Date();
  req.on('data', chunk => data += chunk);
  req.on('end', () => {
    const { name, comment } = queryString.parse(data);
    comments.push({ date, name, comment });
    writeFileSync(COMMENTS_PATH, JSON.stringify(comments), 'utf8');
    redirectTo('./GuestBook.html', res);
  });
};

const serveHomePage = (req, res) => {
  req.url = '/index.html';
  serveStaticFile(req, res);
};

const getHandlers = {
  '/' : serveHomePage,
  '/GuestBook.html' : serveGuestBookPage,
  'default' : serveStaticFile
};

const postHandlers = {
  '/registerComment' : registerCommentAndRedirect,
  'default' : serveNotFoundPage
};

const methodHandlers = {
  'GET' : getHandlers,
  'POST' : postHandlers,
  'notAllowed' : { 'default' : serveBadRequestPage }
};

const findHandler = req => {
  const handlers = methodHandlers[req.method] || methodHandlers.notAllowed;
  const handler = handlers[req.url] || handlers.default;
  return handler;
};

const processRequest = (req, res) => {
  console.warn('Request:', req.url, req.method);
  console.warn(req.headers);
  const handler = findHandler(req);
  handler(req, res);
};

module.exports = { processRequest };
