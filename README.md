# OSRS Bronzeman Unlock Overlay

OBS browser overlay for **Bronzeman mode** partner unlock tracking. Shows item sprites, GP cost, and locked/unlocked status in an Old School RuneScape interface style.

## Quick setup

1. **Start a local server** (required so OBS and the control panel share unlock state):

   ```powershell
   cd C:\Users\Prence\Projects\osrs-bronzeman-overlay
   npm start
   ```

   Or with Python:

   ```powershell
   python -m http.server 8080
   ```

2. **Add OBS Browser Sources:**

   | Source | URL | Notes |
   |--------|-----|-------|
   | Progress overlay | `http://localhost:3000/?view=overlay` | Unlock board HUD |
   | Celebration overlay | `http://localhost:3000/?view=celebration` | Transparent until unlock; full-screen takeover |
   | Control (off-stream) | `http://localhost:3000/?view=control` | Toggle unlocks |

   Adjust port if using Python (`8080`). Put the celebration source **above** the game capture so it can cover the whole canvas.

3. **OBS settings for both overlay sources:**
   - Width: **1920**, Height: **1080** (full canvas)
   - Background: transparent (default)

4. **Toggle unlocks** on the control page while you play. The progress overlay updates automatically. Unlocking an item fires the celebration overlay (hero item, flash, particles), then it goes transparent again.

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
- Progress: `https://<username>.github.io/osrs-bronzeman-overlay/?view=overlay`
- Celebration: `https://<username>.github.io/osrs-bronzeman-overlay/?view=celebration`
- Control: `https://<username>.github.io/osrs-bronzeman-overlay/?view=control`

Use these in OBS instead of `localhost` — no local server needed. Put celebration above game capture.
