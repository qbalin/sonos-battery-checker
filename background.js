let timerId;

function getWebsiteStatus() {
  // Make a request to the website to get its status
  fetch('http://192.168.1.161:1400/status/batterystatus')
    .then(response => response.text())
    .then(xmlStr => {
      const batteryLevel = xmlStr.match(/<Data name="Level">(.*?)<\/Data>/)[1];
      
      // Update the badge with the status value
      if (+batteryLevel > 66) {
        chrome.action.setBadgeBackgroundColor({ color: 'green'})
      } else if (+batteryLevel > 33) {
        chrome.action.setBadgeBackgroundColor({ color: 'yellow'})
      } else {
        chrome.action.setBadgeBackgroundColor({ color: 'lightcoral'})
      }
      chrome.action.setBadgeText({ text: batteryLevel });
    })
    .catch(error => {
      browser.browserAction.setBadgeBackgroundColor({ color: 'grey'})
      console.error('Error fetching website status:', error);
    });
}

function startTimer() {
  // Set up a timer to periodically check the website status
  timerId = setInterval(getWebsiteStatus, 3000); // Check every 1 minute
}

function stopTimer() {
  // Stop the timer
  clearInterval(timerId);
}

chrome.runtime.onInstalled.addListener(() => {
  // Start the timer when the extension is installed or updated
  startTimer();
});

chrome.runtime.onSuspend.addListener(() => {
  // Stop the timer when the extension is suspended (e.g. when the browser is closed)
  stopTimer();
});