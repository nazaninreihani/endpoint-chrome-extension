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

async function getConnectionSetup(url) {
  const connectionSetup = await new Promise((resolve, reject) => {
    const name = 'connection_setup';
    const cookieInfo = {name, url};
    chrome.cookies.get(cookieInfo, function (res) {
      if (res != null) {
        return resolve(res.value);
      } else if (res == null) {
        return resolve(res);
      } else {
        return reject(res);
      }
    });
  });
  return connectionSetup;
};

async function getSocketUrl(connectionSetup, loginid, tabInfo) {
  const appId = /staging\.binary\.com/i.test(tabInfo.url) ? 1098 : 1;
  const toGreenPercent = { real: 100, virtual: 0, logged_out: 0 }; // default percentage
  const categoryMap    = ['real', 'virtual', 'logged_out'];
  const percentValues = connectionSetup || null;
  if (percentValues && percentValues.indexOf(',') > 0) {
    const cookie_percents = percentValues.split(',');
    categoryMap.map((cat, idx) => {
      if (cookie_percents[idx] && !isNaN(cookie_percents[idx])) {
        toGreenPercent[cat] = +cookie_percents[idx].trim();
      }
    });
  };

  let server = 'blue';
  if (!/staging\.binary\.com/i.test(tabInfo.url)) {
    let client_type = categoryMap[2];
    if (loginid) {
      client_type = /^VRT/.test(loginid) ? categoryMap[1] : categoryMap[0];
    }
    const randomPercent = Math.random() * 100;
    if (randomPercent < toGreenPercent[client_type]) {
      server = 'green';
    }
  }
  const serverUrl = `${server}.binaryws.com`;
  const socketUrl = `wss://${serverUrl}/websockets/v3`;
  return {
    serverUrl,
    socketUrl,
    appId
  };
};

function setInStorage(key, value) {
  chrome.storage.sync.set({ key: value });
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
  const loginidScript = 'localStorage.getItem("active_loginid")';
  const connectionSetup = await getConnectionSetup(tabInfo.url);

  const loginidArr = await executeOnTab(tabInfo.id, loginidScript);
  const loginid = loginidArr[0];
  const socketObj = await getSocketUrl(connectionSetup, loginid, tabInfo);
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
    setInStorage('app_id', appId);
    setInStorage('server_url', JSON.stringify(serverUrl));
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
