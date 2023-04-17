const ALARM_NAME = 'sonos-battery-check';

async function fetchWithTimeout(resource, options = {}) {
  const { timeout = 1000 } = options;

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  const response = await fetch(resource, {
    ...options,
    signal: controller.signal
  });
  clearTimeout(id);
  return response;
}

async function setBadgeTextToLastBatteryLevelOrEmpty() {
  chrome.action.setBadgeBackgroundColor({ color: 'lightgrey'});
  const batteryLevel = await chrome.storage.local.get('batteryLevel');
  chrome.action.setBadgeText({ text: batteryLevel?.batteryLevel || '...' });
}

function getBatteryStatus() {
  // Make a request to the website to get its status
  const request = fetchWithTimeout('http://192.168.1.161:1400/status/batterystatus');
  // throw new Error(response)
  request.then(response => response.text())
    .then(xmlStr => {
      const batteryLevel = xmlStr.match(/<Data name="Level">(.*?)<\/Data>/)[1];

      // Update the badge with the status value
      if (+batteryLevel > 66) {
        chrome.action.setBadgeBackgroundColor({ color: 'green'});
      } else if (+batteryLevel > 33) {
        chrome.action.setBadgeBackgroundColor({ color: 'yellow'});
      } else {
        chrome.action.setBadgeBackgroundColor({ color: 'lightcoral'});
      }
      chrome.action.setBadgeText({ text: batteryLevel });
      chrome.storage.local.set({ batteryLevel });
    })
    .catch(error => {
      setBadgeTextToLastBatteryLevelOrEmpty();
      console.error('Error fetching website status:', error);
    });
}

async function scrapeOnceAndStartTimer() {
  getBatteryStatus();

  const alarmOrUndefined = await chrome.alarms.get(ALARM_NAME);
  if (alarmOrUndefined) {
    return
  };

  await chrome.alarms.create(
    ALARM_NAME,
    {
      periodInMinutes: 1,
      delayInMinutes: 1
    }
  )
}

chrome.alarms.onAlarm.addListener(async alarm => {
  if (alarm.name === ALARM_NAME) {
    getBatteryStatus();
  }
})

chrome.runtime.onInstalled.addListener(async () => {
  // Start the timer when the extension is installed or updated
  await setBadgeTextToLastBatteryLevelOrEmpty();
  scrapeOnceAndStartTimer();
});

chrome.runtime.onSuspend.addListener(() => {
  // Stop the timer when the extension is suspended (e.g. when the browser is closed)
  chrome.alarms.clear(ALARM_NAME);
});

chrome.runtime.onStartup.addListener(async function() {
  await setBadgeTextToLastBatteryLevelOrEmpty();
  scrapeOnceAndStartTimer();
});

chrome.action.onClicked.addListener(async function() {
  await chrome.action.setBadgeBackgroundColor({ color: 'lightgrey'});
  await chrome.action.setBadgeText({ text: '...' });
  setTimeout(scrapeOnceAndStartTimer, 500);
});
