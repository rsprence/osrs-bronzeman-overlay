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

   | Source | URL |
   |--------|-----|
   | Overlay (on stream) | `http://localhost:3000/?view=overlay` |
   | Control (off-stream) | `http://localhost:3000/?view=control` |

   Adjust port if using Python (`8080`).

3. **OBS settings for the overlay source:**
   - Width: **1920**, Height: **1080** (full canvas — all items visible, no scroll)
   - Background: transparent (default)

4. **Toggle unlocks** on the control page while you play. The overlay updates automatically.

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

1. **Push this repo to GitHub** — use either method below.
2. **Connect the repo** in [Cursor Cloud Agents → Environments](https://cursor.com/dashboard/cloud-agents#environments).
3. In this chat, click **Move to Cloud** or type `/cloud` to continue work on a cloud VM.

### Option A — GitHub website (no `gh` CLI needed)

1. Create a new empty repo at [github.com/new](https://github.com/new) named `osrs-bronzeman-overlay` (public, **no** README/license).
2. Run these commands in PowerShell (use full path if `git` isn't recognized):

```powershell
cd C:\Users\Prence\Projects\osrs-bronzeman-overlay
& "C:\Program Files\Git\bin\git.exe" remote add origin https://github.com/YOUR_USERNAME/osrs-bronzeman-overlay.git
& "C:\Program Files\Git\bin\git.exe" push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username. Sign in when the browser/auth prompt appears.

### Option B — Install GitHub CLI (optional)

```powershell
winget install GitHub.cli
```

Restart PowerShell, then run `gh auth login` and `gh repo create osrs-bronzeman-overlay --public --source=. --push`.

## Deploy to the web (GitHub Pages)

After pushing to GitHub, enable **Pages** under repo Settings → Pages → Source: **GitHub Actions**.

Your live URLs will be:
- Overlay: `https://<username>.github.io/osrs-bronzeman-overlay/?view=overlay`
- Control: `https://<username>.github.io/osrs-bronzeman-overlay/?view=control`

Use these in OBS instead of `localhost` — no local server needed.
