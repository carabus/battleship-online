const router = require('express').Router();

const jsonParser = require('body-parser').json();

const { BattleshipGame } = require('../models/battleshipModel');
const { GAME_TEMPLATE, GAME_LENGTH } = require('../gameSettings');
const gameGenerator = require('./battleshipGameGenerator');

/**
 * POST request to create a game in the room for a particular player.
 * Required fields are: playerId, roomId
 */
router.post('/', jsonParser, async (req, res) => {
  try {
    // check for required fields
    const requiredFields = ['playerId', 'roomId'];
    for (let i = 0; i < requiredFields.length; i++) {
      const field = requiredFields[i];
      if (!(field in req.body)) {
        const message = `Missing \`${field}\` in request body`;
        console.error(message);
        return res.status(400).send(message);
      }
    }

    // can only create new room or join existing if 1 player already there
    let gamesInRoom = await BattleshipGame.find({ roomId: req.body.roomId });

    if (gamesInRoom.length > 1) {
      const message = `Can not join room ${req.body.roomId}`;
      console.error(message);
      return res.status(400).send(message);
    }

    // same player can not join the room twice
    if (gamesInRoom.length && gamesInRoom[0].playerId === req.body.playerId) {
      const message = `Can not join the same room twice`;
      console.error(message);
      return res.status(400).send(message);
    }

    // create new game in room
    const shipsPositions = gameGenerator.generateShips();
    const newGameInRoom = await BattleshipGame.create({
      playerId: req.body.playerId,
      roomId: req.body.roomId,
      ships: shipsPositions,
      // assign turn to the user who completes the room
      nextTurn: gamesInRoom.length ? true : false
    });

    // if it's a first game in this room, just return it as is
    if (gamesInRoom.length === 0) {
      return res.status(201).json(newGameInRoom.serialize());
    }

    // if it is second game in room, add opponent info to both games
    const updatedNewGame = await BattleshipGame.findByIdAndUpdate(
      newGameInRoom.id,
      { $set: { opponentId: gamesInRoom[0].playerId } },
      { new: true }
    );

    const updatedGameInRoom = await BattleshipGame.findByIdAndUpdate(
      gamesInRoom[0].id,
      { $set: { opponentId: newGameInRoom.playerId } },
      { new: true }
    );

    return res.status(201).json(updatedNewGame.serialize());
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * PUT request to make a turn in the game.
 * Returns turn result, e.g. hit or miss and whether game still continues after this turn
 */
router.put('/:id', jsonParser, async (req, res) => {
  try {
    // check that id in request params corresponds to id in request body
    if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
      const message =
        `Request path id (${req.params.id}) and request body id ` +
        `(${req.body.id}) must match`;
      console.error(message);
      return res.status(400).json({ message: message });
    }

    // check for required fields
    const requiredFields = ['playerId', 'roomId', 'moves'];
    for (let i = 0; i < requiredFields.length; i++) {
      const field = requiredFields[i];
      if (!(field in req.body)) {
        const message = `Missing \`${field}\` in request body`;
        console.error(message);
        return res.status(400).send(message);
      }
    }

    let attackerGame = await BattleshipGame.findById(req.params.id);
    // Can not make turns if game has finished
    if (attackerGame.gameFinished) {
      return res
        .status(400)
        .json({ message: `This game has already been completed` });
    }

    // Can not make turns if not players turn
    if (!attackerGame.nextTurn) {
      return res
        .status(400)
        .json({ message: `This is not ${attackerGame.playerId}'s turn` });
    }

    // update opponent's game:
    // - opponent has next turn
    // - track player's moves in opponent's game
    let defenderGame = await BattleshipGame.findOneAndUpdate(
      {
        $and: [
          { roomId: req.body.roomId },
          { playerId: { $ne: req.body.playerId } }
        ]
      },
      {
        $push: { opponentMoves: req.body.moves },
        $set: { nextTurn: true }
      },
      { new: true }
    );

    // find out if current turn is hit or miss and update the game accordingly
    let hit = {};
    for (let i = 0; i < defenderGame.ships.length; i++) {
      hit = defenderGame.ships[i].points.find(coordinates => {
        return (
          coordinates.x === req.body.moves.x &&
          coordinates.y === req.body.moves.y
        );
      });
      if (hit) {
        break;
      }
    }
    const fieldToUpdate = hit ? 'hits' : 'misses';

    attackerGame = await BattleshipGame.findByIdAndUpdate(
      req.params.id,
      {
        $push: { [fieldToUpdate]: req.body.moves },
        $set: { nextTurn: false }
      },
      { new: true }
    );

    // check if current game is finished
    if (hit) {
      if (attackerGame.hits.length >= GAME_LENGTH) {
        attackerGame = await BattleshipGame.findByIdAndUpdate(
          attackerGame.id,
          {
            $set: { gameFinished: true, winner: attackerGame.playerId }
          },
          { new: true }
        );
        defenderGame = await BattleshipGame.findByIdAndUpdate(
          defenderGame.id,
          {
            $set: { gameFinished: true, winner: attackerGame.playerId }
          },
          { new: true }
        );
      }
    }
    return res.status(200).json({
      hit: hit,
      finished: attackerGame.gameFinished,
      winner: attackerGame.winner
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
