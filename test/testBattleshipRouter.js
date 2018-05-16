const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const moniker = require('moniker');

const { BattleshipGame } = require('../models/battleshipModel');
const { TEST_DATABASE_URL } = require('../config');
const { app, runServer, closeServer } = require('../server');
const gameGenerator = require('../controllers/battleshipGameGenerator');

const expect = chai.expect;

chai.use(chaiHttp);

function seedBattleshipGameData(total, roomId) {
  console.log('Seeding battleship game data');
  let seedData = [];

  for (let i = 0; i < total; i++) {
    seedData.push(generateBattleshipGameData(roomId));
  }
  return BattleshipGame.insertMany(seedData);
}

function generateBattleshipGameData(roomId) {
  return {
    playerId: moniker.choose(),
    roomId: roomId,
    nextTurn: false,
    ships: [{ isHorizontal: true, points: [{ x: 0, y: 0 }] }]
  };
}

function tearDownDb() {
  console.warn('Deleting test database');
  mongoose.connection.dropDatabase();
}

describe('Battleship Game API', function() {
  before(function() {
    return runServer(TEST_DATABASE_URL);
  });

  afterEach(function() {
    return tearDownDb();
  });

  after(function() {
    return closeServer();
  });

  describe('POST endpoint: join game', function() {
    it('Player should be able to join when room is empty', function() {
      const newBattleshipGame = { playerId: 'player1', roomId: Date.now() };
      return chai
        .request(app)
        .post('/battleship')
        .send(newBattleshipGame)
        .then(function(res) {
          expect(res).to.have.status(201);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body).to.include.keys('id');
          expect(res.body.id).to.not.be.null;
          return BattleshipGame.findById(res.body.id);
        })
        .then(function(battleshipGame) {
          expect(battleshipGame.playerId).to.equal(newBattleshipGame.playerId);
          expect(battleshipGame.gameId).to.equal(newBattleshipGame.gameId);
          expect(battleshipGame.ships).to.not.be.null;
          expect(battleshipGame.nextTurn).to.equal(false);
        });
    });

    it('Player should not be able to join when room is full', function() {
      const newRoomId = Date.now();
      return seedBattleshipGameData(2, newRoomId).then(function(res) {
        const newBattleshipGame = { playerId: 'player1', roomId: newRoomId };
        return chai
          .request(app)
          .post('/battleship')
          .send(newBattleshipGame)
          .then(function(res) {
            expect(res).to.have.status(400);
          });
      });
    });

    it('Player should be able to join when there is another player in the room', function() {
      const newRoomId = Date.now();
      const newBattleshipGame = { playerId: 'player2', roomId: newRoomId };
      return seedBattleshipGameData(1, newRoomId).then(function(res) {
        return chai
          .request(app)
          .post('/battleship')
          .send(newBattleshipGame)
          .then(function(res) {
            expect(res).to.have.status(201);
            expect(res).to.be.json;
            expect(res.body).to.be.a('object');
            expect(res.body).to.include.keys('id');
            expect(res.body.id).to.not.be.null;
            return BattleshipGame.findById(res.body.id);
          })
          .then(function(battleshipGame) {
            expect(battleshipGame.playerId).to.equal(
              newBattleshipGame.playerId
            );
            expect(battleshipGame.gameId).to.equal(newBattleshipGame.gameId);
            expect(battleshipGame.ships).to.not.be.null;
            expect(battleshipGame.nextTurn).to.equal(true);
            expect(battleshipGame.opponentId).to.not.be.null;
          });
      });
    });
  });

  describe('PUT endpoint: make a turn', function() {
    it('Returns hit if ship was hit', function() {
      const newRoomId = Date.now();
      return seedBattleshipGameData(1, newRoomId).then(function(res) {
        const newBattleshipGame = { playerId: 'player2', roomId: newRoomId };

        return chai
          .request(app)
          .post('/battleship')
          .send(newBattleshipGame)
          .then(function(res) {
            return chai
              .request(app)
              .put(`/battleship/${res.body.id}`)
              .send({
                id: res.body.id,
                playerId: res.body.playerId,
                roomId: res.body.roomId,
                moves: { x: 0, y: 0 }
              })
              .then(function(res) {
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body).to.be.a('object');
                expect(res.body).to.include.keys('hit');
                expect(res.body.hit.x).to.equal(0);
                expect(res.body.hit.y).to.equal(0);
              });
          });
      });
    });
    it('Returns miss if ship was not hit', function() {
      const newRoomId = Date.now();
      return seedBattleshipGameData(1, newRoomId).then(function(res) {
        const newBattleshipGame = { playerId: 'player2', roomId: newRoomId };

        return chai
          .request(app)
          .post('/battleship')
          .send(newBattleshipGame)
          .then(function(res) {
            return chai
              .request(app)
              .put(`/battleship/${res.body.id}`)
              .send({
                id: res.body.id,
                playerId: res.body.playerId,
                roomId: res.body.roomId,
                moves: { x: 1, y: 1 }
              })
              .then(function(res) {
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body).to.be.a('object');
                expect(res.body).to.not.include.keys('hit');
              });
          });
      });
    });

    it('Update who has next turn', function() {
      const newRoomId = Date.now();
      return seedBattleshipGameData(1, newRoomId).then(function(res) {
        const newBattleshipGame = { playerId: 'player2', roomId: newRoomId };

        return chai
          .request(app)
          .post('/battleship')
          .send(newBattleshipGame)
          .then(function(res) {
            return chai
              .request(app)
              .put(`/battleship/${res.body.id}`)
              .send({
                id: res.body.id,
                playerId: res.body.playerId,
                roomId: res.body.roomId,
                moves: { x: 0, y: 0 }
              })
              .then(function(res) {
                return BattleshipGame.find({ roomId: newRoomId }).then(function(
                  games
                ) {
                  games.forEach(game => {
                    if (game.playerId === 'player2') {
                      expect(game.nextTurn).to.equal(false);
                    } else {
                      expect(game.nextTurn).to.equal(true);
                    }
                  });
                });
              });
          });
      });
    });

    it('Does not make a turn if other players turn', function() {
      const newRoomId = Date.now();
      return seedBattleshipGameData(2, newRoomId).then(function(games) {
        return chai
          .request(app)
          .put(`/battleship/${games[0]._id}`)
          .send({
            id: games[0]._id,
            playerId: games[0].playerId,
            roomId: games[0].roomId,
            moves: { x: 0, y: 0 }
          })
          .then(function(res) {
            expect(res).to.have.status(400);
          });
      });
    });

    it('Indicates when the game has finished', function() {
      const newRoomId = Date.now();
      let playerId = '';
      return seedBattleshipGameData(2, newRoomId).then(function(games) {
        let hitsValue = [];
        for (let i = 0; i < 19; i++) {
          hitsValue.push({ x: 1, y: 1 });
        }
        return BattleshipGame.findByIdAndUpdate(
          games[0]._id,
          {
            $set: { nextTurn: true, hits: hitsValue }
          },
          { new: true }
        ).then(function(res) {
          playerId = res.playerId;
          return chai
            .request(app)
            .put(`/battleship/${res._id}`)
            .send({
              id: res._id,
              playerId: res.playerId,
              roomId: res.roomId,
              moves: { x: 0, y: 0 }
            })
            .then(function(res) {
              expect(res).to.have.status(200);
              expect(res).to.be.json;
              expect(res.body).to.be.a('object');
              expect(res.body).to.include.keys('hit', 'finished', 'winner');
              expect(res.body.hit.x).to.equal(0);
              expect(res.body.hit.y).to.equal(0);
              expect(res.body.finished).to.equal(true);
              expect(res.body.winner).to.equal(playerId);
            });
        });
      });
    });

    it('Does not make a turn if game is finished', function() {
      const newRoomId = Date.now();
      return seedBattleshipGameData(2, newRoomId).then(function(games) {
        return BattleshipGame.findByIdAndUpdate(games[0]._id, {
          $set: { nextTurn: true, gameFinished: true }
        }).then(function(game) {
          return chai
            .request(app)
            .put(`/battleship/${game._id}`)
            .send({
              id: game._id,
              playerId: game.playerId,
              roomId: game.roomId,
              moves: { x: 0, y: 0 }
            })
            .then(function(res) {
              expect(res).to.have.status(400);
            });
        });
      });
    });
  });
});
