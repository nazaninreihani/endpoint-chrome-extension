"use strict";
async function getTabInfo() {
  const queryInfo = { active: true, currentWindow: true };
  const tab = await new Promise((resolve, reject) => {
    chrome.tabs.query(queryInfo, (tabs) => {
      if (tabs) {
        return resolve(tabs[0]);
      }
    });
  });
  return tab;
};


async function executeOnTab(tabId, script) {
  const responseOfExecutedScript = await new Promise((resolve, reject) => {
    chrome.tabs.executeScript(tabId, { code: script }, (res) => {
      if (res) {
        return resolve(res);
      }
    });
  });
  return responseOfExecutedScript;
};

document.addEventListener('DOMContentLoaded', () => {
  try {
    async function getAppId() {
      const appIdScript = 'localStorage.getItem("config.app_id")';
      const serverUrlScript = 'localStorage.getItem("config.server_url")';
      const tabInfo = await getTabInfo();
      const appId = await executeOnTab(tabInfo.id, appIdScript);
      const serverUrl = await executeOnTab(tabInfo.id, serverUrlScript);
      select('#app-id').value = appId;
      select('#server-url').value = serverUrl;
      console.log(serverUrl);
    };
    getAppId();

  }

  catch(err) {
    console.log(err)
  }

});





// document.addEventListener('DOMContentLoaded', () => {
//   try {
//
//   }
//   catch(err) {
//     // console.log(err);
//   }
// });
//
// document.addEventListener('DOMContentLoaded', () => {
//   document.getElementById('button').addEventListener('click', () => {
//     const appIdValue = document.getElementById("app-id").value;
//     const serverURLValue = document.getElementById("server-url").value;
//     chrome.tabs.query({
//       active: true,
//       currentWindow: true
//     }, tabs => {
//       const tab = tabs[0];
//       chrome.tabs.executeScript(tab.id, { code: `localStorage.setItem("config.app_id", ${appIdValue} )` });
//       chrome.tabs.executeScript(tab.id, { code: `localStorage.setItem("config.server_url", ${JSON.stringify(serverURLValue)} )` });
//       chrome.tabs.update(tabs[0].id, {url: tabs[0].url});
//     });
//   });
// });
//
//
