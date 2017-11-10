document.getElementById('button').addEventListener('click', function () {
  document.getElementById('xx').style.color = 'red';
  chrome.cookies.get({url: 'https://staging.binary.com/en/endpoint.html', name: 'connection_setup'}, function (cookie) {
    console.log(cookie);
  });

});
