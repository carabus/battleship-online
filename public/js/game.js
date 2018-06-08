// Getting aria labels for table cells depending on the cell state
const ariaLabels = {
  ship: 'ship',
  'ship shot': 'ship shot',
  empty: 'empty',
  'empty shot': 'miss',
  hit: 'hit',
  miss: 'miss'
};
let socket;

$(handleApp);

function handleApp() {
  // We get all current game details from backend in ejs template variable
  CURRENT_GAME = JSON.parse(CURRENT_GAME);

  // init socket.io and handle socket.io events
  initRealTimeUpdates();

  // opponentId only available when someone has joined the game
  // if both players present, we display a game ready to play
  // if no one has joined, we display instructions how to invite other player
  if (CURRENT_GAME.opponentId) {
    displayGame();
    displayPlayers();
    socket.emit('joined', {
      roomId: CURRENT_GAME.roomId,
      playerId: CURRENT_GAME.playerId
    });
  } else {
    displayIncompleteRoomMessage();
  }

  handleCopyLink();
  handleAcknowledgeButton();

  handleSelectTarget();
  handlePlayersTurn();

  handlePlayAgainButton();
  handleDismissErrorMessage();
}

/** Init socket.io and handle socket.io events */
function initRealTimeUpdates() {
  socket = io();
  socket.emit('join-room', CURRENT_GAME.roomId);

  socket.on('turn-update', function(data) {
    console.log(
      `Turn was made at coordinates ${data.coordinates.x}, ${
        data.coordinates.y
      }`
    );
    updateOpponentMove(data.coordinates);
    setPlayersTurn();
    $('.status-update p').text(
      `Enemy has made a move at coordinates ${data.coordinates.x + 1}, ${data
        .coordinates.y + 1}. The result is ${data.result}.`
    );
  });

  socket.on('game-finished-update', function(winner) {
    console.log(winner);
    setGameFinished(false);
  });

  socket.on('joined-update', function(opponentId) {
    $('.game-incomplete').hide();
    if (!CURRENT_GAME.opponentId) {
      CURRENT_GAME.opponentId = opponentId;
      displayGame();
      displayPlayers();
    }
  });
}

/**
 * Display animation that shows players in the game at the beginning of the game, e.g. "player1 vs player2"
 */
function displayPlayers() {
  if (!CURRENT_GAME.opponentId) {
    return;
  }
  $('.players')
    .find('.player-id')
    .text(
      `${CURRENT_GAME.playerId.substring(0, CURRENT_GAME.playerId.length - 5)}`
    );
  $('.players')
    .find('.opponent-id')
    .text(
      `${CURRENT_GAME.opponentId.substring(
        0,
        CURRENT_GAME.opponentId.length - 5
      )}`
    );

  $('.players').show();
  $('.game').addClass('opaque');
}

/** Display all game related UI elements: status, players, boards, legend */
function displayGame() {
  if (CURRENT_GAME === null) {
    displayErrorMessage();
  }

  displayPlayersBoard();
  displayPlayersTurns();
  displayGameInfo();

  $('.game').show();
}

/** If player is first to join the game, display instructions how other player can join */
function displayIncompleteRoomMessage() {
  $('.join-game-link').text(generateJoinLink());
  $('.game-incomplete').show();
}

/** Copy url to be used to join the game */
function handleCopyLink() {
  $('.copy').on('click', function(event) {
    var $temp = $('<input id="temp">');
    $temp.val($('.join-game-link').text());
    $('body').append($temp);

    // This is required to workaround security features in iOS
    if (navigator.userAgent.match('/ipad|ipod|iphone/i')) {
      var el = $('#temp').get(0);
      var editable = el.contentEditable;
      var readOnly = el.readOnly;
      el.contentEditable = true;
      el.readOnly = true;
      var range = document.createRange();
      range.selectNodeContents(el);
      var sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      el.setSelectionRange(0, 999999);
      el.contentEditable = editable;
      el.readOnly = readOnly;
    } else {
      $temp.select();
    }
    document.execCommand('copy');
    $temp.remove();
    $('.copy').attr('title', 'Copied');
  });
}

function handleAcknowledgeButton() {
  $('.acknowledge-button').on('click', function(event) {
    $('.game-incomplete').hide();
    displayGame(CURRENT_GAME);
  });
}

function handlePlayAgainButton() {
  $('.play-again').on('click', function(event) {
    createAndJoinGame();
  });
}

/** Show button to submit players turn, when target point is selected */
function handleSelectTarget() {
  $('.battleship-game-fieldset').on('change', 'input[type=radio]', function() {
    $('.fire').show();
  });
}

function setGameInfo(msg) {
  $('.game-info').html(msg);
}

function generateJoinLink() {
  return `${window.location.origin}/join/${CURRENT_GAME.roomId}`;
}

/**
 * Display results of opponents turn
 * @param {*} coordinates coordinates on the grid where opponent made his turn
 */
function updateOpponentMove(coordinates) {
  const cellId = `board${coordinates.x}${coordinates.y}`;
  console.log(cellId);
  $('.players-board')
    .find(`#${cellId}`)
    .addClass('shot')
    .addClass('anim');
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

/** Display a board where player makes turns and the results of previous turns (hit or miss) */
function displayPlayersTurns() {
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
  CURRENT_GAME.hits.forEach(point => {
    grid[point.x][point.y].state = 'hit';
  });

  CURRENT_GAME.misses.forEach(point => {
    grid[point.x][point.y].state = 'miss';
  });

  // generate html for displaying the grid
  let htmlString = '';
  for (let i = 0; i < 10; i++) {
    htmlString += `<div class="board-row" role="row">`;
    for (j = 0; j < 10; j++) {
      const disabled = grid[j][i].state === 'empty' ? '' : 'disabled';
      htmlString += `<div class="board-column columnwidth ${
        grid[j][i].state
      }" role="cell">
      <label for="${j}${i}">
      <input type="radio" id="${j}${i}" name="cell" ${disabled} required aria-label=${
        ariaLabels[grid[j][i].state]
      }>
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
    .addClass(cellClass)
    .addClass('anim');
  $(`#${cellId}`).prop('checked', false);
  $(`#${cellId}`).attr('disabled', 'disabled');

  // Update turn information
  setOpponetsTurn();

  socket.emit('turn', {
    roomId: CURRENT_GAME.roomId,
    coordinates,
    result: cellClass
  });

  // check if game is finished
  if (data.finished) {
    setGameFinished(true);
    socket.emit('game-finished', {
      roomId: CURRENT_GAME.roomId,
      winner: data.winner
    });
  }

  // update game state in text format
  $('.status-update p').text(
    `You've made a move at coordinates ${coordinates.x + 1}, ${coordinates.y +
      1}. The result is ${cellClass}.`
  );
}

/** Page view when it's opponent's turn */
function setOpponetsTurn() {
  setGameInfo(`Enemy is making a move`);
  $('.battleship-game')
    .find('legend')
    .find('p')
    .text('Enemy ships');
  $('.spinner').show();
  disableForm('battleship-game');
  $('.game').removeClass('players-turn');
  $('.navigation').removeClass('active');
}

/** Page view when it's player's turn */
function setPlayersTurn() {
  setGameInfo('Your move');
  $('.battleship-game')
    .find('legend')
    .find('p')
    .text('Select target');
  $('.spinner').hide();
  enableForm('battleship-game');
  $('.game').addClass('players-turn');
  $('.navigation').addClass('active');
}

/**Page view when current game is finished */
function setGameFinished(isWinner) {
  $('.spinner').hide();
  setGameInfo('Game over');
  $('.game').removeClass('players-turn');
  $('.game-complete')
    .find('p')
    .text(`You ${isWinner ? 'win' : 'loose'}!`);
  $('.game-complete').show();
  disableForm('battleship-game');
  $('.navigation').addClass('active');
  $('.status-update p').text(
    `Game is finished! You ${isWinner ? 'win' : 'loose'}!`
  );
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

  $.ajax(settings);
}

/** Manages current game display based on game status (who's turn, whether game is finished etc)  */
function displayGameInfo() {
  if (!CURRENT_GAME.opponentId) {
    setGameInfo(
      'Waiting for someone to join <a href="" target="_self" aria-label="Go back to previous screen to copy join game link">?</a>'
    );
    return;
  }

  if (CURRENT_GAME.gameFinished) {
    setGameFinished(CURRENT_GAME.winner === CURRENT_GAME.playerId);
    return;
  }

  if (CURRENT_GAME.nextTurn) {
    setPlayersTurn();
  } else {
    setOpponetsTurn();
  }
}

/** Display players ships */
function displayPlayersBoard() {
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
  CURRENT_GAME.ships.forEach(ship => {
    ship.points.forEach(point => (grid[point.x][point.y].state = 'ship'));
  });

  // display opponents moves
  const opponentsMoves = CURRENT_GAME.opponentMoves;
  opponentsMoves.forEach(point => {
    grid[point.x][point.y].state += ' shot';
  });

  // generate html for displaying the grid
  let gridHtml = '';
  for (let i = 0; i < 10; i++) {
    gridHtml += '<div class="board-row" role="row">';
    for (let j = 0; j < 10; j++) {
      let shipCanvas = grid[j][i].state.includes('ship')
        ? `<canvas id="canvas${j}${i}" width="24" height="24"></canvas>`
        : '';
      gridHtml += `<div class="board-column columnwidth" role="cell"><div id="board${j}${i}" class="board ${
        grid[j][i].state
      }" aria-label="${
        ariaLabels[grid[j][i].state]
      }">${shipCanvas}</div></div>`;
    }
    gridHtml += '</div>';
  }

  $('.players-board').html(gridHtml);
  strokeCanvas();
}

/** Stroke player's ships on the board with rough js */
function strokeCanvas() {
  const shipCanvas = $('.players-board').find('canvas');

  shipCanvas.push($('#ship-legend').get(0));

  for (let i = 0; i < shipCanvas.length; i++) {
    const rc = rough.canvas(shipCanvas.get(i));
    rc.rectangle(1, 1, 23, 23, {
      fill: 'black',
      roughness: 1,
      hachureGap: 5
    });
  }
}
