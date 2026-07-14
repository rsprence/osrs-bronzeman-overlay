import { ITEMS, STORAGE_KEY, CELEBRATION_KEY } from "../data/items.js";
import { publishRemote } from "./sync.js";

export const CHANNEL_NAME = "osrs-bronzeman";

let channel = null;
let syncRoom = null;
const senderId =
  sessionStorage.getItem("osrs-bronzeman-sender") ||
  (() => {
    const id = Math.random().toString(36).slice(2, 10);
    sessionStorage.setItem("osrs-bronzeman-sender", id);
    return id;
  })();

try {
  channel = new BroadcastChannel(CHANNEL_NAME);
} catch {
  channel = null;
}

/** Enable ntfy publish target for this page (Chrome → OBS). */
export function setSyncRoom(room) {
  syncRoom = room || null;
}

function defaultState() {
  return Object.fromEntries(ITEMS.map((item) => [item.id, false]));
}

export function publishCelebration(itemId) {
  const unlocks = loadUnlocks();
  const payload = {
    type: "celebration",
    id: itemId,
    at: Date.now(),
    unlocks,
    sender: senderId,
  };
  localStorage.setItem(CELEBRATION_KEY, JSON.stringify({ id: itemId, at: payload.at }));
  try {
    channel?.postMessage({ type: "celebration", ...payload });
  } catch {
    // ignore
  }
  publishRemote(syncRoom, payload);
}

export function publishState() {
  const payload = {
    type: "state",
    at: Date.now(),
    unlocks: loadUnlocks(),
    sender: senderId,
  };
  try {
    channel?.postMessage(payload);
  } catch {
    // ignore
  }
  publishRemote(syncRoom, payload);
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

/** Write unlocks locally. If `broadcast` is true, push to peers/OBS. */
export function saveUnlocks(unlocks, { broadcast = true } = {}) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(unlocks));
  if (broadcast) publishState();
}

export function applyRemoteUnlocks(unlocks) {
  const state = defaultState();
  for (const item of ITEMS) {
    if (typeof unlocks?.[item.id] === "boolean") {
      state[item.id] = unlocks[item.id];
    }
  }
  // Local only — avoid echo republish loops.
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  return state;
}

export function toggleUnlock(id) {
  const unlocks = loadUnlocks();
  const nowUnlocked = !unlocks[id];
  unlocks[id] = nowUnlocked;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(unlocks));
  if (nowUnlocked) {
    publishCelebration(id);
  } else {
    publishState();
  }
  return unlocks;
}

export function resetUnlocks() {
  const state = defaultState();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  publishState();
  return state;
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

export function getSenderId() {
  return senderId;
}
