$(getOrCreatePlayer);

function handleApp() {
  joinGame(displayGame);
}

function joinGame(callback) {
  const dataObject = {
    playerId: localStorage.playerId,
    roomId: roomId
  };

  console.log(dataObject);

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
  window.location.replace(`/game/${data.id}`);
}

function displayErrorMessage() {
  $('.error-message').text('There was an error retrieving your games');
}
