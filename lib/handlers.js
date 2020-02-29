'use strict';

const fs = require('fs');

const { loadTemplate } = require('./viewTemplate');
const { COMMENTS_PATH } = require('../config');
const CONTENT_TYPES = require('./mimeTypes');

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
  if (fs.existsSync(path)) {
    return JSON.parse(fs.readFileSync(path, 'utf8') || '[]');
  }
  return [];
};

const registerCommentAndRedirect = (req, res) => {
  const comments = loadComments(COMMENTS_PATH);
  const date = new Date();
  const { name, comment } = req.body;
  comments.push({ date, name, comment });
  fs.writeFileSync(COMMENTS_PATH, JSON.stringify(comments), 'utf8');
  redirectTo('/GuestBook.html', res);
};

const redirectTo = (url, res) => {
  res.setHeader('Location', url);
  res.statusCode = 301;
  res.end();
};

module.exports = {
  serveGuestBookPage,
  registerCommentAndRedirect,
};
