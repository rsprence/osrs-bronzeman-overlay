# OSRS Bronzeman Overlay

Static OBS browser overlay — no build step required.

## Cursor Cloud specific instructions

- This is a static site. Serve the repo root directly; no `npm install` required unless using `npm start` locally.
- Local preview: `python -m http.server 3000` or `npm start`
- OBS progress overlay: `/?view=overlay` (1920×1080 browser source)
- OBS celebration overlay: `/?view=celebration` (transparent until unlock; full-screen on unlock)
- Control panel URL: `/?view=control`
- Deploy target: GitHub Pages (workflow included) or any static host (Netlify, Vercel, Cloudflare Pages)

## Deploy to GitHub Pages

Push to `main`. The `.github/workflows/pages.yml` workflow publishes the repo root automatically.

Live URLs after deploy:
- Progress: `https://<user>.github.io/<repo>/?view=overlay`
- Celebration: `https://<user>.github.io/<repo>/?view=celebration`
- Control: `https://<user>.github.io/<repo>/?view=control`
