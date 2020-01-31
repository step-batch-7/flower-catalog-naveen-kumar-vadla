'use strict';

const { existsSync, readFileSync, statSync, writeFileSync } = require('fs');
const { loadTemplate } = require('./lib/viewTemplate');
const queryString = require('querystring');
const CONTENT_TYPES = require('./lib/mimeTypes');
const App = require('./app');

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
  const comments = loadComments(COMMENTS_PATH);
  const commentsHtml = comments.reduce(generateCommentsHtml, '');
  const html = loadTemplate('GuestBook.html', { COMMENTS: commentsHtml });
  res.setHeader('Content-Type', CONTENT_TYPES.html);
  res.setHeader('Content-Length', html.length);
  res.end(html);
};

const loadComments = path => {
  if (existsSync(path)) {
    return JSON.parse(readFileSync(path, 'utf8') || '[]');
  }
  return [];
};

const registerCommentAndRedirect = (req, res) => {
  const comments = loadComments(COMMENTS_PATH);
  const date = new Date();
  const { name, comment } = req.body;
  comments.push({ date, name, comment });
  writeFileSync(COMMENTS_PATH, JSON.stringify(comments), 'utf8');
  redirectTo('/GuestBook.html', res);
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
  const content = '404 File Not Found';
  res.setHeader('Content-Type', CONTENT_TYPES.txt);
  res.setHeader('Content-Length', content.length);
  res.statusCode = 404;
  res.end(content);
};

const serveBadRequestPage = (req, res) => {
  const content = '400 Method Not Allowed';
  res.setHeader('Content-Type', CONTENT_TYPES.txt);
  res.setHeader('Content-Length', content.length);
  res.statusCode = 400;
  res.end(content);
};

const app = new App();

app.get('/GuestBook.html', serveGuestBookPage);
app.get('', serveStaticFile);
app.get('', serveNotFoundPage);

app.use(readBody);

app.post('/registerComment', registerCommentAndRedirect);
app.post('', serveNotFoundPage);

app.use(serveBadRequestPage);

module.exports = app;
