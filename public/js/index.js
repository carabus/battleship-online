// playerId needs to be created before further interaction with a page
$(getOrCreatePlayer);

function handleApp() {
  displayPage();
  handleNewGame();
  handlePlayerUpdate();
  handleHelp();
  handleDismissErrorMessage();
}

function displayPage(playerId) {
  $('.player').text(sessionStorage.playerId);
  $('.new-game-section').show();
}

function handleNewGame() {
  $('.new-battle').on('click', function(event) {
    createAndJoinGame();
  });
}

function handleHelp() {
  $('.whats-this').on('click', function(event) {
    event.preventDefault();
    $('body').chardinJs('toggle');
  });
}

function handlePlayerUpdate() {
  $('.player').on('click', function(event) {
    createPlayerName(function(playerId) {
      setPlayer(playerId);
      $('.player').text(sessionStorage.playerId);
    });
  });
}
