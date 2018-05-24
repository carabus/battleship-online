$(getOrCreatePlayer);

function handleApp() {
  displayPage();
  handleNewGame();
  handleCopyLink();
}

function displayPage(playerId) {
  $('.player-info').html(`<p>Hello, ${window.localStorage.playerId}</p>`);
  $('.new-game-section').show();
}

function handleNewGame() {
  $('.new-battle').on('click', function(event) {
    const roomId = Date.now();
    window.location.replace(`/join/${roomId}`);
  });
}
