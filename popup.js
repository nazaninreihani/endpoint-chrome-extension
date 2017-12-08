"use strict";
function getTabInfo() {
  const queryInfo = { active: true, currentWindow: true };
  const tab = new Promise((resolve, reject) => {
    chrome.tabs.query(queryInfo, (tabs) => {
      if (tabs) {
        return resolve(tabs[0]);
      }
    });
  });
  return tab;
};

function executeOnTab(tabId, script) {
  const responseOfExecutedScript = new Promise((resolve, reject) => {
    chrome.tabs.executeScript(tabId, { code: script }, (res) => {
      if (res || res == null) {
        return resolve(res);
      } else {
        reject(res);
      }
    });
  });
  return responseOfExecutedScript;
};

const getDefaultAppId = (tabInfo) => {
  if (/staging\.binary\.com/i.test(tabInfo.url)) {
    return 1098;
  } else if (/developers\.binary\.com/i.test(tabInfo.url)) {
    return 1089;
  } else if (/app\.binary\.com/i.test(tabInfo.url)) {
    return 1001;
  } else if (/ticktrade\.binary\.com/i.test(tabInfo.url)) {
    return 10;
  } else if (/webtrader\.binary\.com/i.test(tabInfo.url)) {
    return 11;
  } else if (/www\.binary\.com/i.test(tabInfo.url)) {
    return 1;
  }
}

async function getSocketUrl(tabInfo) {
  const getDefAppIdScript = 'localStorage.getItem("config.default_app_id")';
  let defaultAppId = await executeOnTab(tabInfo.id, getDefAppIdScript);
  if (!defaultAppId[0]) {
    defaultAppId = getDefaultAppId(tabInfo);
  }
  const appId = defaultAppId;
  let server = 'frontend';
  const serverUrl = `${server}.binaryws.com`;
  const socketUrl = `wss://${serverUrl}/websockets/v3`;
  return {
    serverUrl,
    socketUrl,
    appId
  };
};

async function submitNewValues(appId, serverUrl) {
  const tabInfo = await getTabInfo();
  const setAppIdScript = `localStorage.setItem("config.app_id", ${appId})`;
  const setServerUrlScript = `localStorage.setItem("config.server_url", ${JSON.stringify(serverUrl)})`;
  executeOnTab(tabInfo.id, setAppIdScript);
  executeOnTab(tabInfo.id, setServerUrlScript);
  chrome.tabs.update(tabInfo.id, {url: tabInfo.url});
}

async function calculateDefault() {
  const tabInfo = await getTabInfo();
  const socketObj = await getSocketUrl(tabInfo);
  const setAppIdScript = `localStorage.removeItem("config.app_id")`;
  const setServerUrlScript = `localStorage.removeItem("config.server_url")`;
  select('#app-id').value = socketObj.appId;
  select('#server-url').value = socketObj.serverUrl;
  executeOnTab(tabInfo.id, setAppIdScript);
  executeOnTab(tabInfo.id, setServerUrlScript);
  return tabInfo;
}

async function reset() {
  const tabInfo = await calculateDefault();
  chrome.tabs.update(tabInfo.id, {url: tabInfo.url});
};

async function init() {
  const appIdScript = 'localStorage.getItem("config.app_id")';
  const serverUrlScript = 'localStorage.getItem("config.server_url")';
  const tabInfo = await getTabInfo();
  const appId = await executeOnTab(tabInfo.id, appIdScript);
  const serverUrl = await executeOnTab(tabInfo.id, serverUrlScript);
  if (appId[0] != null && serverUrl[0] != null) {
    select('#app-id').value = appId;
    select('#server-url').value = serverUrl;
  } else {
    calculateDefault();
  }
};

document.addEventListener('DOMContentLoaded', () => {
  try {
    init();
    select('#reset').addEventListener('click', () => {
      reset();
    });
    select('#submit').addEventListener('click', () => {
      const appId = select('#app-id').value;
      const serverUrl = select('#server-url').value;
      submitNewValues(appId, serverUrl);
    });
  }

  catch(err) {
    console.log(err)
  }
});
