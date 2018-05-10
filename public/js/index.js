$(handleApp);

function handleApp() {
  getOrCreatePlayer();
  handleNewGame();
  handleCopyLink();
}

function getOrCreatePlayer() {
  // if no player id only display create player
  let playerId = window.localStorage.getItem('playerId');
  if (playerId) {
    displayPage(playerId);
  } else {
    createPlayerName(displayPage);
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
    callback('grotesque-firefly');
  }, 100);
}

function displayPage(playerId) {
  $('.player-info').html(`<p>Hello, ${playerId}</p>`);
  $('.new-game-section').show();
}

function displayErrorMessage() {
  $('.error-message').text('There was an error processing your request.');
}

function handleNewGame() {
  $('.new-battle').on('click', function(event) {
    const roomId = Date.now();
    const newGameLink = `${window.location.href}join/${roomId}`;
    $('.join-game-link').attr('href', newGameLink);
    $('.join-game-link').text(newGameLink);
    $('.link').show();
  });
}

function handleCopyLink() {
  $('.copy').on('click', function(event) {
    var $temp = $('<input>');
    $('body').append($temp);
    console.log($('.join-game-link').text());
    $temp.val($('.join-game-link').text()).select();
    document.execCommand('copy');
    $temp.remove();
  });
}
