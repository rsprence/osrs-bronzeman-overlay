import { ITEMS, STORAGE_KEY, CELEBRATION_KEY } from "../data/items.js";

export const CHANNEL_NAME = "osrs-bronzeman";

let channel = null;
try {
  channel = new BroadcastChannel(CHANNEL_NAME);
} catch {
  channel = null;
}

function defaultState() {
  return Object.fromEntries(ITEMS.map((item) => [item.id, false]));
}

export function publishCelebration(itemId) {
  const payload = { id: itemId, at: Date.now() };
  localStorage.setItem(CELEBRATION_KEY, JSON.stringify(payload));
  try {
    channel?.postMessage({ type: "celebration", ...payload });
  } catch {
    // ignore
  }
}

export function readCelebration() {
  try {
    const raw = localStorage.getItem(CELEBRATION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed.id !== "string" || typeof parsed.at !== "number") {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function loadUnlocks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    const state = defaultState();
    for (const item of ITEMS) {
      if (typeof parsed[item.id] === "boolean") {
        state[item.id] = parsed[item.id];
      }
    }
    return state;
  } catch {
    return defaultState();
  }
}

export function saveUnlocks(unlocks) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(unlocks));
}

export function toggleUnlock(id) {
  const unlocks = loadUnlocks();
  const nowUnlocked = !unlocks[id];
  unlocks[id] = nowUnlocked;
  saveUnlocks(unlocks);
  if (nowUnlocked) publishCelebration(id);
  return unlocks;
}

export function resetUnlocks() {
  saveUnlocks(defaultState());
  return defaultState();
}

export function summarize(unlocks) {
  let unlocked = 0;
  let spent = 0;
  let remaining = 0;

  for (const item of ITEMS) {
    if (unlocks[item.id]) {
      unlocked += 1;
      spent += item.cost;
    } else {
      remaining += item.cost;
    }
  }

  return {
    total: ITEMS.length,
    unlocked,
    locked: ITEMS.length - unlocked,
    spent,
    remaining,
  };
}
