'use strict';
exports.DATABASE_URL =
  process.env.DATABASE_URL || 'mongodb://localhost/battleship';
exports.TEST_DATABASE_URL =
  process.env.TEST_DATABASE_URL || 'mongodb://localhost/testbattleship';
exports.PORT = process.env.PORT || 8080;
