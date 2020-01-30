'use strict';

const { Server } = require('http');
const handlers = require('./handlers');
const App = require('./app');

const app = new App();

app.get('/GuestBook.html', handlers.serveGuestBookPage);
app.get('', handlers.serveStaticFile);
app.get('', handlers.serveNotFoundPage);

app.post('/registerComment', handlers.registerCommentAndRedirect);
app.post('', handlers.serveNotFoundPage);

app.use(handlers.serveBadRequestPage);

const main = (port = 7000) => {
  const server = new Server(app.handleRequests.bind(app));
  server.listen(port, () => console.log(`started listening: ${port}`));
};

main(process.argv[2]);
