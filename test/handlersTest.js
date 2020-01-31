'use strict';
const request = require('supertest');
let app = require('../handlers');
app = app.handleRequests.bind(app);

describe('GET', () => {
  describe('HOME PAGE', () => {
    it('should get the path / or index.html', done => {
      request(app)
        .get('/')
        .set('Accept', '*/*')
        .expect(200)
        .expect('Content-Type', 'text/html')
        .expect('Content-Length', '817', done);
    });
    it('should get the path /css/homePage.css', done => {
      request(app)
        .get('/css/homePage.css')
        .set('Accept', '*/*')
        .expect(200)
        .expect('Content-Type', 'text/css')
        .expect('Content-Length', '465', done);
    });
    it('should get the path /js/hideImage.js', done => {
      request(app)
        .get('/js/hideImage.js')
        .set('Accept', '*/*')
        .expect(200)
        .expect('Content-Type', 'application/javascript')
        .expect('Content-Length', '248', done);
    });
    it('should get the path /images/freshorigins.jpg', done => {
      request(app)
        .get('/images/freshorigins.jpg')
        .set('Accept', '*/*')
        .expect(200)
        .expect('Content-Type', 'image/jpeg', done);
    });
    it('should get the path /images/animated-flower-image-0021.gif', done => {
      request(app)
        .get('/images/animated-flower-image-0021.gif')
        .set('Accept', '*/*')
        .expect(200)
        .expect('Content-Type', 'image/gif', done);
    });
  });
});
