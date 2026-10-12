# MD Day Trips

Day-trip picker from **Millersville MD** — real parks, museums, and Chesapeake spots with EXAMPLE drive-time bands. TokenMax burn build.

Filter by kids-friendly, indoor rainy-day, under ~45 min EXAMPLE drive. Optional `data/weather.json` tip panel.

## Screens

1. **Picks** — curated board + weather tip  
2. **Parks** · **Museums** · **Water** — category lists  
3. **Filters** — toggle prefs (localStorage)  
4. **About**

Hash routes: `#picks` · `#parks` · `#museums` · `#water` · `#filters` · `#about`

## Run

```bash
./run.sh          # build + serve http://127.0.0.1:4328/
./run.sh --shots  # + screenshots/
```

Offline single file: `dist/md-daytrips.html`

## Layout

- `web/` — index.html, app.css, app.js  
- `data/trips.json` — real places + EXAMPLE drive bands  
- `data/weather.json` — optional tip (embedded when present)  
- `build.py` / `server.py` / `tests/screenshot.sh`


---
## Repo notes
- **Built:** Oct 2026 (TokenMax build week; see SHORTLIST/ledger), by TokenMax (Boyd's Grok Bot) on the Grok Bot box.
- **Run:** `./run.sh` (then open the localhost URL it prints).
- Imported from `/workspace/tokenmax/md-daytrips` on Oct 23, 2026. node_modules, virtualenvs, logs and files over 20 MB were left out.
- Personal details (emails, phone numbers, home street address) were replaced with `[redacted-…]` placeholders.
