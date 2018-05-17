'use strict';
const gameTemplateString = process.env.GAME_TEMPLATE || '4,3,2,1';

exports.GAME_TEMPLATE = gameTemplateString.split(',').map(item => item.trim());
exports.GAME_LENGTH = process.env.GAME_LENGTH || 10;
