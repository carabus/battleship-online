'use strict';

const mongoose = require('mongoose');
/**
 * Each player has its own BattleshipGame entry that stores all information required to display
 * the game from this player POV. This information includes: players' ships, results of this player's turns
 * made so far, turns made by this player's opponent, game status info etc, but excludes information such as
 * opponent's ships locations.
 * 2 BattleshipGame entries that belong to the same game but 2 different players are connected by roomId value.
 */
let battleshipGameSchema = mongoose.Schema(
  {
    playerId: { type: String, required: true },
    opponentId: { type: String, required: false },
    roomId: { type: String, required: true },
    ships: [
      {
        isHorizontal: Boolean,
        points: [
          {
            x: Number,
            y: Number
          }
        ]
      }
    ],
    hits: [
      {
        x: Number,
        y: Number
      }
    ],
    misses: [
      {
        x: Number,
        y: Number
      }
    ],
    nextTurn: Boolean,
    opponentMoves: [
      {
        x: Number,
        y: Number
      }
    ],
    gameFinished: Boolean,
    winner: String
  },
  { timestamps: { createdAt: 'created' } }
);

battleshipGameSchema.methods.serialize = function() {
  return {
    id: this._id,
    playerId: this.playerId,
    opponentId: this.opponentId,
    roomId: this.roomId,
    ships: this.ships,
    hits: this.hits,
    misses: this.misses,
    nextTurn: this.nextTurn,
    opponentMoves: this.opponentMoves,
    gameFinished: this.gameFinished,
    winner: this.winner,
    created: this.created
  };
};

const BattleshipGame = mongoose.model('BattleshipGame', battleshipGameSchema);

module.exports = { BattleshipGame };
