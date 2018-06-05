'use strict';
const gameTemplateString = process.env.GAME_TEMPLATE || '4,3,3,2,2,2,1,1,1,1';

exports.GAME_TEMPLATE = gameTemplateString.split(',').map(item => item.trim());
exports.GAME_LENGTH = gameTemplateString
  .split(',')
  .map(item => parseInt(item))
  .reduce((accumulator, currentValue) => accumulator + currentValue, 0);
