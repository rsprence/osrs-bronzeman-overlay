import { ITEMS, STORAGE_KEY } from "../data/items.js";

function defaultState() {
  return Object.fromEntries(ITEMS.map((item) => [item.id, false]));
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
  unlocks[id] = !unlocks[id];
  saveUnlocks(unlocks);
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
