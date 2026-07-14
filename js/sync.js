/** Cross-browser sync for OBS ↔ Chrome via ntfy.sh public topics. */

export const ROOM_KEY = "osrs-bronzeman-room-v1";
const TOPIC_PREFIX = "osrsbm-";

function randomRoom() {
  const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
  let out = "";
  const bytes = crypto.getRandomValues(new Uint8Array(10));
  for (const b of bytes) out += alphabet[b % alphabet.length];
  return out;
}

export function getRoomFromUrl() {
  const room = new URLSearchParams(window.location.search).get("room");
  if (!room) return null;
  const cleaned = room.toLowerCase().replace(/[^a-z0-9]/g, "");
  return cleaned.length >= 4 ? cleaned.slice(0, 24) : null;
}

/** Resolve sync room for this page. Control invents one if missing. */
export function resolveRoom({ createIfMissing = false } = {}) {
  const fromUrl = getRoomFromUrl();
  if (fromUrl) {
    localStorage.setItem(ROOM_KEY, fromUrl);
    return fromUrl;
  }
  const stored = localStorage.getItem(ROOM_KEY);
  if (stored && /^[a-z0-9]{4,24}$/.test(stored)) return stored;
  if (!createIfMissing) return null;
  const created = randomRoom();
  localStorage.setItem(ROOM_KEY, created);
  return created;
}

export function topicForRoom(room) {
  return `${TOPIC_PREFIX}${room}`;
}

export function urlsForRoom(room) {
  const progress = new URL(window.location.href);
  const celebration = new URL(window.location.href);
  const control = new URL(window.location.href);
  for (const [url, view] of [
    [progress, "overlay"],
    [celebration, "celebration"],
    [control, "control"],
  ]) {
    url.search = "";
    url.hash = "";
    url.searchParams.set("view", view);
    url.searchParams.set("room", room);
  }
  return {
    room,
    progress: progress.toString(),
    celebration: celebration.toString(),
    control: control.toString(),
  };
}

export async function publishRemote(room, payload) {
  if (!room) return;
  const topic = topicForRoom(room);
  const body = JSON.stringify(payload);
  try {
    await fetch(`https://ntfy.sh/${topic}`, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body,
    });
  } catch (err) {
    console.warn("Remote sync publish failed", err);
  }
}

function parseNtfyLine(line) {
  const trimmed = line.trim();
  if (!trimmed) return null;
  try {
    const envelope = JSON.parse(trimmed);
    if (envelope.event && envelope.event !== "message") return null;
    if (typeof envelope.message !== "string") return null;
    return JSON.parse(envelope.message);
  } catch {
    return null;
  }
}

/** Pull recent messages (for late-joining OBS sources). */
export async function pollRemote(room, { since = "1h" } = {}) {
  if (!room) return [];
  const topic = topicForRoom(room);
  try {
    const res = await fetch(`https://ntfy.sh/${topic}/json?poll=1&since=${encodeURIComponent(since)}`);
    const text = await res.text();
    const events = [];
    for (const line of text.split("\n")) {
      const parsed = parseNtfyLine(line);
      if (parsed) events.push(parsed);
    }
    return events;
  } catch (err) {
    console.warn("Remote sync poll failed", err);
    return [];
  }
}

/**
 * Subscribe to remote unlock/celebration events.
 * Returns an unsubscribe function.
 */
export function subscribeRemote(room, onEvent) {
  if (!room) return () => {};

  const topic = topicForRoom(room);
  let source = null;
  let closed = false;
  let retryTimer = 0;

  const handlePayload = (payload) => {
    if (!payload || typeof payload !== "object") return;
    if (payload.type !== "celebration" && payload.type !== "state") return;
    onEvent(payload);
  };

  const connect = () => {
    if (closed) return;
    source = new EventSource(`https://ntfy.sh/${topic}/sse?since=10m`);
    source.onmessage = (e) => {
      try {
        const envelope = JSON.parse(e.data);
        if (envelope.event && envelope.event !== "message") return;
        if (typeof envelope.message !== "string") return;
        handlePayload(JSON.parse(envelope.message));
      } catch {
        // ignore malformed
      }
    };
    source.onerror = () => {
      source?.close();
      source = null;
      if (!closed) {
        clearTimeout(retryTimer);
        retryTimer = setTimeout(connect, 2000);
      }
    };
  };

  // Catch anything published just before we connected.
  pollRemote(room, { since: "1h" }).then((events) => {
    for (const event of events) handlePayload(event);
    if (!closed) connect();
  });

  return () => {
    closed = true;
    clearTimeout(retryTimer);
    source?.close();
  };
}
