chrome.storage.sync.set({'app_id': '15'}, function() {
  // Notify that we saved.
  console.log('Settings saved');
  chrome.storage.sync.get({'value': 'app_id'}, function(response) {
    // Notify that we saved.
    console.log(response);
  });
});


