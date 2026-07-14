# OSRS Bronzeman Unlock Overlay

OBS browser overlay for **Bronzeman mode** partner unlock tracking. Shows item sprites, GP cost, and locked/unlocked status in an Old School RuneScape interface style.

## Quick setup

### Why Chrome control alone won’t drive OBS

OBS Browser Source is a **separate Chromium** with its own `localStorage`. Unlocking in Chrome does not update OBS unless you share a **sync room** (built in) or open control inside OBS itself.

### Recommended: GitHub Pages + sync room

1. Open the **control** page in Chrome:
   `https://rsprence.github.io/osrs-bronzeman-overlay/?view=control`
2. Copy the **Progress** and **Celebration** URLs from the “OBS sync room” panel (they include `&room=...`).
3. In OBS, add two Browser Sources (1920×1080, transparent):

   | Source | URL |
   |--------|-----|
   | Progress overlay | paste Progress URL from control |
   | Celebration overlay | paste Celebration URL from control (above game capture) |

4. Unlock items on the control page — celebration should fire in OBS.

### Local server (optional)

```powershell
npm start
```

Then open `http://localhost:3000/?view=control` and use the room URLs it prints (same idea as above).

## Unlock rules

| Item | Cost |
|------|------|
| Full Void | 20m |
| Fire Cape | 2.5m |
| Full Graceful | 2m |
| Avernic Defender | 30m |
| MA2 Cape | 4.5m |
| Rune Pouch | 3m |
| Ava's Assembler | 8m |
| NMZ Imbue / Arena Scroll | 1m |
| Fighter Torso | 5m |
| POH Unlock | 15m |
| RFD Gloves | 500k |
| Myth Cape | 250k |
| God Books (each) | 250k |
| Herb Sack | 2m |
| Infernal Axe | 2m |
| Rogues' Outfit | 1m |

When an item is unlocked, GP must be stored as **plat tokens** or spent immediately on **skilling supplies**.

## Customization

Edit `data/items.js` to change names, costs, or wiki image names. Item sprites load from the [OSRS Wiki](https://oldschool.runescape.wiki/).

## Move to Cursor Cloud

1. **Push this repo to GitHub** (Git is not installed on this machine yet — install [Git for Windows](https://git-scm.com/download/win), then):
   ```powershell
   cd C:\Users\Prence\Projects\osrs-bronzeman-overlay
   git init
   git add .
   git commit -m "OSRS Bronzeman unlock overlay"
   gh repo create osrs-bronzeman-overlay --public --source=. --push
   ```
   If `origin` already exists, set the URL and push manually:
   ```powershell
   git remote set-url origin https://github.com/rsprence/osrs-bronzeman-overlay.git
   git push -u origin main
   ```
2. **Connect the repo** in [Cursor Cloud Agents → Environments](https://cursor.com/dashboard/cloud-agents#environments).
3. In this chat, click **Move to Cloud** or type `/cloud` to continue work on a cloud VM.

## Deploy to the web (GitHub Pages)

After pushing to GitHub, enable **Pages** under repo Settings → Pages → Source: **GitHub Actions**.

Your live URLs will be:
- Control: `https://<username>.github.io/osrs-bronzeman-overlay/?view=control`
- Progress / Celebration: copy from the control page room panel (must include `&room=...`)

Chrome and OBS do not share localStorage — the room parameter is required for OBS overlays.
