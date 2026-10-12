(() => {
  const DATA = window.__TRIPS__;
  if (!DATA || !DATA.places) {
    document.body.innerHTML = "<p style='padding:2rem;font-family:system-ui'>Missing trips data. Run build.py.</p>";
    return;
  }

  const WEATHER = window.__WEATHER__;
  const STORE_KEY = "md-daytrips-v1";
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function loadStore() {
    try {
      return JSON.parse(localStorage.getItem(STORE_KEY) || "{}") || {};
    } catch {
      return {};
    }
  }

  function saveStore(store) {
    localStorage.setItem(STORE_KEY, JSON.stringify(store));
  }

  let store = loadStore();
  if (typeof store.kids !== "boolean") store.kids = true;
  if (typeof store.indoor !== "boolean") store.indoor = false;
  if (typeof store.under45 !== "boolean") store.under45 = true;
  saveStore(store);

  function setView(name) {
    $$(".tab").forEach((t) => {
      const on = t.dataset.view === name;
      t.classList.toggle("active", on);
      t.setAttribute("aria-selected", on ? "true" : "false");
    });
    $$(".view").forEach((v) => v.classList.toggle("active", v.id === `view-${name}`));
    if (location.hash !== `#${name}`) history.replaceState(null, "", `#${name}`);
  }

  function matchesFilters(p, opts) {
    if (opts.kids && !p.kids) return false;
    if (opts.indoor && !p.indoor) return false;
    if (opts.under45 && p.driveBand !== "under45") return false;
    return true;
  }

  function currentOpts() {
    return { kids: store.kids, indoor: store.indoor, under45: store.under45 };
  }

  function filtered(cat) {
    const opts = currentOpts();
    return DATA.places.filter((p) => {
      if (cat && p.category !== cat) return false;
      return matchesFilters(p, opts);
    });
  }

  function cardHtml(p) {
    const chips = [];
    if (p.kids) chips.push('<span class="chip">Kids</span>');
    if (p.indoor) chips.push('<span class="chip">Indoor</span>');
    else chips.push('<span class="chip sand">Outdoors</span>');
    chips.push(`<span class="chip ex">EXAMPLE ${escapeHtml(p.driveExample.replace(/^EXAMPLE\s*/i, ""))}</span>`);
    const link = p.url
      ? `<a class="official" href="${escapeHtml(p.url)}" target="_blank" rel="noopener noreferrer">Official site →</a>`
      : "";
    return `
      <article class="place-card">
        <div class="area">${escapeHtml(p.area)} · ${escapeHtml(p.category)}</div>
        <h3>${escapeHtml(p.name)}</h3>
        <p class="why">${escapeHtml(p.why)}</p>
        <div class="meta-row">${chips.join("")}</div>
        <p class="hours">${escapeHtml(p.hoursNote || "Check official site.")}</p>
        ${link}
      </article>
    `;
  }

  function renderWeather() {
    const tip = (WEATHER && WEATHER.tip)
      ? WEATHER.tip
      : (DATA.weatherTipFallback || "Pair with NWS Annapolis board");
    const src = (WEATHER && WEATHER.source)
      ? WEATHER.source
      : "static tip";
    $("#weatherPanel").innerHTML = `
      <p class="w-label">Weather tip · ${escapeHtml(src)}</p>
      <p>${escapeHtml(tip)}</p>
    `;
  }

  function renderStats() {
    const all = DATA.places.length;
    const under = DATA.places.filter((p) => p.driveBand === "under45").length;
    const indoor = DATA.places.filter((p) => p.indoor).length;
    const shown = filtered(null).length;
    $("#statRow").innerHTML = `
      <div class="stat"><div class="n">${all}</div><div class="l">Places</div></div>
      <div class="stat"><div class="n">${under}</div><div class="l">Under ~45m</div></div>
      <div class="stat"><div class="n">${indoor}</div><div class="l">Indoor</div></div>
      <div class="stat"><div class="n">${shown}</div><div class="l">Match filters</div></div>
    `;
    $("#countPill").textContent = `${shown} matches`;
  }

  function fill(rootId, list) {
    const el = $(rootId);
    el.innerHTML = list.length
      ? list.map(cardHtml).join("")
      : `<p class="hint">No places match the current filters — open Filters tab to loosen.</p>`;
  }

  function renderAll() {
    renderWeather();
    renderStats();
    // Picks: curated mix — under45 kids first, then a few indoor
    const opts = currentOpts();
    let picks = DATA.places.filter((p) => matchesFilters(p, opts));
    // Prefer variety: sort by kids+under45 then name
    picks = picks.slice().sort((a, b) => {
      const score = (p) => (p.driveBand === "under45" ? 2 : 0) + (p.kids ? 1 : 0) + (p.indoor ? 0.5 : 0);
      return score(b) - score(a) || a.name.localeCompare(b.name);
    }).slice(0, 8);
    fill("#picksRoot", picks);
    fill("#parksRoot", filtered("parks"));
    fill("#museumsRoot", filtered("museums"));
    fill("#waterRoot", filtered("water"));

    $("#fKids").checked = store.kids;
    $("#fIndoor").checked = store.indoor;
    $("#fDrive").checked = store.under45;
    const n = filtered(null).length;
    $("#filterHint").textContent = `${n} place(s) match · kids=${store.kids} · indoor=${store.indoor} · under45 EXAMPLE=${store.under45}`;
    fill("#filterResults", filtered(null));
  }

  function syncFiltersFromUI() {
    store.kids = $("#fKids").checked;
    store.indoor = $("#fIndoor").checked;
    store.under45 = $("#fDrive").checked;
    saveStore(store);
    renderAll();
  }

  ["fKids", "fIndoor", "fDrive"].forEach((id) => {
    $(`#${id}`).addEventListener("change", syncFiltersFromUI);
  });

  $$(".tab").forEach((t) => t.addEventListener("click", () => setView(t.dataset.view)));

  window.addEventListener("hashchange", () => {
    const h = (location.hash || "#picks").slice(1);
    if (["picks", "parks", "museums", "water", "filters", "about"].includes(h)) setView(h);
  });

  renderAll();
  const start = (location.hash || "#picks").slice(1);
  setView(["picks", "parks", "museums", "water", "filters", "about"].includes(start) ? start : "picks");
})();
