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
