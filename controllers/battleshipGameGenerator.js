'use strict';

// define template - what kind of ships to place on the grid
const { GAME_TEMPLATE, GAME_LENGTH } = require('../gameSettings');

/**
 * Generate Ship coordinates on the grid from template.
 * Ensures no ships are placed next to each other.
 */
function generateShips() {
  // generate grid with coordinates and place availability information
  // extra 1 square margins added to simplify algorithm
  let grid = [];
  for (let i = -1; i <= 10; i++) {
    grid[i] = [];
    for (let j = -1; j <= 10; j++) {
      grid[i][j] = { available: true };
    }
  }

  // Generate array of ship positions on the grid
  let ships = [];
  GAME_TEMPLATE.forEach(function(templateItem) {
    ships.push(tryToPlaceShip(grid, templateItem));
  });
  return ships;
}

function tryToPlaceShip(grid, length) {
  // randomly select if positioned horizontally or vertically
  let isHorizontal = getRandomInt(0, 1);

  // find random square where the current template item would fit (down and right)
  let startingPositionX = isHorizontal
    ? getRandomInt(0, 9 - length)
    : getRandomInt(0, 9);
  let startingPositionY = !isHorizontal
    ? getRandomInt(0, 9 - length)
    : getRandomInt(0, 9);

  // create potential ship from coordinates
  const shipCoordinates = [];

  for (let i = 0; i < length; i++) {
    let newCoordinates = isHorizontal
      ? { x: startingPositionX + i, y: startingPositionY }
      : { x: startingPositionX, y: startingPositionY + i };
    shipCoordinates.push(newCoordinates);
  }

  let retryRequired = false;

  // check grid availablility
  shipCoordinates.forEach(function(point) {
    if (!grid[point.x][point.y].available) {
      retryRequired = true;
    }
  });

  // if we could not place ship in the chosen location, make more attempts in a recursive call
  if (retryRequired) {
    return tryToPlaceShip(grid, length);
  }

  // mark squares of placed ship and next to the placed ship as unavailable so that we do not have ships placed next to each other
  shipCoordinates.forEach(function(point) {
    grid[point.x][point.y].available = false;
    updateAvailabilityAroundPoint(point, grid);
  });
  return { isHorizontal, points: shipCoordinates };
}

function updateAvailabilityAroundPoint(point, grid) {
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      grid[point.x + i][point.y + j].available = false;
    }
  }
}

/**
 * Returns a random integer between min (inclusive) and max (inclusive)
 * Using Math.round() will give you a non-uniform distribution!
 */
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = { generateShips, getRandomInt };
