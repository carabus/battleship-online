const expect = require('chai').expect;

// import generate Ships
const generator = require('../controllers/battleshipGameGenerator');

// unit tests for generate ships function
describe('Game Generator', function() {
  it('should generate ship coordinates from template with *isHorizontal* and *points* keys', function() {
    const answer = generator.generateShips();
    expect(answer).to.be.an('array');
    expect(answer).to.have.lengthOf(generator.template.length);
    answer.forEach(function(ship, index) {
      expect(ship).to.include.keys('isHorizontal');
      expect(ship).to.include.keys('points');
      expect(ship.points).to.be.an('array');
      expect(ship.points).to.have.lengthOf(generator.template[index]);
      ship.points.forEach(function(point) {
        expect(point).to.include.keys('x');
        expect(point).to.include.keys('y');
      });
    });
  });

  it('should generate unique coordinates for each ship', function() {
    const answer = generator.generateShips();

    const flatCoordinatesArray = convertToFlat(answer);

    let flatCoordinatesSet = new Set();
    flatCoordinatesArray.forEach(element =>
      flatCoordinatesSet.add(JSON.stringify(element))
    );
    expect(flatCoordinatesSet.size).to.equal(flatCoordinatesArray.length);
  });

  /*
  it('should not generate ships that are next to each other', function() {
    let answer = generator.generateShips();

    let neighbour;

    while (answer.length > 1) {
      const currentShip = answer.pop();

      const flatCoordinatesArray = convertToFlat(answer);

      currentShip.points.forEach(point => {
        neighbour = flatCoordinatesArray.find(otherPoint => {
          return (
            Math.abs(point.x - otherPoint.x) === 1 ||
            Math.abs(point.y - otherPoint.y) === 1
          );
        });
      });
    }

    console.log(neighbour);
    expect(!neighbour).to.equal(true);
  });*/
});

function convertToFlat(shipArray) {
  const flatCoordinatesArray = [];
  shipArray.forEach(ship => {
    ship.points.forEach(point => {
      flatCoordinatesArray.push(point);
    });
  });
  return flatCoordinatesArray;
}
