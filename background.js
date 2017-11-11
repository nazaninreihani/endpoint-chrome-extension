// When the extension is installed or upgraded ...
chrome.runtime.onInstalled.addListener(() => {
  // Replace all rules ...
  chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
    // With a new rule ...
    chrome.declarativeContent.onPageChanged.addRules([
      {
        // That fires when a page's URL contains a '.binary.com' ...
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

document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.sync.get(['app_id'], res => {
        document.getElementById('app-id').value = res.app_id || 1098;
    });
  chrome.storage.sync.get(['server-url'], res => {
    document.getElementById('server-url').value = res.server_url || 'blue.binaryws.com';
  });
});


chrome.storage.onChanged.addListener((changes, area) => {
  if (area == "sync" && "app_id" in changes) {
    console.log(changes.app_id.newValue);
    appID = changes.app_id.newValue;
    document.getElementById('app-id').value = changes.app_id.newValue;
  } else if (area == "sync" && "server_url" in changes) {
    document.getElementById('server-url').value = changes.server_url.newValue;
  }
});



