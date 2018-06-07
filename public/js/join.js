// playerId needs to be created before further interaction with a page
$(getOrCreatePlayer);

function handleApp() {
  joinGame(displayGame);
  handleDismissErrorMessage();
}

/** Send API request to create new game for this playerId */
function joinGame(callback) {
  const dataObject = {
    playerId: localStorage.playerId,
    roomId: roomId
  };

  let settings = {
    contentType: 'application/json',
    url: '/battleship',
    dataType: 'json',
    data: JSON.stringify(dataObject),
    type: 'POST',
    success: callback,
    error: displayErrorMessage
  };

  $.ajax(settings);
}

function displayGame(data) {
  // once we get id of newly created game, game page handles it
  window.location.replace(`/game/${data.id}`);
}
