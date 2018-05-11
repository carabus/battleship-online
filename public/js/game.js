const CURRENT_GAME = {
  ships: [[{ x: 0, y: 1 }, { x: 0, y: 2 }, { x: 0, y: 3 }], [{ x: 3, y: 6 }]],
  opponentMoves: [{ x: 0, y: 1 }],
  hits: [{ x: 0, y: 1 }],
  misses: [{ x: 1, y: 0 }],
  nextTurn: true,
  gameName: 'grotesque-firefly vs splintered-rocket'
};

$(handleApp);

function handleApp() {
  displayGame(CURRENT_GAME);
  handlePlayersTurn();
}

function handlePlayersTurn() {
  $('.battleship-game').submit(function(event) {
    event.preventDefault();
    const selectedCoordinates = $(this)
      .find('input[name="cell"]:checked')
      .attr('id');

    // get coordinates
    let coordinateX = parseInt(selectedCoordinates.substring(0, 1), 10);
    let coordinateY = parseInt(selectedCoordinates.substring(1, 2), 10);
    // send api request
    getTurnResult({ x: coordinateX, y: coordinateY }, displayTurnResult);
  });
}

function displayPlayersTurns(data) {
  // generate empty 10 by 10 grid
  let grid = [];
  for (let i = 0; i < 10; i++) {
    grid[i] = [];
    for (let j = 0; j < 10; j++) {
      grid[i][j] = {
        state: 'empty'
      };
    }
  }
  // update with information on hits and misses
  data.hits.forEach(point => {
    grid[point.x][point.y].state = 'hit';
  });

  data.misses.forEach(point => {
    grid[point.x][point.y].state = 'miss';
  });

  // generate html for displaying the grid
  let htmlString = '';
  for (let i = 0; i < 10; i++) {
    htmlString += `<div class="row">`;
    for (j = 0; j < 10; j++) {
      const disabled = grid[j][i].state === 'empty' ? '' : 'disabled';
      htmlString += `<div class="column ${grid[j][i].state}">
      <label for="${j}${i}">
      <input type="radio" id="${j}${i}" name="cell" ${disabled}>
      <span> </span>
      </label></div>`;
    }
    htmlString += '</div>';
  }

  $('.battleship-game-fieldset').append(htmlString);
}

function disableForm(formClass) {
  $(`.${formClass}`)
    .find('fieldset, button[type="submit"]')
    .attr('disabled', 'disabled');
}

function displayTurnResult(data, coordinates) {
  const cellId = `${coordinates.x}${coordinates.y}`;
  console.log(cellId);

  const cellClass = data.hit ? 'hit' : 'miss';
  console.log(cellClass);
  $(`#${cellId}`)
    .closest('div')
    .removeClass('empty');
  $(`#${cellId}`)
    .closest('div')
    .addClass(cellClass);
  $(`#${cellId}`).prop('checked', false);
  $(`#${cellId}`).attr('disabled', 'disabled');

  // check that game is finished
  if (data.finished) {
    alert(`Game is finished. The winner is ${data.winner}`);
    disableForm('battleship-game');
  }
}

function getTurnResult(coordinates, callback) {
  /*
  let completeUrl = `/battleship/${gameId}`;
  let dataObject = {
    id: CURRENT_GAME.id,
    playerId: CURRENT_GAME.playerId,
    roomId: CURRENT_GAME.roomId,
    moves: coordinates
  };

  let settings = {
    contentType: 'application/json',
    data: JSON.stringify(dataObject),
    url: completeUrl,
    dataType: 'json',
    type: 'PUT',
    success: function(response) {
      callback(response, coordinates);
    },
    error: displayErrorMessage
  };

  console.log(settings);
  $.ajax(settings);
  */
  setTimeout(function() {
    callback(
      { hit: true, finished: true, winner: 'grotesque-firefly' },
      coordinates
    );
  }, 100);
}

/*
function getSingleGame(gameId, callback) {
  // Build api url based on parameters
  let completeUrl = `/battleship/${gameId}`;

  let settings = {
    url: completeUrl,
    dataType: 'json',
    type: 'GET',
    success: callback,
    error: displayErrorMessage
  };

  $.ajax(settings);
}
*/

function displayGameInfo(data) {
  $('.game-name').text(data.gameName);
  $('.battleship-game-fieldset')
    .find('legend')
    .text(data.nextTurn ? 'Your turn' : "Opponent's turn");
}

function displayPlayersBoard(data) {
  //generate 10 by 10 array
  let grid = [];
  for (let i = 0; i < 10; i++) {
    grid[i] = [];
    for (let j = 0; j < 10; j++) {
      grid[i][j] = {
        state: 'empty'
      };
    }
  }

  // add ships
  const ships = data.ships;
  ships.forEach(points => {
    points.forEach(point => {
      grid[point.x][point.y].state = 'ship';
    });
  });

  // display opponents moves
  const opponentsMoves = data.opponentMoves;
  opponentsMoves.forEach(point => {
    grid[point.x][point.y].state += ' shot';
  });

  // generate html for displaying the grid
  let gridHtml = '';
  for (let i = 0; i < 10; i++) {
    gridHtml += '<div class="row">';
    for (let j = 0; j < 10; j++) {
      gridHtml += `<div class="column ${
        grid[j][i].state
      } columnwidth">&nbsp;</div>`;
    }
    gridHtml += '</div>';
  }

  $('.players-board').html(gridHtml);
}

function displayGame(data) {
  displayGameInfo(data);
  displayPlayersBoard(data);
  displayPlayersTurns(data);
}

function displayErrorMessage() {
  $('.error-message').text('There was an error retrieving your game');
}
