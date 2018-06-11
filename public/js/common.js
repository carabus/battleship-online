/**
 * If there is playerId in local storage -> display app page
 * If no playerId ->
 * make asyncronous call to get playerId
 * then store playerId in local storage
 * then display app page
 */
function getOrCreatePlayer() {
  let playerId = sessionStorage.playerId;
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

function setPlayerAndHandleApp(playerId) {
  setPlayer(playerId);
  handleApp();
}

function setPlayer(playerId) {
  window.sessionStorage.setItem('playerId', playerId);
}

function createAndJoinGame() {
  const roomId = Date.now();
  window.location.replace(`/join/${roomId}`);
}

function displayErrorMessage(msg) {
  let errorMsg = 'Oops... There was an error.';
  if (msg) {
    errorMsg = `${errorMsg} ${msg}`;
  }
  $('.error p').text(errorMsg);
  $('.error').show();
}

function handleDismissErrorMessage() {
  $('.dismiss-error-message').on('click', function(event) {
    $('.error').hide();
  });
}
