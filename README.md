# sonos-battery-checker
Display the battery percentage of a Sonos speaker.

Boilerplate code generate by ChatGPT.

# Setup

1. Find the IP address of your Sonos speaker
2. Replace the address in background.js with it
3. [Download the repo](https://github.com/qbalin/sonos-battery-checker/archive/refs/heads/main.zip) and unzip it
4. Navigate to chrome://extensions/
5. Turn on developer mode (top right corner)
6. Load Unpacked -> path to the unziped repo

# What does it do?
Nearly nothing. It just checks for the battery level every minute and displays it as a badge on the extension icon:

<img width="32" alt="Screenshot 2023-04-16 at 6 26 05 PM" src="https://user-images.githubusercontent.com/10332573/232346090-86baa31a-3b13-4b87-b629-727b6430a5a9.png">

Click on the extension button for immediate refresh.

Statuses:
- grey: last known battery level. Coult not connect to device status page (device offline, probably)
- green: more than 66% of battery
- yellow: between 33% and 66% of battery
- red: less than 33% of battery
