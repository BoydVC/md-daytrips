#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
PORT="${MD_DAYTRIPS_PORT:-4328}"
CHROME="$(command -v google-chrome || command -v chromium || command -v chromium-browser)"
mkdir -p screenshots dist
if [[ ! -f dist/md-daytrips.html ]]; then python3 build.py; fi
if ! ss -ltn | grep -q "127.0.0.1:$PORT "; then
  nohup python3 server.py > /tmp/md-daytrips-$PORT.log 2>&1 &
  sleep 1
fi
shot() {
  local url="$1" out="$2" size="$3"; shift 3 || true
  local prof; prof="$(mktemp -d /tmp/mdtshot.XXXX)"
  "$CHROME" --headless=new --no-sandbox --disable-gpu --hide-scrollbars --force-device-scale-factor=1 \
    --run-all-compositor-stages-before-draw --virtual-time-budget=28000 \
    --window-size="$size" --user-data-dir="$prof" --screenshot="$out" "$@" "$url" >/dev/null 2>&1
  rm -rf "$prof"; echo "  $out ($(wc -c < "$out") bytes)"
}
U="http://127.0.0.1:$PORT"
shot "file://$PWD/dist/md-daytrips.html#picks" screenshots/00-best-home.png 1440,1100
shot "$U/#picks" screenshots/00-desktop-picks.png 1440,1000
shot "$U/#parks" screenshots/01-parks.png 1440,1000
shot "$U/#museums" screenshots/02-museums.png 1440,1000
shot "$U/#water" screenshots/03-water.png 1440,1000
shot "$U/#filters" screenshots/04-filters.png 1440,1000
shot "$U/#about" screenshots/05-about.png 1440,1000
shot "$U/#picks" screenshots/06-phone.png 390,844 --user-agent="Mozilla/5.0 (iPhone)"
echo "screenshots done"
