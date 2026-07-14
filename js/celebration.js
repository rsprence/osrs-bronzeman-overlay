import { formatGp, wikiThumb } from "./format.js";

const FALLBACK_ICON = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect fill="#2b1f0e" width="64" height="64"/><text x="32" y="40" fill="#ff981f" font-size="28" text-anchor="middle" font-family="monospace">?</text></svg>'
)}`;

const HOLD_MS = 4800;
const FADE_MS = 900;

/**
 * Full-screen unlock celebration for OBS viewers.
 * Dark takeover → burst → hero item → fade back to the grid.
 */
export function createCelebrationController(root) {
  const el = root;
  const icon = el.querySelector(".unlock-celebration__icon");
  const nameEl = el.querySelector(".unlock-celebration__name");
  const costEl = el.querySelector(".unlock-celebration__cost");
  const canvas = el.querySelector(".unlock-celebration__particles");
  const ctx = canvas.getContext("2d");

  let busy = false;
  let queue = [];
  let raf = 0;
  let particles = [];
  let animStart = 0;
  let endTimer = 0;
  let fadeTimer = 0;

  function resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function spawnBurst() {
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    const colors = ["#ffe566", "#ff981f", "#c9a000", "#ffffff", "#8b6914", "#00ff00"];
    particles = [];

    for (let i = 0; i < 90; i++) {
      const angle = (Math.PI * 2 * i) / 90 + Math.random() * 0.2;
      const speed = 2.5 + Math.random() * 9;
      particles.push({
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.5,
        life: 1,
        decay: 0.008 + Math.random() * 0.012,
        size: 2 + Math.random() * 5,
        color: colors[i % colors.length],
        spin: (Math.random() - 0.5) * 0.3,
        rot: Math.random() * Math.PI,
        kind: Math.random() > 0.55 ? "spark" : "coin",
      });
    }

    // Secondary delayed pop
    for (let i = 0; i < 40; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 4;
      particles.push({
        x: cx + (Math.random() - 0.5) * 80,
        y: cy + (Math.random() - 0.5) * 80,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 3,
        life: 1,
        decay: 0.006 + Math.random() * 0.01,
        size: 1.5 + Math.random() * 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        spin: (Math.random() - 0.5) * 0.4,
        rot: 0,
        kind: "spark",
        delay: 12 + Math.random() * 20,
      });
    }
  }

  function drawParticles(now) {
    const w = window.innerWidth;
    const h = window.innerHeight;
    ctx.clearRect(0, 0, w, h);

    const t = (now - animStart) / 1000;
    // Soft radial bloom behind the item
    const glow = ctx.createRadialGradient(w / 2, h / 2, 20, w / 2, h / 2, Math.min(w, h) * 0.45);
    glow.addColorStop(0, `rgba(255, 200, 40, ${Math.max(0, 0.35 - t * 0.05)})`);
    glow.addColorStop(0.45, `rgba(255, 152, 31, ${Math.max(0, 0.12 - t * 0.02)})`);
    glow.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, h);

    for (const p of particles) {
      if (p.delay && p.delay > 0) {
        p.delay -= 1;
        continue;
      }
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.08;
      p.vx *= 0.99;
      p.life -= p.decay;
      p.rot += p.spin;
      if (p.life <= 0) continue;

      ctx.save();
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      if (p.kind === "coin") {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size, p.size * 0.7, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "rgba(0,0,0,0.35)";
        ctx.lineWidth = 1;
        ctx.stroke();
      } else {
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      }
      ctx.restore();
    }

    particles = particles.filter((p) => p.life > 0 || (p.delay && p.delay > 0));
    raf = requestAnimationFrame(drawParticles);
  }

  function stopParticles() {
    cancelAnimationFrame(raf);
    raf = 0;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    particles = [];
  }

  function finish() {
    el.classList.remove("is-active", "is-leaving");
    el.classList.add("hidden");
    el.setAttribute("aria-hidden", "true");
    stopParticles();
    busy = false;
    if (queue.length) {
      const next = queue.shift();
      play(next);
    }
  }

  function play(item) {
    if (busy) {
      queue.push(item);
      return;
    }
    busy = true;
    clearTimeout(endTimer);
    clearTimeout(fadeTimer);

    resizeCanvas();
    icon.src = wikiThumb(item.image);
    icon.alt = item.name;
    icon.onerror = () => {
      if (icon.src !== FALLBACK_ICON) icon.src = FALLBACK_ICON;
    };
    nameEl.textContent = item.name;
    costEl.innerHTML = `<span class="gp-coin"></span>${formatGp(item.cost)}`;

    el.classList.remove("hidden", "is-leaving");
    el.setAttribute("aria-hidden", "false");
    // Retrigger CSS enter animations
    void el.offsetWidth;
    el.classList.add("is-active");

    animStart = performance.now();
    spawnBurst();
    raf = requestAnimationFrame(drawParticles);

    endTimer = setTimeout(() => {
      el.classList.add("is-leaving");
      fadeTimer = setTimeout(finish, FADE_MS);
    }, HOLD_MS);
  }

  window.addEventListener("resize", () => {
    if (busy) resizeCanvas();
  });

  return {
    play,
    get isBusy() {
      return busy;
    },
  };
}
