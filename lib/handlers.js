'use strict';

const { loadTemplate } = require('./viewTemplate');
const { loadComments, saveComments } = require('./redis');
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
  const comments = loadComments();
  const commentsHtml = comments.reduce(generateCommentsHtml, '');
  const html = loadTemplate('GuestBook.html', { COMMENTS: commentsHtml });
  res.setHeader('Content-Type', CONTENT_TYPES.html);
  res.setHeader('Content-Length', html.length);
  res.end(html);
};

const registerCommentAndRedirect = (req, res) => {
  const comments = loadComments();
  const date = new Date();
  const { name, comment } = req.body;
  comments.push({ date, name, comment });
  saveComments(comments);
  res.redirect('/GuestBook.html');
};

module.exports = { serveGuestBookPage, registerCommentAndRedirect };
