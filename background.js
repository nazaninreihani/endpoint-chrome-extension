// When the extension is installed or upgraded ...
chrome.runtime.onInstalled.addListener(function() {
  // Replace all rules ...
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
    // With a new rule ...
    chrome.declarativeContent.onPageChanged.addRules([
      {
        // That fires when a page's URL contains a 'g' ...
        conditions: [
          new chrome.declarativeContent.PageStateMatcher({
            pageUrl: { urlContains: '.binary.com' },
          })
        ],
        // And shows the extension's page action.
        actions: [ new chrome.declarativeContent.ShowPageAction() ]
      }
    ]);
  });
});

document.addEventListener('DOMContentLoaded', function () {
    chrome.storage.sync.get(['app_id'], function(res) {
        document.getElementById('app-id').value = res.app_id;
    });
  chrome.storage.sync.get(['server-url'], function(res) {
    document.getElementById('server-url').value = res.server_url || 'blue.binaryws.com';
  });
});


chrome.storage.onChanged.addListener(function(changes, area) {
  console.log(changes);
  if (area == "sync" && "app_id" in changes) {
    console.log(changes.app_id.newValue);
    appID = changes.app_id.newValue;
    document.getElementById('app-id').value = changes.app_id.newValue;
  } else if (area == "sync" && "server_url" in changes) {
    document.getElementById('server-url').value = changes.server_url.newValue;
  }
});




