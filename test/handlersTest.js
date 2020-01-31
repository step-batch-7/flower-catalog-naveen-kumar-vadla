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

  describe ('Abeliophyllum Page', () => {
    it('should get the path /Abeliophyllum.html', done => {
      request(app)
        .get('/Abeliophyllum.html')
        .set('Accept', '*/*')
        .expect(200)
        .expect('Content-Type', 'text/html')
        .expect('Content-Length', '1493', done);
    });
    it('should get the path /css/Abeliophyllum.css', done => {
      request(app)
        .get('/css/Abeliophyllum.css')
        .set('Accept', '*/*')
        .expect(200)
        .expect('Content-Type', 'text/css')
        .expect('Content-Length', '560', done);
    });
    it('should get the path /images/Abeliophyllum.jpg', done => {
      request(app)
        .get('/images/Abeliophyllum.jpg')
        .set('Accept', '*/*')
        .expect(200)
        .expect('Content-Type', 'image/jpeg', done);
    });
  });

  describe('FILE NOT FOUND', () => {
    it('Should give file not found if file not exist', done => {
      request(app)
        .get('/badFile')
        .set('Accept', '*/*')
        .expect(404)
        .expect('Content-Type', 'text/plain')
        .expect('Content-Length', '18')
        .expect('404 File Not Found', done);
    });
  });
});

describe('METHOD NOT ALLOWED', () => {
  it('Should should give method not allowed for put method ', done => {
    request(app)
      .put('/')
      .set('Accept', '*/*')
      .expect(400)
      .expect('Content-Type', 'text/plain')
      .expect('Content-Length', '22')
      .expect('400 Method Not Allowed', done);
  });
});
