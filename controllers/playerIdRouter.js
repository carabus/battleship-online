const router = require('express').Router();
const jsonParser = require('body-parser').json();
const moniker = require('moniker');

router.get('/', jsonParser, (req, res) => {
  return res.status(200).json({
    playerId: `${moniker.choose()}-${getRandomInt(1000, 9999)}`
  });
});

/**
 * Returns a random integer between min (inclusive) and max (inclusive)
 * Using Math.round() will give you a non-uniform distribution!
 */
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = router;
