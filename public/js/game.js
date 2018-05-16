let socket;

$(handleApp);

function handleApp() {
  CURRENT_GAME = JSON.parse(CURRENT_GAME);
  initRealTimeUpdates();
  displayGame(CURRENT_GAME);
  if (CURRENT_GAME.opponentId) {
    socket.emit('joined', {
      roomId: CURRENT_GAME.roomId,
      playerId: CURRENT_GAME.playerId
    });
  }
  handlePlayersTurn();
}

function initRealTimeUpdates() {
  socket = io();
  socket.emit('join-room', CURRENT_GAME.roomId);

  socket.on('turn-update', function(coordinates) {
    console.log(
      `Turn was made at coordinates ${coordinates.x}, ${coordinates.y}`
    );
    updateOpponentMove(coordinates);
    setPlayersTurn();
  });

  socket.on('game-finished-update', function(winner) {
    console.log(winner);
    setGameFinished(winner);
  });

  socket.on('joined-update', function(opponentId) {
    console.log(opponentId);
    setGameInfo(opponentId);
  });
}

function setGameInfo(opponentId) {
  const playersMsg = !opponentId
    ? 'waiting for an opponent to join the game...'
    : `${CURRENT_GAME.playerId} VS ${opponentId}`;

  $('.game-name').text(playersMsg);
}

function updateOpponentMove(coordinates) {
  const cellId = `board${coordinates.x}${coordinates.y}`;
  console.log(cellId);
  $('.players-board')
    .find(`#${cellId}`)
    .addClass('shot');
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
      <input type="radio" id="${j}${i}" name="cell" ${disabled} required>
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

function enableForm(formClass) {
  $(`.${formClass}`)
    .find('fieldset, button[type="submit"]')
    .removeAttr('disabled');
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

  // Update turn information
  setOpponetsTurn();

  socket.emit('turn', { roomId: CURRENT_GAME.roomId, coordinates });

  // check if game is finished
  if (data.finished) {
    setGameFinished(data.winner);
    socket.emit('game-finished', {
      roomId: CURRENT_GAME.roomId,
      winner: data.winner
    });
  }
}

function setOpponetsTurn() {
  $('.game-state').text("Opponent's turn");
  disableForm('battleship-game');
}

function setPlayersTurn() {
  $('.game-state').text('Your turn');
  enableForm('battleship-game');
}

function setGameFinished(winner) {
  $('.game-state').text(`Game is finished. The winner is ${winner}`);
  disableForm('battleship-game');
}

function getTurnResult(coordinates, callback) {
  let completeUrl = `/battleship/${CURRENT_GAME.id}`;
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
}

function displayGameInfo(data) {
  setGameInfo(data.opponentId);
  if (data.nextTurn) {
    setPlayersTurn();
  } else {
    setOpponetsTurn();
  }
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
  ships.forEach(ship => {
    if (ship.points.length === 1) {
      grid[ship.points[0].x][ship.points[0].y].state = 'single ship';
    } else {
      ship.points.forEach(function(point, index, points) {
        console.log(point);
        console.log(index);
        console.log(points.length);
        if (index === 0 && !ship.isHorizontal) {
          grid[point.x][point.y].state = 'ship top';
        } else if (index === 0 && ship.isHorizontal) {
          grid[point.x][point.y].state = 'ship left';
        } else if (index === points.length - 1 && !ship.isHorizontal) {
          grid[point.x][point.y].state = 'ship bottom';
        } else if (index === points.length - 1 && ship.isHorizontal) {
          grid[point.x][point.y].state = 'ship right';
        } else {
          grid[point.x][point.y].state = 'ship';
        }
      });
    }
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
      gridHtml += `<div class="column columnwidth"><div id="board${j}${i}" class="board ${
        grid[j][i].state
      }">&nbsp;</div></div>`;
    }
    gridHtml += '</div>';
  }

  $('.players-board').html(gridHtml);
}

function displayGame(data) {
  if (data === null) {
    displayErrorMessage();
  }
  displayGameInfo(data);
  displayPlayersBoard(data);
  displayPlayersTurns(data);
  if (data.gameFinished) {
    setGameFinished(data.winner);
  }
}

function displayErrorMessage() {
  $('.error-message').text('There was an error retrieving your game');
}
