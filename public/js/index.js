$(getOrCreatePlayer);

function handleApp() {
  displayPage();
  handleNewGame();
  handlePlayerUpdate();
  handleHelp();
}

function displayPage(playerId) {
  $('.player').text(window.localStorage.playerId);
  $('.new-game-section').show();
}

function handleNewGame() {
  $('.new-battle').on('click', function(event) {
    const roomId = Date.now();
    window.location.replace(`/join/${roomId}`);
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
      $('.player').text(window.localStorage.playerId);
    });
  });
}
