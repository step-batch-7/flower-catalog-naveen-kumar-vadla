'use strict';

const HANDLERS = require('./handlers');

const routes = [
  { path: '/GuestBook.html', handler: HANDLERS.serveGuestBookPage, method: 'GET' },
  { path: '', handler: HANDLERS.serveStaticFile, method: 'GET' },
  { path: '', handler: HANDLERS.serveNotFoundPage, method: 'GET' },
  { path: '/registerComment', handler: HANDLERS.registerCommentAndRedirect, method: 'POST' },
  { path: '', handler: HANDLERS.serveNotFoundPage, method: 'POST' },
  { handler: HANDLERS.serveBadRequestPage }
];

const isRouteMatched = (route, req) => {
  if (route.method) return route.method === req.method && req.url.match(route.path);
  return true;
};

const processRequest = (req, res) => {
  console.warn('Request:', req.url, req.method);
  console.warn(req.headers);
  const matchedRoutes = routes.filter(route => isRouteMatched(route, req));
  const next = () => {
    if (matchedRoutes.length === 0) return;
    const route = matchedRoutes.shift();
    const handler = route.handler;
    handler(req, res, next);
  };
  next();
};

module.exports = { processRequest };
