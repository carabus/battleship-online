const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const mongoose = require('mongoose');
const morgan = require('morgan');

const { PORT, DATABASE_URL } = require('./config');
const { BattleshipGame } = require('./models/battleshipModel');
const playerIdRouter = require('./controllers/playerIdRouter');
const battleshipRouter = require('./controllers/battleshipRouter');

app.set('view engine', 'ejs');

app.use(morgan('common'));

app.use(express.static('public'));

app.use('/player', playerIdRouter);
app.use('/battleship', battleshipRouter);

// render ejs pages
app.get('/', function(req, res) {
  res.render('pages/index');
});

app.get('/join/:roomId', function(req, res) {
  res.render('pages/join', { roomId: req.params.roomId });
});

app.get('/game/:id', function(req, res) {
  res.render('pages/game', { id: req.params.id });
});

// handle socket.io events
io.on('connection', function(socket) {
  socket.on('join-room', function(roomId) {
    console.log('joined room: ' + roomId);
    socket.join(roomId);
  });

  socket.on('turn', function(data) {
    console.log(
      `turn was made at ${data.roomId}, ${data.coordinates.x}, ${
        data.coordinates.y
      }`
    );

    socket.broadcast.to(data.roomId).emit('turn-update', data.coordinates);
  });
});

mongoose.Promise = global.Promise;
let server;

function runServer(databaseUrl, port = PORT) {
  return new Promise((resolve, reject) => {
    console.log(databaseUrl);
    mongoose.connect(databaseUrl, err => {
      if (err) {
        return reject(err);
      }
      server = http
        .listen(port, () => {
          console.log(`Your app is listening on port ${port}`);
          resolve();
        })
        .on('error', err => {
          mongoose.disconnect();
          reject(err);
        });
    });
  });
}

// Stop server
function closeServer() {
  return mongoose.disconnect().then(() => {
    return new Promise((resolve, reject) => {
      console.log('Closing server');
      server.close(err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  });
}

if (require.main === module) {
  runServer(DATABASE_URL).catch(err => console.error(err));
}

module.exports = { app, runServer, closeServer };
