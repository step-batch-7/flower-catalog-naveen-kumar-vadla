'use strict';

const { loadTemplate } = require('./viewTemplate');
const { COMMENTS_PATH } = require('../config');
const CONTENT_TYPES = require('./mimeTypes');
const { loadComments, writeComments } = require('./redis');

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

const registerCommentAndRedirect = (req, res) => {
  const comments = loadComments(COMMENTS_PATH);
  const date = new Date();
  const { name, comment } = req.body;
  comments.push({ date, name, comment });
  writeComments(comments);
  res.redirect('/GuestBook.html');
};

module.exports = { serveGuestBookPage, registerCommentAndRedirect };
