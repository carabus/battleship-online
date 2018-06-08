/**
 * If there is playerId in local storage -> display app page
 * If no playerId ->
 * make asyncronous call to get playerId
 * then store playerId in local storage
 * then display app page
 */
function getOrCreatePlayer() {
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

function setPlayerAndHandleApp(playerId) {
  setPlayer(playerId);
  handleApp();
}

function setPlayer(playerId) {
  window.localStorage.setItem('playerId', playerId);
}

function createAndJoinGame() {
  const roomId = Date.now();
  window.location.replace(`/join/${roomId}`);
}

function displayErrorMessage() {
  $('.error')
    .find('p')
    .text('Oops... There was an error.');
  $('.error').show();
}

function handleDismissErrorMessage() {
  $('.dismiss-error-message').on('click', function(event) {
    $('.error').hide();
  });
}
