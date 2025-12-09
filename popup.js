// popup.js - simple UI to toggle the feature
const checkbox = document.getElementById('toggle');

// read current value and set checkbox
chrome.storage.sync.get({ telegramCalmEnabled: true }, prefs => {
  checkbox.checked = !!prefs.telegramCalmEnabled;
});

// when user toggles, save new value (content script will react via storage.onChanged)
checkbox.addEventListener('change', () => {
  const enabled = checkbox.checked;
  chrome.storage.sync.set({ telegramCalmEnabled: enabled });
});
