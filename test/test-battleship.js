const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;

const { app, runServer, closeServer } = require('../server');

chai.use(chaiHttp);

describe('Battleship App', function() {
  before(function() {
    return runServer();
  });

  after(function() {
    return closeServer();
  });

  describe('App Main Page', function() {
    it('should return status 200 and html when navigated to', function() {
      return chai
        .request(app)
        .get('/')
        .then(function(res) {
          expect(res).to.have.status(200);
          expect(res).to.be.html;
        });
    });
  });

  describe('App Join Page', function() {
    it('should return status 200 and html when navigated to', function() {
      return chai
        .request(app)
        .get('/join/1234567')
        .then(function(res) {
          expect(res).to.have.status(200);
          expect(res).to.be.html;
        });
    });
  });

  describe('App Game Page', function() {
    it('should return status 200 and html when navigated to', function() {
      return chai
        .request(app)
        .get('/game/1234567')
        .then(function(res) {
          expect(res).to.have.status(200);
          expect(res).to.be.html;
        });
    });
  });
});
