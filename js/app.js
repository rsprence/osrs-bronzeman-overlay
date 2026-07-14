import { ITEMS } from "../data/items.js";
import { formatGp, wikiThumb } from "./format.js";
import {
  loadUnlocks,
  saveUnlocks,
  toggleUnlock,
  resetUnlocks,
  summarize,
  readCelebration,
} from "./storage.js";
import { createCelebrationController } from "./celebration.js";

const view = new URLSearchParams(window.location.search).get("view") || "overlay";
const isControl = view === "control";

const overlayView = document.getElementById("overlay-view");
const controlView = document.getElementById("control-view");
const overlayGrid = document.getElementById("overlay-grid");
const controlGrid = document.getElementById("control-grid");
const overlaySummary = document.getElementById("overlay-summary");
const controlSummary = document.getElementById("control-summary");

const cardById = new Map();
const itemById = new Map(ITEMS.map((item) => [item.id, item]));
let lastUnlocksJson = "";
let lastStatsKey = "";
let lastCelebrationAt = 0;
let celebration = null;

const FALLBACK_ICON = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28"><rect fill="#2b1f0e" width="28" height="28"/><text x="14" y="18" fill="#ff981f" font-size="14" text-anchor="middle" font-family="monospace">?</text></svg>'
)}`;

function renderSummary(container, stats) {
  container.innerHTML = `
    <div class="summary-stat">
      <span class="label">Unlocked</span>
      <span class="value green">${stats.unlocked}/${stats.total}</span>
    </div>
    <div class="summary-stat">
      <span class="label">Spent GP</span>
      <span class="value"><span class="gp-coin"></span>${formatGp(stats.spent)}</span>
    </div>
    <div class="summary-stat">
      <span class="label">Remaining</span>
      <span class="value red"><span class="gp-coin"></span>${formatGp(stats.remaining)}</span>
    </div>
  `;
}

function createItemCard(item, { interactive }) {
  const card = document.createElement("article");
  card.className = `item-card locked${interactive ? " control-card" : ""}`;
  card.dataset.id = item.id;
  card.tabIndex = interactive ? 0 : -1;
  card.title = item.name;

  const iconWrap = document.createElement("div");
  iconWrap.className = "item-icon-wrap";

  const icon = document.createElement("img");
  icon.className = "item-icon";
  icon.src = wikiThumb(item.image);
  icon.alt = "";
  icon.width = 28;
  icon.height = 28;
  icon.decoding = "async";
  icon.addEventListener("error", () => {
    if (icon.src !== FALLBACK_ICON) icon.src = FALLBACK_ICON;
  });

  iconWrap.appendChild(icon);

  const name = document.createElement("span");
  name.className = "item-name";
  name.textContent = item.name;

  const cost = document.createElement("span");
  cost.className = "item-cost";
  cost.innerHTML = `<span class="gp-coin"></span>${formatGp(item.cost)}`;

  const status = document.createElement("span");
  status.className = "item-status locked";
  status.textContent = "LOCKED";

  card.append(iconWrap, name, cost, status);

  if (interactive) {
    card.addEventListener("click", () => {
      toggleUnlock(item.id);
      syncFromStorage();
    });
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggleUnlock(item.id);
        syncFromStorage();
      }
    });
  }

  return card;
}

function updateItemCard(card, unlocked) {
  card.classList.toggle("unlocked", unlocked);
  card.classList.toggle("locked", !unlocked);

  const status = card.querySelector(".item-status");
  status.classList.toggle("unlocked", unlocked);
  status.classList.toggle("locked", !unlocked);
  status.textContent = unlocked ? "UNLOCKED" : "LOCKED";
}

function buildGrid(container, interactive) {
  container.replaceChildren();
  cardById.clear();

  for (const item of ITEMS) {
    const card = createItemCard(item, { interactive });
    cardById.set(item.id, card);
    container.appendChild(card);
  }
}

function maybeCelebrate() {
  if (!celebration) return;
  const event = readCelebration();
  if (!event || event.at <= lastCelebrationAt) return;
  const item = itemById.get(event.id);
  if (!item) return;
  lastCelebrationAt = event.at;
  celebration.play(item);
}

function syncFromStorage() {
  const unlocks = loadUnlocks();
  const unlocksJson = JSON.stringify(unlocks);
  const stats = summarize(unlocks);
  const statsKey = `${stats.unlocked}|${stats.spent}|${stats.remaining}`;

  if (unlocksJson !== lastUnlocksJson) {
    for (const item of ITEMS) {
      updateItemCard(cardById.get(item.id), unlocks[item.id]);
    }
    lastUnlocksJson = unlocksJson;
  }

  if (statsKey !== lastStatsKey) {
    const summaryEl = isControl ? controlSummary : overlaySummary;
    renderSummary(summaryEl, stats);
    lastStatsKey = statsKey;
  }

  if (!isControl) maybeCelebrate();
}

function init() {
  const grid = isControl ? controlGrid : overlayGrid;

  if (isControl) {
    controlView.classList.remove("hidden");
    document.getElementById("btn-reset").addEventListener("click", () => {
      if (confirm("Reset all unlocks to LOCKED?")) {
        resetUnlocks();
        syncFromStorage();
      }
    });
    document.getElementById("btn-lock-all").addEventListener("click", () => {
      const state = Object.fromEntries(ITEMS.map((item) => [item.id, false]));
      saveUnlocks(state);
      syncFromStorage();
    });
  } else {
    overlayView.classList.remove("hidden");
    celebration = createCelebrationController(
      document.getElementById("unlock-celebration")
    );
    // Ignore any leftover celebration event from a previous session.
    const existing = readCelebration();
    if (existing) lastCelebrationAt = existing.at;
  }

  buildGrid(grid, isControl);
  syncFromStorage();

  window.addEventListener("storage", (e) => {
    if (e.key?.includes("osrs-bronzeman-unlocks")) syncFromStorage();
    if (e.key?.includes("osrs-bronzeman-celebration") && !isControl) {
      maybeCelebrate();
    }
  });

  // Poll for OBS browser-source sync; only updates DOM when state actually changes.
  setInterval(syncFromStorage, isControl ? 2000 : 500);
}

init();
