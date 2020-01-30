'use strict';

const HANDLERS = require('./handlers');

class App {
  constructor() {
    this.routes = [];
  }

  get(path, handler) {
    this.routes.push({ path, handler, method: 'GET' });
  }

  post(path, handler) {
    this.routes.push({ path, handler, method: 'POST' });
  }

  use(handler) {
    this.routes.push({ handler });
  }
};

const isRouteMatched = (route, req) => {
  if (route.method)
    return route.method === req.method && req.url.match(route.path);
  return true;
};

const processRequest = (req, res) => {
  console.warn('Request:', req.url, req.method);
  console.warn(req.headers);

  const app = new App();
  app.get('/GuestBook.html', HANDLERS.serveGuestBookPage);
  app.get('', HANDLERS.serveStaticFile);
  app.get('', HANDLERS.serveNotFoundPage);
  app.post('/registerComment', HANDLERS.registerCommentAndRedirect);
  app.post('', HANDLERS.serveNotFoundPage);
  app.use(HANDLERS.serveBadRequestPage);

  const matchedRoutes = app.routes.filter(route => isRouteMatched(route, req));

  const next = () => {
    if (matchedRoutes.length === 0) return;
    const route = matchedRoutes.shift();
    const handler = route.handler;
    handler(req, res, next);
  };
  next();
};

module.exports = { processRequest };
