const express = require('express');
const app = express();

const http = require('http').Server(app);
var io = require('socket.io')(http);

let server;

app.set('view engine', 'ejs');

app.use(express.static('public'));

app.get('/', function(req, res) {
  res.render('pages/index');
});

app.get('/join/:roomId', function(req, res) {
  res.render('pages/join', { roomId: req.params.roomId });
});

app.get('/game/:id', function(req, res) {
  res.render('pages/game', { id: req.params.id });
});

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
