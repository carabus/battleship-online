const expect = require('chai').expect;

// import generate Ships
const generator = require('../battleshipGameGenerator');

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

    const flatCoordinatesArray = [];
    answer.forEach(ship => {
      ship.points.forEach(point => {
        flatCoordinatesArray.push(point);
      });
    });

    let flatCoordinatesSet = new Set();
    flatCoordinatesArray.forEach(element =>
      flatCoordinatesSet.add(JSON.stringify(element))
    );
    expect(flatCoordinatesSet.size).to.equal(flatCoordinatesArray.length);
  });
});
