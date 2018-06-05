function setPlayerAndHandleApp(playerId) {
  setPlayer(playerId);
  handleApp();
}

function setPlayer(playerId) {
  window.localStorage.setItem('playerId', playerId);
}

function getOrCreatePlayer() {
  // if no player id only display create player
  let playerId = window.localStorage.getItem('playerId');
  if (playerId) {
    handleApp();
  } else {
    createPlayerName(setPlayerAndHandleApp);
  }
}

function createPlayerName(callback) {
  let settings = {
    url: '/player',
    dataType: 'json',
    type: 'GET',
    success: function(data) {
      callback(data.playerId);
    },
    error: displayErrorMessage
  };

  $.ajax(settings);
}

function displayErrorMessage() {
  $('.error').text('Oops... There was an error.');
  $('.error').show();
}

function createAndJoinGame() {
  const roomId = Date.now();
  window.location.replace(`/join/${roomId}`);
}
