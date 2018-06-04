let socket;

$(handleApp);

function handleApp() {
  CURRENT_GAME = JSON.parse(CURRENT_GAME);
  initRealTimeUpdates();

  if (CURRENT_GAME.opponentId) {
    displayGame(CURRENT_GAME);
    socket.emit('joined', {
      roomId: CURRENT_GAME.roomId,
      playerId: CURRENT_GAME.playerId
    });
  } else {
    displayIncompleteRoomMessage();
  }

  handleAllDoneButton();
  handlePlayersTurn();
  handleCopyLink();
  handleSelectTarget();
}

function strokeCanvas() {
  const shipCanvas = $('.players-board').find('canvas');

  shipCanvas.push($('#ship-legend').get(0));

  for (let i = 0; i < shipCanvas.length; i++) {
    const rc = rough.canvas(shipCanvas.get(i));
    //line and rectangle
    rc.rectangle(1, 1, 23, 23, {
      fill: 'black',
      roughness: 1,
      hachureGap: 5
      //fillWeight: 1
    });
  }
}

function displayIncompleteRoomMessage() {
  $('.join-game-link').text(generateJoinLink());
  $('.game-incomplete').show();
}

function handleCopyLink() {
  $('.copy').on('click', function(event) {
    var $temp = $('<input>');
    $('body').append($temp);
    $temp.val($('.join-game-link').text()).select();
    document.execCommand('copy');
    $temp.remove();
  });
}

function handleAllDoneButton() {
  $('.all-done-button').on('click', function(event) {
    $('.game-incomplete').hide();
    displayGame(CURRENT_GAME);
  });
}

function handleSelectTarget() {
  $('.battleship-game-fieldset').on('change', 'input[type=radio]', function() {
    $('.fire').show();
  });
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
    setGameFinished(false);
  });

  socket.on('joined-update', function(opponentId) {
    $('.game-incomplete').hide();
    if (!CURRENT_GAME.opponentId) {
      CURRENT_GAME.opponentId = opponentId;
      displayGame(CURRENT_GAME);
    }
  });
}

function displayGameName() {
  if (!CURRENT_GAME.opponentId) {
    return;
  }
  $('.game-name')
    .find('p')
    .text(`${CURRENT_GAME.opponentId} VS ${CURRENT_GAME.playerId}`);
  $('.game-name').show();
}

function setGameInfo(msg) {
  $('.game-info').html(msg);
}

function generateJoinLink() {
  return `${window.location.origin}/join/${CURRENT_GAME.roomId}`;
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
    $('.fire').hide();
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
    htmlString += `<div class="board-row">`;
    for (j = 0; j < 10; j++) {
      const disabled = grid[j][i].state === 'empty' ? '' : 'disabled';
      htmlString += `<div class="board-column columnwidth ${grid[j][i].state}">
      <label for="${j}${i}">
      <input type="radio" id="${j}${i}" name="cell" ${disabled} required>
      <span> </span>
      </label></div>`;
    }
    htmlString += '</div>';
  }

  $('.battleship-game-fieldset').html(htmlString);
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
    setGameFinished(true);
    socket.emit('game-finished', {
      roomId: CURRENT_GAME.roomId,
      winner: data.winner
    });
  }
}

function setOpponetsTurn() {
  $('.game-state').text("Opponent's turn");
  disableForm('battleship-game');
  $('.game').removeClass('players-turn');
  setGameInfo(`Opponent's turn`);
}

function setPlayersTurn() {
  $('.game-state').text('Your turn');
  enableForm('battleship-game');
  $('.game').addClass('players-turn');
  setGameInfo('Your turn');
}

function setGameFinished(isWinner) {
  setGameInfo('Game over');
  $('.game-complete').find('p').text(`You ${isWinner ? 'win' : 'loose'}!`);
  $('.game-complete').show();
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
  if (!data.opponentId) {
    setGameInfo(
      'Waiting for someone to join...<a href="" target="_self"><i class="fas fa-question-circle"></i></a>'
    );
    return;
  }

  if (data.gameFinished) {
    setGameFinished(data.winner === data.playerId);
    return;
  }

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
    gridHtml += '<div class="board-row">';
    for (let j = 0; j < 10; j++) {
      let shipCanvas = grid[j][i].state.includes('ship')
        ? `<canvas id="canvas${j}${i}" width="24" height="24"></canvas>`
        : '';
      gridHtml += `<div class="board-column columnwidth"><div id="board${j}${i}" class="board ${
        grid[j][i].state
      }">${shipCanvas}</div></div>`;
    }
    gridHtml += '</div>';
  }

  $('.players-board').html(gridHtml);
}

function displayGame(data) {
  if (data === null) {
    displayErrorMessage();
  }

  displayPlayersBoard(data);
  displayPlayersTurns(data);
  displayGameInfo(data);
  displayGameName();
  strokeCanvas();
  $('.game').show();
}
