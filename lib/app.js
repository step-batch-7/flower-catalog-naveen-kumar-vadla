'use strict';

const express = require('express');

const app = express();

const {
  serveGuestBookPage,
  registerCommentAndRedirect,
  serveNotFoundPage
} = require('./handlers');

const logger = (req, res, next) => {
  console.log(req.method, req.url);
  next();
};

app.use(logger);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.get('/GuestBook.html', serveGuestBookPage);

app.use(express.static('public'));

app.post('/registerComment', registerCommentAndRedirect);
app.post('', serveNotFoundPage);

module.exports = app;
