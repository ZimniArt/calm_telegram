// content.js - Telegram Calm (FINAL FIXED VERSION)

// ID of injected <style>
const STYLE_ID = 'telegram-calm-prehide-style';

// CSS that hides known containers BEFORE Telegram renders them
const PREHIDE_CSS = `
  /* Hides subscriber/member containers early to prevent flash */
  .info,
  .profile-subtitle-text,

  /* Common view counters */
  span.post-views,
  .post-views,

  /* Story footer 'No views yet' */
  ._ViewerStoryFooterLeft_13e91_342 {
    visibility: hidden !important;
  }
`;

let observer = null;
let enabled = true;

// --- Inject pre-hide CSS ---
function addPrehideStyle() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = PREHIDE_CSS;
  document.documentElement.appendChild(style);
}

function removePrehideStyle() {
  const el = document.getElementById(STYLE_ID);
  if (el) el.remove();
}

// --- Hide logic ---
function hideCounters(root = document) {
  // hide text-based counters
  root.querySelectorAll("span.i18n").forEach(el => {
    const t = (el.textContent || "").toLowerCase();

    if (
      t.includes("subscriber") ||
      t.includes("subscribers") ||
      t.includes("member") ||
      t.includes("members") ||
      t.includes("views") ||
      t.includes("no views yet")
    ) {
      el.dataset.tcHidden = "1";
      el.style.display = "none";

      if (el.parentElement) {
        el.parentElement.dataset.tcHidden = "1";
        el.parentElement.style.display = "none";
      }
    }
  });

  // numeric view counters
  root.querySelectorAll("span.post-views, .post-views").forEach(el => {
    el.dataset.tcHidden = "1";
    el.style.display = "none";
  });

  // story view footer
  root.querySelectorAll("._ViewerStoryFooterLeft_13e91_342").forEach(el => {
    el.dataset.tcHidden = "1";
    el.style.display = "none";
  });

  // time-inner blocks with view icon
  root.querySelectorAll("div.time-inner").forEach(el => {
    if (
      el.querySelector(".time-icon-views") ||
      el.querySelector(".tgico.time-icon.time-part.time-icon-views")
    ) {
      el.dataset.tcHidden = "1";
      el.style.display = "none";
    }
  });
}

// --- Restore logic ---
function restoreAllHidden() {
  document.querySelectorAll("[data-tc-hidden='1']").forEach(el => {
    el.style.display = "";
    delete el.dataset.tcHidden;
  });
}

// --- MutationObserver ---
function startObserver() {
  if (observer) return;
  observer = new MutationObserver(mutations => {
    for (const m of mutations) {
      for (const node of m.addedNodes) {
        if (node.nodeType === 1) hideCounters(node);
      }
    }
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
}

function stopObserver() {
  if (observer) observer.disconnect();
  observer = null;
}

// --- Toggle functionality ---
function enableFeature() {
  addPrehideStyle();
  hideCounters(document);
  startObserver();
  enabled = true;
}

function disableFeature() {
  stopObserver();
  removePrehideStyle();
  restoreAllHidden();
  enabled = false;
}

// --- React to popup toggle changes ---
chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== "sync") return;
  if (changes.telegramCalmEnabled) {
    if (changes.telegramCalmEnabled.newValue) enableFeature();
    else disableFeature();
  }
});

// --- INITIAL LOAD ---
chrome.storage.sync.get({ telegramCalmEnabled: true }, prefs => {
  if (prefs.telegramCalmEnabled) enableFeature();
  else disableFeature();

  // Fix delayed Telegram rendering (flash prevention)
  setTimeout(() => enabled && hideCounters(), 500);
  setTimeout(() => enabled && hideCounters(), 1500);
});

// --- URL-change detection (Telegram uses internal routing) ---
let lastUrl = location.href;
setInterval(() => {
  if (location.href !== lastUrl) {
    lastUrl = location.href;
    if (enabled) {
      hideCounters();
      setTimeout(() => hideCounters(), 200);
    }
  }
}, 300);
