'use strict';

const { Server } = require('http');
const handlers = require('./handlers');
const App = require('./app');

const defaultPort = 7000;

const app = new App();

app.get('/GuestBook.html', handlers.serveGuestBookPage);
app.get('', handlers.serveStaticFile);
app.get('', handlers.serveNotFoundPage);

app.use(handlers.readBody);

app.post('/registerComment', handlers.registerCommentAndRedirect);
app.post('', handlers.serveNotFoundPage);

app.use(handlers.serveBadRequestPage);

const main = (port = defaultPort) => {
  const server = new Server(app.handleRequests.bind(app));
  server.listen(port, () => process.stderr.write(`started listening: ${port}`));
};

const [, , port] = process.argv;

main(port);
