const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const playerIdRouter = require('./playerIdRouter');

app.set('view engine', 'ejs');

app.use(express.static('public'));

app.use('/player', playerIdRouter);

app.get('/', function(req, res) {
  res.render('pages/index');
});

app.get('/join/:roomId', function(req, res) {
  res.render('pages/join', { roomId: req.params.roomId });
});

app.get('/game/:id', function(req, res) {
  res.render('pages/game', { id: req.params.id });
});

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

let server;

function runServer() {
  const port = process.env.PORT || 8080;
  return new Promise((resolve, reject) => {
    server = http
      .listen(port, () => {
        console.log(`Your app is listening on port ${port}`);
        resolve(server);
      })
      .on('error', err => {
        reject(err);
      });
  });
}

function closeServer() {
  return new Promise((resolve, reject) => {
    console.log('Closing server');
    server.close(err => {
      if (err) {
        reject(err);
        // so we don't also call `resolve()`
        return;
      }
      resolve();
    });
  });
}

if (require.main === module) {
  runServer().catch(err => console.error(err));
}

module.exports = { app, runServer, closeServer };
