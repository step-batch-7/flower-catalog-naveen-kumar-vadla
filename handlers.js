'use strict';

const { existsSync, readFileSync, statSync, writeFileSync } = require('fs');
const { loadTemplate } = require('./lib/viewTemplate');
const queryString = require('querystring');
const CONTENT_TYPES = require('./lib/mimeTypes');

const STATIC_FOLDER = `${__dirname}/public`;
const COMMENTS_PATH = `${__dirname}/data/comments.json`;

const areStatsOk = path => {
  const stat = existsSync(path) && statSync(path);
  return stat && stat.isFile();
};

const decideUrl = url => {
  return url === '/' ? '/index.html' : url;
};

const serveStaticFile = (req, res, next) => {
  const url = decideUrl(req.url);
  const path = `${STATIC_FOLDER}${url}`;
  if (!areStatsOk(path)) {
    return next();
  }
  const [, extension] = path.match(/.*\.(.*)$/) || [];
  const content = readFileSync(path);
  res.setHeader('Content-Type', CONTENT_TYPES[extension]);
  res.setHeader('Content-Length', content.length);
  res.end(content);
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
  res.end(html);
};

const loadComments = () => {
  if (existsSync(COMMENTS_PATH)) {
    return JSON.parse(readFileSync(COMMENTS_PATH, 'utf8') || '[]');
  }
  return [];
};

const registerCommentAndRedirect = (req, res) => {
  const comments = loadComments();
  const date = new Date();
  const { name, comment } = req.body;
  comments.push({ date, name, comment });
  writeFileSync(COMMENTS_PATH, JSON.stringify(comments), 'utf8');
  redirectTo('./GuestBook.html', res);
};

const redirectTo = (url, res) => {
  res.setHeader('Location', url);
  res.statusCode = 301;
  res.end();
};

const readBody = (req, res, next) => {
  let data = '';
  req.on('data', chunk => {
    data += chunk;
  });
  req.on('end', () => {
    req.body = queryString.parse(data);
    next();
  });
};

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

module.exports = {
  serveStaticFile,
  serveGuestBookPage,
  registerCommentAndRedirect,
  readBody,
  serveNotFoundPage,
  serveBadRequestPage
};
