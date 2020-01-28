'use strict';

const { existsSync, readFileSync, statSync, writeFileSync } = require('fs');
const { loadTemplate } = require('./lib/viewTemplate');
const Response = require('./lib/response');
const CONTENT_TYPES = require('./lib/mimeTypes');
const SYMBOLS = require('./lib/symbols');

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

const serveStaticFile = (req, res) => {
  let path = `${STATIC_FOLDER}${req.url}`;
  const stat = existsSync(path) && statSync(path);
  if (!stat || !stat.isFile()) return serveBadRequestPage();
  const [, extension] = path.match(/.*\.(.*)$/) || [];
  const contentType = CONTENT_TYPES[extension];
  const content = readFileSync(path);
  res.setHeader('Content-Type', contentType);
  res.setHeader('Content-Length', content.length);
  res.statusCode = 200;
  res.end(content);
};

const loadComments = function() {
  if (existsSync(COMMENTS_PATH)) return JSON.parse(readFileSync(COMMENTS_PATH));
  return [];
};

const generateCommentsHtml = (commentsHtml, commentDetails) => {
  const { date, name, comment } = commentDetails;
  const html = `<tr>
    <td class = "date">${new Date(date).toGMTString()}</td>
    <td class = "name">${name}</td>
    <td class = "comment">${comment.replace(/\n/g, '</br>')}</td>
  </tr>`;
  return html + commentsHtml;
};

const serveGuestBookPage = function(req, res) {
  const comments = loadComments();
  const commentsHtml = comments.reduce(generateCommentsHtml, '');
  const html = loadTemplate('GuestBook.html', { COMMENTS: commentsHtml });
  res.setHeader('Content-Type', CONTENT_TYPES.html);
  res.setHeader('Content-Length', html.length);
  res.statusCode = 200;
  res.end(html);
};

const replaceUnknownChars = function(text, character) {
  const regEx = new RegExp(`${character}`, 'g');
  return text.replace(regEx, SYMBOLS[character]);
};

const redirectTo = (url, res) => {
  res.setHeader('Location', url);
  res.setHeader('Content-Length', 0);
  res.statusCode = 301;
  res.end();
};

const pickupParams = (query, keyValue) => {
  const [key, value] = keyValue.split('=');
  query[key] = value;
  return query;
};

const readParams = keyValueTextPairs => keyValueTextPairs.split('&').reduce(pickupParams, {});

const registerCommentAndRedirect = (req, res) => {
  let data = '';
  const comments = loadComments();
  const date = new Date();
  req.on('data', chunk => (data += chunk));
  req.on('end', () => {
    const { name, comment } = readParams(data);
    const keys = Object.keys(SYMBOLS);
    const [nameText, commentText] = [name, comment].map(text => keys.reduce(replaceUnknownChars, text));
    comments.push({ date, name: nameText, comment: commentText });
    writeFileSync(COMMENTS_PATH, JSON.stringify(comments), 'utf8');
    redirectTo('./GuestBook.html', res);
  });
};

const serveHomePage = (req, res) => {
  req.url = '/index.html';
  return serveStaticFile(req, res);
};

const findHandler = req => {
  if (req.method === 'GET' && req.url === '/') return serveHomePage;
  if (req.method === 'POST' && req.url === '/registerComment') return registerCommentAndRedirect;
  if (req.method === 'GET' && req.url === '/GuestBook.html') return serveGuestBookPage;
  if (req.method === 'GET') return serveStaticFile;
  return serveBadRequestPage;
};

const processRequest = (req, res) => {
  const handler = findHandler(req);
  return handler(req, res);
};

module.exports = { processRequest };
