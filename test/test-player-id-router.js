const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;

const { app, runServer, closeServer } = require('../server');

chai.use(chaiHttp);

describe('Player Id Generator', function() {
  before(function() {
    return runServer();
  });

  after(function() {
    return closeServer();
  });

  describe('Player Id Generator', function() {
    it('should return status 200 and JSON object with <playerId> key', function() {
      return chai
        .request(app)
        .get('/player')
        .then(function(res) {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body).to.include.keys('playerId');
        });
    });
  });
});
