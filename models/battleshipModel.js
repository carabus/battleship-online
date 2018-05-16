'use strict';

const mongoose = require('mongoose');

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
