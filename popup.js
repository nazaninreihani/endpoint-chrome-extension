document.addEventListener('DOMContentLoaded', () => {
  try {
    chrome.tabs.query({
      active: true,
      currentWindow: true
    }, tabs => {
      const tab = tabs[0];
      chrome.tabs.executeScript(tab.id, { code: 'localStorage.getItem("config.app_id")' }, res => {
        chrome.storage.sync.set({'app_id': res[0]}, () => {
          chrome.tabs.executeScript(tab.id, { code: 'localStorage.getItem("config.server_url")' }, res => {
            chrome.storage.sync.set({'server_url': res[0]});
          });
        });
      });
    });
  }
  catch(err) {
    // console.log(err);
  }
});

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('button').addEventListener('click', () => {
    const appIdValue = document.getElementById("app-id").value;
    const serverURLValue = document.getElementById("server-url").value;
    chrome.tabs.query({
      active: true,
      currentWindow: true
    }, tabs => {
      const tab = tabs[0];
      chrome.tabs.executeScript(tab.id, { code: `localStorage.setItem("config.app_id", ${appIdValue} )` });
      chrome.tabs.executeScript(tab.id, { code: `localStorage.setItem("config.server_url", ${JSON.stringify(serverURLValue)} )` });
      chrome.tabs.update(tabs[0].id, {url: tabs[0].url});
    });
  });
});


