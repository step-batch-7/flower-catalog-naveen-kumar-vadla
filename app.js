'use strict';

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

  handleRequests (req, res) {
    const matchedRoutes = this.routes.filter(route => isRouteMatched(route, req));
    const next = () => {
      if (matchedRoutes.length === 0) return;
      const route = matchedRoutes.shift();
      route.handler(req, res, next);
    };
    next();
  };
};

const isRouteMatched = (route, req) => {
  if (route.method) return route.method === req.method && req.url.match(route.path);
  return true;
};

module.exports = App;
