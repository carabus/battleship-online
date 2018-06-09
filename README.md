# Battleship Online

Battleship Online is a lightweight and casual game of battleship for 2 players.
The idea behind the app was to get players to play the game with as little extra steps as possible.
That is why players do not have to register, come up with smart and funny username or even draw battleships on the grid. All that stuff is randomly generated so players can just play.

## Starting a game

When Player #1 starts a new game, a link to the game room is generated.
Player #1 then sends this link to Player #2, using his favourite messaging app, so that Player #2 can join the game.
Once game room is complete, players exchange turns until one of the players uncovers all of the opponent battleships.

## Demo

* [Live Demo](https://carabus-battleship.herokuapp.com/)

## Video Demo

* ![Video Demo](https://raw.githubusercontent.com/carabus/battleship-online/master/screenshots/video-demo.gif)

## Screenshots

### Start Page

![Start Page](https://raw.githubusercontent.com/carabus/battleship-online/master/screenshots/landing-page.png)

### Game Page

![Join Game Instructions](https://raw.githubusercontent.com/carabus/battleship-online/master/screenshots/join-game-instructions.png)

### Game Page

![Game Page](https://raw.githubusercontent.com/carabus/battleship-online/master/screenshots/game-page.png)

## Technologies used

### Front End:

* JavaScript
* jQuery
* HTML5
* CSS3

### Back End:

* Node.js
* Express
* MongoDB
* Mongoose
* Mocha
* Chai, Chai-http
* Socket.io

### Responsive

* The app is responsive and optimized for both desktop and mobile use

## API Documentation

* GET /player - get randomly generated player id
* POST /battleship - create a game in the room for a particular player. Required fields are: playerId, roomId.
* PUT /battleship/:id - make a turn in the game. Required fields are: id, playerId, roomId, moves.

## Nice to have features

* Ability to restart the game with the same opponent without having to re-send the link
* Ability to differentiate between "hitting" the ship and "killing" the ship and deactivate squares around "killed" ship
* Ability to view the list of games I am currently playing and continue playing it
* High scores board

## Attribution

* Battleship icon [by Luke Anthony Firth](https://thenounproject.com/term/battleship/9270/)
* Cool help messages on the start page - [Chardin.js](https://github.com/heelhook/chardin.js)
* Hand drawn ships on the board - [Rough.js](https://github.com/pshihn/rough)
