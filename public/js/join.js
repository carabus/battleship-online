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
  /*
  let settings = {
    contentType: 'application/json',
    url: '/battleship/join',
    dataType: 'json',
    data: JSON.stringify(dataObject),
    type: 'POST',
    success: callback,
    error: displayErrorMessage
  };

  $.ajax(settings);*/
  setTimeout(function() {
    callback({ id: '1234567890' });
  }, 100);
}

function displayGame(data) {
  window.location.replace(`/game/${data.id}`);
}

function displayErrorMessage() {
  $('.error-message').text('There was an error retrieving your games');
}
