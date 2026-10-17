// Probe: capture WantGoo charts over raw CDP on one page target.
// The target's WebSocket URL is read from a file and never printed, because
// a Browser Run live URL carries a session JWT in its query string.
// Usage: node cdpcap.mjs <outDir> <file holding the page webSocketDebuggerUrl>
import WebSocket from "ws";
import { HttpsProxyAgent } from "https-proxy-agent";
import { createHash } from "node:crypto";
import fs from "node:fs";

const [, , outDir, wsFile] = process.argv;
const wsUrl = fs.readFileSync(wsFile, "utf8").trim();
const proxy = process.env.HTTPS_PROXY || process.env.https_proxy || process.env.HTTP_PROXY || process.env.http_proxy;
const agent = proxy && wsUrl.startsWith("wss:") ? new HttpsProxyAgent(proxy) : undefined;
const sha = (b) => createHash("sha256").update(b).digest("hex");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const clean = (e) => String(e?.message ?? e).split("\n")[0].replace(/jwt=[^\s&"']+/g, "jwt=REDACTED");
const out = { proxy: !!agent, ws_host: new URL(wsUrl).host, steps: [] };
fs.mkdirSync(outDir, { recursive: true });
const save = () => fs.writeFileSync(`${outDir}/results.json`, JSON.stringify(out, null, 2) + "\n");

let ws;
try {
  ws = new WebSocket(wsUrl, { agent, perMessageDeflate: false, maxPayload: 512 * 1024 * 1024 });
  await new Promise((res, rej) => {
    ws.once("open", res);
    ws.once("unexpected-response", (req, r) => rej(new Error(`ws http ${r.statusCode}`)));
    ws.once("error", rej);
  });
  out.ws = "open";
} catch (e) {
  out.ws = `failed: ${clean(e)}`;
  save();
  console.log(JSON.stringify(out));
  process.exit(2);
}

let seq = 0;
const pending = new Map();
const waiters = [];
ws.on("message", (m) => {
  const msg = JSON.parse(m.toString());
  if (msg.id && pending.has(msg.id)) {
    const p = pending.get(msg.id);
    pending.delete(msg.id);
    msg.error ? p.rej(new Error(msg.error.message)) : p.res(msg.result);
  } else if (msg.method) {
    for (const w of [...waiters]) if (w.method === msg.method) { waiters.splice(waiters.indexOf(w), 1); w.res(msg.params); }
  }
});
const send = (method, params = {}) => new Promise((res, rej) => {
  const i = ++seq;
  pending.set(i, { res, rej });
  ws.send(JSON.stringify({ id: i, method, params }));
  setTimeout(() => { if (pending.delete(i)) rej(new Error(`timeout ${method}`)); }, 90000);
});
const once = (method) => new Promise((res) => waiters.push({ method, res }));
const ev = async (expr) => {
  const r = await send("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true });
  if (r.exceptionDetails) throw new Error(`eval ${r.exceptionDetails.exception?.description ?? r.exceptionDetails.text}`);
  return r.result.value;
};
async function waitFor(expr, ms) {
  const t = Date.now();
  while (Date.now() - t < ms) {
    try { if (await ev(expr)) return true; } catch {}
    await sleep(500);
  }
  return false;
}

// Hide fixed and sticky bars (the bottom 深入瞭解 bar covers the chart otherwise).
// Scan the whole document: the Google anchor ad is appended to <html>, outside <body>.
const HIDE = `(() => { let n = 0; for (const el of document.querySelectorAll("html *:not(head, head *, body)")) { const p = getComputedStyle(el).position; if ((p === "fixed" || p === "sticky") && el.style.display !== "none") { el.style.setProperty("display", "none", "important"); n++; } } return n; })()`;
// Element box in page coordinates, the frame Page.captureScreenshot clips in.
const RECT = (sel) => `(() => { const el = document.querySelector(${JSON.stringify(sel)}); if (!el) return null; el.scrollIntoView({ block: "start" }); const r = el.getBoundingClientRect(); return { x: Math.round(r.left + scrollX), y: Math.round(r.top + scrollY), width: Math.ceil(r.width), height: Math.ceil(r.height) }; })()`;
// Last point date of each chart series: in Taipei time computed by hand, and as the browser's local date.
const SERIES = (sel) => `(() => { const H = window.Highcharts; const host = document.querySelector(${JSON.stringify(sel)}); const c = H && host && H.charts.filter(Boolean).find((x) => host.contains(x.renderTo)); return c ? c.series.filter((s) => s.xData && s.xData.length && !/navigator/i.test(s.name)).map((s) => { const x = s.xData[s.xData.length - 1]; return { name: s.name, last_tpe: new Date(x + 8 * 3600e3).toISOString().slice(0, 10), last_local: new Date(x).toLocaleDateString("sv-SE") }; }) : null; })()`;
const flat = (expr) => `((${expr}) ?? "").split(/\\s+/).join(" ").trim()`;

async function stable(rect) {
  const cap = async () => {
    await ev(HIDE);
    const d = await send("Page.captureScreenshot", { format: "png", clip: { ...rect, scale: 1 }, captureBeyondViewport: true });
    return d.data;
  };
  let prev = await cap();
  for (let i = 2; i <= 15; i++) {
    await sleep(400);
    const next = await cap();
    if (next === prev) return { png: Buffer.from(next, "base64"), frames: i };
    prev = next;
  }
  return { png: Buffer.from(prev, "base64"), frames: -1 };
}

async function shot(name, url, sel, ready, extract, reload) {
  const r = { name, url, reload, at: new Date().toISOString() };
  try {
    const loaded = once("Page.loadEventFired");
    if (reload) await send("Page.reload", { ignoreCache: true });
    else {
      const nav = await send("Page.navigate", { url });
      if (nav.errorText) throw new Error(`navigate ${nav.errorText}`);
    }
    await Promise.race([loaded, sleep(60000)]);
    r.status = await ev("performance.getEntriesByType('navigation')[0]?.responseStatus ?? null");
    r.title = await ev("document.title");
    r.tz = await ev("Intl.DateTimeFormat().resolvedOptions().timeZone");
    r.ready = await waitFor(ready, 60000);
    r.title_after = await ev("document.title");
    if (r.ready) {
      await sleep(1500);
      r.extract = await ev(extract);
      r.series = await ev(SERIES(sel));
      r.hidden_fixed = await ev(HIDE);
      const rect = await ev(RECT(sel));
      await sleep(500);
      r.rect = rect;
      const { png, frames } = await stable(rect);
      fs.writeFileSync(`${outDir}/${name}.png`, png);
      Object.assign(r, { file: `${name}.png`, bytes: png.length, sha256: sha(png), stable_frames: frames });
    } else {
      const d = await send("Page.captureScreenshot", { format: "png" });
      fs.writeFileSync(`${outDir}/${name}.failure.png`, Buffer.from(d.data, "base64"));
      r.failure_file = `${name}.failure.png`;
    }
  } catch (e) {
    r.error = clean(e);
  }
  out.steps.push(r);
  save();
  console.log(JSON.stringify(r));
}

try {
  await send("Page.enable");
  await send("Runtime.enable");
  out.tz_before = await ev("Intl.DateTimeFormat().resolvedOptions().timeZone");
  await send("Emulation.setTimezoneOverride", { timezoneId: "Asia/Taipei" });
  await send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 900, deviceScaleFactor: 2, mobile: false });
  out.tz_after = await ev("Intl.DateTimeFormat().resolvedOptions().timeZone");
  out.tz_offset_min = await ev("new Date().getTimezoneOffset()");
  out.user_agent = await ev("navigator.userAgent");
} catch (e) {
  out.setup_error = clean(e);
}

const M = "https://www.wantgoo.com/stock/margin-trading/market-price/taiex";
const mReady = `/^\\s*\\d{1,2}\\/\\d{1,2}\\s*$/.test(document.querySelector("#transactionTable tbody tr:first-child td:first-child")?.innerText ?? "") && document.querySelectorAll("#taiexMarginChart .highcharts-line-series path.highcharts-graph").length >= 3`;
const mExtract = `({ newest_row: ${flat(`document.querySelector("#transactionTable tbody tr:first-child")?.innerText`)}, chart_header: ${flat(`document.querySelector("#taiexMarginChart")?.innerText`)}.slice(0, 200) })`;
await shot("margin-1", M, "#taiexMarginChart", mReady, mExtract, false);
await shot("margin-2-reload", M, "#taiexMarginChart", mReady, mExtract, true);

const K = "https://www.wantgoo.com/stock/2330/technical-chart";
const kReady = `document.querySelectorAll("#technical-chart svg path").length >= 50`;
const kExtract = `({ title: document.title, chart_header: ${flat(`document.querySelector("#technical-chart")?.innerText`)}.slice(0, 200) })`;
await shot("tsmc-k", K, "#technical-chart", kReady, kExtract, false);

save();
console.log(JSON.stringify({ ws: out.ws, tz_before: out.tz_before, tz_after: out.tz_after, tz_offset_min: out.tz_offset_min, setup_error: out.setup_error ?? null }));
ws.close();
