#!/usr/bin/env python3
"""Inline web/ + data/trips.json (+ optional weather.json) into dist/md-daytrips.html."""
import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))


def rd(rel):
    with open(os.path.join(HERE, rel), encoding="utf-8") as f:
        return f.read()


def main():
    with open(os.path.join(HERE, "data", "trips.json"), encoding="utf-8") as f:
        data = json.load(f)
    weather_path = os.path.join(HERE, "data", "weather.json")
    if os.path.isfile(weather_path):
        with open(weather_path, encoding="utf-8") as f:
            weather = json.load(f)
        weather_js = json.dumps(weather, ensure_ascii=False)
    else:
        weather_js = "null"
    data_js = json.dumps(data, ensure_ascii=False)
    n = len(data.get("places", []))
    html = rd("web/index.html")
    html = html.replace("/*__CSS__*/", rd("web/app.css"))
    html = html.replace("/*__TRIPS__*/ null /*__/TRIPS__*/", data_js)
    html = html.replace("/*__WEATHER__*/ null /*__/WEATHER__*/", weather_js)
    app = rd("web/app.js").replace("</script", "<\\/script")
    html = html.replace("/*__APP__*/", app)
    os.makedirs(os.path.join(HERE, "dist"), exist_ok=True)
    out = os.path.join(HERE, "dist", "md-daytrips.html")
    with open(out, "w", encoding="utf-8") as f:
        f.write(html)
    print(f"built {out} ({os.path.getsize(out):,} bytes) · places={n}")


if __name__ == "__main__":
    main()
