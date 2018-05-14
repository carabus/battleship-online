function setPlayerAndHandleApp(data) {
  window.localStorage.setItem('playerId', data.playerId);
  handleApp();
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
  /*
  let settings = {
    url: '/player',
    dataType: 'json',
    type: 'GET',
    success: function(response) {
      callback(data.playerId);
    },
    error: displayErrorMessage
  };

  $.ajax(settings);*/
  setTimeout(function() {
    callback({ playerId: 'grotesque-firefly' });
  }, 100);
}
