const screens = ["intro", "error", "birthday", "game", "letter", "bloom", "ending"];
const $ = (id) => document.getElementById(id);
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const dots = document.querySelectorAll("#steps i");
let current = "intro", busy = false;

function setStatus(el, text) {
  el.textContent = text;
  el.classList.remove("swap");
  void el.offsetWidth;
  el.classList.add("swap");
}

// Smooth transition: current screen fades out, next one fades in.
function showScreen(name) {
  if (busy || name === current) return;
  busy = true;
  const from = $(current), to = $(name);
  from.classList.add("leaving");
  setTimeout(() => {
    from.classList.remove("active", "leaving");
    to.classList.add("active");
    current = name;
    dots.forEach((d, i) => d.classList.toggle("on", i === screens.indexOf(name)));
    window.scrollTo({ top: 0, behavior: "smooth" });
    busy = false;
    name === "bloom" ? bouquet.start() : bouquet.stop();
    if (name === "ending") floatHearts();
  }, reduce ? 0 : 350);
}

// Eased progress runner used by both loading sequences.
function run(ms, tick, done) {
  if (reduce) { tick(1); done(); return; }
  const t0 = performance.now();
  (function step(now) {
    const p = Math.min((now - t0) / ms, 1);
    tick(p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2);
    p < 1 ? requestAnimationFrame(step) : done();
  })(t0);
}

function pick(list, v) {
  return list.reduce((a, m, k) => (v >= m[0] ? k : a), 0);
}

/* 1. Intro loading */
const loadMsgs = [
  [0, "booting little surprise..."],
  [20, "collecting good wishes..."],
  [45, "folding the letter neatly..."],
  [70, "sprinkling a bit of confetti..."],
  [92, "almost there..."]
];
function startLoader() {
  const btn = $("startBtn"), bar = $("loaderBar"), pct = $("loaderPct"), st = $("statusText"), box = $("loader");
  let idx = -1;
  btn.disabled = true;
  btn.classList.remove("ready");
  run(3600, (p) => {
    const v = Math.round(p * 100);
    bar.style.transform = `scaleX(${p})`;
    pct.textContent = v + "%";
    box.setAttribute("aria-valuenow", v);
    const i = pick(loadMsgs, v);
    if (i !== idx) { idx = i; setStatus(st, loadMsgs[i][1]); }
  }, () => {
    if (isLocked()) { setStatus(st, "opens on 09 November ♡"); return; }
    setStatus(st, "preparing the music...");
    audioReady.then(() => { setStatus(st, "everything is ready for you ♡"); btn.disabled = false; btn.classList.add("ready"); });
  });
}

/* 2. "Fix this issue" loading */
const fixMsgs = [
  [0, "applying celebration patch..."],
  [35, "installing confetti.js..."],
  [70, "compiling happiness..."],
  [95, "build successful ♡"]
];
function resetFix() {
  const btn = $("fixBtn");
  btn.disabled = false;
  btn.firstChild.textContent = "FIX THIS ISSUE ";
  $("fixProgress").classList.remove("on");
  $("fixBar").style.transform = "scaleX(0)";
  $("fixStatus").textContent = "";
}

let musicAuto = false;
$("startBtn").addEventListener("click", async () => {
  $("startBtn").disabled = true;
  if (!musicAuto) { musicAuto = true; setStatus($("statusText"), "starting the music ♡"); if (audio.paused) await toggleMusic(); }
  setTimeout(() => showScreen("error"), reduce ? 0 : 1100);
});

$("fixBtn").addEventListener("click", () => {
  const btn = $("fixBtn"), st = $("fixStatus");
  let idx = -1;
  btn.disabled = true;
  btn.firstChild.textContent = "Fixing... ";
  $("fixProgress").classList.add("on");
  run(2400, (p) => {
    $("fixBar").style.transform = `scaleX(${p})`;
    const i = pick(fixMsgs, Math.round(p * 100));
    if (i !== idx) { idx = i; setStatus(st, fixMsgs[i][1]); }
  }, () => setTimeout(() => {
    showScreen("birthday");
    launchConfetti();
  }, reduce ? 0 : 500));
});

$("letterBtn").addEventListener("click", () => showScreen("game"));
$("lastBtn").addEventListener("click", () => showScreen("bloom"));
$("replayBtn").addEventListener("click", () => {
  resetAll();
  showScreen("intro");
  startLoader();
});

/* Effects */
function launchConfetti() {
  const area = $("confetti");
  area.innerHTML = "";
  if (reduce) return;
  const colors = ["#e9a0b6", "#d8c4ed", "#d6e6d5", "#f6d7a7", "#f4b6c8"];
  const total = innerWidth < 600 ? 45 : 90;
  for (let i = 0; i < total; i++) {
    const p = document.createElement("i");
    const s = 6 + Math.random() * 7;
    p.style.cssText = `left:${Math.random() * 100}%;width:${s}px;height:${s * (Math.random() > 0.5 ? 1 : 1.8)}px;background:${colors[i % 5]};border-radius:${Math.random() > 0.6 ? "50%" : "2px"};--dx:${(Math.random() - 0.5) * 160}px;animation-delay:${Math.random() * 1.2}s;animation-duration:${2.6 + Math.random() * 2.2}s`;
    area.appendChild(p);
  }
}

function floatHearts() {
  const box = $("hearts");
  box.innerHTML = "";
  if (reduce) return;
  const g = ["♡", "✿", "✧", "♡"];
  for (let i = 0; i < 16; i++) {
    const h = document.createElement("i");
    h.textContent = g[i % 4];
    h.style.cssText = `left:${Math.random() * 100}%;font-size:${14 + Math.random() * 16}px;--sx:${(Math.random() - 0.5) * 60}px;animation-duration:${6 + Math.random() * 6}s;animation-delay:${Math.random() * 5}s`;
    box.appendChild(h);
  }
}

// Tiny sparkles wherever you tap.
document.addEventListener("click", (e) => {
  if (reduce) return;
  const g = ["♡", "✦", "✧"];
  for (let i = 0; i < 5; i++) {
    const s = document.createElement("span");
    const a = Math.random() * Math.PI * 2, d = 26 + Math.random() * 30;
    s.className = "spark";
    s.textContent = g[i % 3];
    s.style.cssText = `left:${e.clientX}px;top:${e.clientY}px;--x:${Math.cos(a) * d}px;--y:${Math.sin(a) * d - 20}px`;
    document.body.appendChild(s);
    setTimeout(() => s.remove(), 900);
  }
});

/* Music */
const audio = $("bgMusic");
audio.preload = "auto"; audio.load();
const audioReady = new Promise((r) => { if (audio.readyState >= 4) return r(); audio.addEventListener("canplaythrough", r, { once: true }); audio.addEventListener("error", r, { once: true }); setTimeout(r, 7000); });
const musicToggle = $("musicToggle");
const musicLabel = $("musicLabel");
async function toggleMusic() {
  if (audio.paused) {
    try {
      audio.volume = 0;
      await audio.play();
      fade(0.4, 2000);
      musicToggle.classList.add("playing");
      musicLabel.textContent = "sound on";
    } catch (error) {
      musicLabel.textContent = "add music file";
    }
  } else {
    fade(0, 600, () => audio.pause());
    musicToggle.classList.remove("playing");
    musicLabel.textContent = "sound off";
  }
}
musicToggle.addEventListener("click", toggleMusic);

/* Countdown (set LOCK_UNTIL_BIRTHDAY = true to lock the intro until 09 Nov; add ?preview to the URL to peek) */
const BDAY = new Date(2026, 10, 9);
const LOCK_UNTIL_BIRTHDAY = false;
const daysLeft = () => Math.ceil((BDAY - new Date()) / 864e5);
function isLocked() { return LOCK_UNTIL_BIRTHDAY && daysLeft() > 0 && !location.search.includes("preview"); }
(function () {
  const d = daysLeft();
  $("countdown").textContent = d > 0 ? `${d} hari lagi menuju 09 November ♡` : d === 0 ? "today's the day ♡" : "";
})();

function fade(to, ms, done) {
  const from = audio.volume, t0 = performance.now();
  audio.volume = from > 0.5 ? 0.4 : 0.6; // iOS ignores volume changes
  if (audio.volume === from) { done && done(); return; }
  audio.volume = from;
  (function s(n) {
    const p = Math.min((n - t0) / ms, 1);
    audio.volume = from + (to - from) * p;
    p < 1 ? requestAnimationFrame(s) : done && done();
  })(t0);
}

/* Blow the candle */
$("candleBtn").addEventListener("click", () => {
  const c = $("candleBtn");
  if (c.classList.contains("out")) return;
  c.classList.add("out");
  c.textContent = "✧";
  setStatus($("candleHint"), "wish made ♡ semoga terkabul");
  launchConfetti();
});

/* Envelope */
let envBusy = false;
$("envelope").addEventListener("click", () => {
  if (envBusy) return;
  envBusy = true;
  $("envelope").querySelector(".env-hint").textContent = "bunga mekar dulu ✿";
  gardenAt = Infinity;
  letterGarden.start();
  letterFront.start();
  setTimeout(() => $("envelope").classList.add("open"), reduce ? 0 : 2500);
  setTimeout(() => {
    $("envelope").hidden = true;
    $("letterLayout").hidden = false;
    $("lastBtn").hidden = false;
    gardenAt = letterGarden.now();
    letterGarden.rebuild();
    letterFront.start();
    envBusy = false;
  }, reduce ? 0 : 3200);
});

/* Catch-the-hearts game */
let gScore = 0, gDone = false, gTick, gSpawn;
function stopGame() { clearInterval(gTick); clearInterval(gSpawn); }
function clearHearts() { $("gameArea").querySelectorAll(".g-heart").forEach((h) => h.remove()); }
function endGame() {
  stopGame();
  clearHearts();
  gDone = true;
  $("gameMsg").hidden = false;
  $("gameMsg").textContent = reduce ? "tidak perlu bermain, semuanya sudah untukmu ♡" : `kamu menangkap ${gScore} ♡ bagus banget!`;
  $("gameStart").disabled = false;
  $("gameStart").textContent = "Open the letter ↓";
}
function spawnHeart() {
  const h = document.createElement("button");
  h.className = "g-heart";
  h.textContent = "♡";
  h.setAttribute("aria-label", "heart");
  h.style.left = Math.random() * 85 + "%";
  h.style.fontSize = 24 + Math.random() * 14 + "px";
  h.style.animationDuration = 2.6 + Math.random() * 1.6 + "s";
  h.addEventListener("click", () => {
    gScore++;
    $("gameScore").textContent = gScore;
    h.classList.add("caught");
    setTimeout(() => h.remove(), 200);
  }, { once: true });
  h.addEventListener("animationend", (e) => { if (e.animationName === "gfall") h.remove(); });
  $("gameArea").appendChild(h);
}
$("gameStart").addEventListener("click", () => {
  if (gDone) { showScreen("letter"); return; }
  if (reduce) { endGame(); return; }
  let t = 15;
  $("gameStart").disabled = true;
  $("gameMsg").hidden = true;
  gSpawn = setInterval(spawnHeart, 550);
  gTick = setInterval(() => {
    t--;
    $("gameTime").textContent = t;
    if (t <= 0) endGame();
  }, 1000);
});
$("gameSkip").addEventListener("click", () => { stopGame(); showScreen("letter"); });

/* "One more" wishes */
const wishes = [
  "Hehe, ketahuan masih penasaran. Semoga hari ini jadi salah satu hari baikmu. ♡",
  "Semoga tahun ini lebih banyak hal kecil yang bikin kamu senyum sendiri. ✿",
  "You don't have to be productive to deserve a good day. ♡",
  "Semoga langkahmu selalu dikelilingi orang-orang yang tulus. ✧",
  "Last one, promise. Selamat ulang tahun, Zahra. ♡"
];
let wi = 0;
$("secretBtn").addEventListener("click", () => {
  $("secretMessage").hidden = false;
  setStatus($("secretMessage"), wishes[wi++ % wishes.length]);
  $("secretBtn").textContent = "another one ♡";
});

function resetAll() {
  gardenAt = Infinity; letterGarden.stop(); letterFront.stop(); bouquet.stop();
  resetFix();
  $("secretMessage").hidden = true;
  $("secretBtn").textContent = "psst... one more click?";
  wi = 0;
  const c = $("candleBtn");
  c.classList.remove("out");
  c.textContent = "✦";
  $("candleHint").textContent = "tap the candle to make a wish ✦";
  const e = $("envelope");
  e.querySelector(".env-hint").textContent = "tap to open";
  e.hidden = false;
  e.classList.remove("open");
  $("letterLayout").hidden = true;
  $("lastBtn").hidden = true;
  stopGame();
  clearHearts();
  gScore = 0; gDone = false;
  $("gameScore").textContent = 0;
  $("gameTime").textContent = 15;
  $("gameMsg").hidden = false;
  $("gameMsg").textContent = "tap the hearts before they fall";
  $("gameStart").disabled = false;
  $("gameStart").textContent = "Start ♡";
}

startLoader();

/* Flowers (canvas). Chrysanthemum: golden-angle phyllotaxis. Lily: Bezier petals + stamens. */
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const ease = (p) => 1 - Math.pow(1 - clamp(p), 3);
function rng(s) { return () => { s = (s + 0x6D2B79F5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

function drawKrisan(g, R, t) {
  const sh = g.createRadialGradient(0, 0, R * 0.2, 0, 0, R * 1.15);
  sh.addColorStop(0, "rgba(190,80,120,.22)"); sh.addColorStop(1, "rgba(190,80,120,0)");
  g.fillStyle = sh; g.beginPath(); g.arc(0, R * 0.06, R * 1.15, 0, 7); g.fill();
  const N = 96, GA = 2.399963; // golden angle in radians
  for (let k = 0; k < N; k++) {
    const u = k / N, p = ease(t * 1.8 - u * 0.8);
    if (p <= 0) continue;
    const L = R * (1 - 0.72 * u) * p, w = R * (0.07 + 0.05 * u), r0 = R * 0.07;
    g.save(); g.rotate(k * GA);
    const gr = g.createLinearGradient(0, -r0, 0, -L);
    gr.addColorStop(0, "#df5f8e"); gr.addColorStop(0.55, "#f08fb3"); gr.addColorStop(1, "#fcdbe7");
    g.fillStyle = gr; g.beginPath(); g.moveTo(0, -r0);
    g.bezierCurveTo(-w, -L * 0.35, -w * 0.9, -L * 0.8, 0, -L);
    g.bezierCurveTo(w * 0.9, -L * 0.8, w, -L * 0.35, 0, -r0); g.fill();
    g.strokeStyle = "rgba(255,255,255,.35)"; g.lineWidth = 0.6; g.stroke();
    g.restore();
  }
  if (t > 0.5) {
    const c = g.createRadialGradient(0, 0, 0, 0, 0, R * 0.1);
    c.addColorStop(0, "#f6dc8e"); c.addColorStop(1, "#e9a85a");
    g.globalAlpha = ease((t - 0.5) * 2); g.fillStyle = c; g.beginPath(); g.arc(0, 0, R * 0.1, 0, 7); g.fill(); g.globalAlpha = 1;
  }
}

function drawLily(g, R, t, seed) {
  const sh = g.createRadialGradient(0, 0, R * 0.2, 0, 0, R * 1.1);
  sh.addColorStop(0, "rgba(190,80,120,.2)"); sh.addColorStop(1, "rgba(190,80,120,0)");
  g.fillStyle = sh; g.beginPath(); g.arc(0, R * 0.05, R * 1.1, 0, 7); g.fill();
  const petal = (a, L, front, n) => {
    const op = ease(t * 1.5 - (front ? 0.2 : 0));
    if (op <= 0) return;
    const w = L * 0.27, rnd = rng(seed * 7 + n);
    g.save(); g.rotate(a * op); g.scale(0.5 + 0.5 * op, 0.35 + 0.65 * op);
    const gr = g.createLinearGradient(0, 0, 0, -L);
    gr.addColorStop(0, "#c8467f"); gr.addColorStop(0.3, "#ec86ad"); gr.addColorStop(0.8, "#f8c8dc"); gr.addColorStop(1, "#fff0f5");
    g.fillStyle = gr; g.beginPath(); g.moveTo(0, 0);
    g.bezierCurveTo(-w * 1.15, -L * 0.3, -w * 1.05, -L * 0.75, w * 0.15, -L);
    g.bezierCurveTo(w * 1.05, -L * 0.75, w * 1.15, -L * 0.3, 0, 0); g.fill();
    g.strokeStyle = "rgba(170,50,100,.25)"; g.lineWidth = 0.8; g.stroke();
    g.strokeStyle = "rgba(180,50,100,.45)"; g.lineWidth = 0.6 + R * 0.01;
    g.beginPath(); g.moveTo(0, -L * 0.05); g.quadraticCurveTo(w * 0.1, -L * 0.5, w * 0.1, -L * 0.82); g.stroke();
    g.globalAlpha = op; g.fillStyle = "rgba(165,35,85,.85)";
    for (let j = 0; j < 16; j++) {
      const y = -L * (0.1 + 0.45 * rnd()), x = (rnd() - 0.5) * w * 1.2 * (1 - (-y / L) * 0.6);
      g.beginPath(); g.arc(x, y, R * (0.012 + 0.014 * rnd()), 0, 7); g.fill();
    }
    g.restore();
  };
  for (let i = 0; i < 3; i++) petal(Math.PI / 3 + i * 2.0944, R * 0.93, false, i);
  for (let i = 0; i < 3; i++) petal(i * 2.0944, R, true, i + 3);
  if (t > 0.45) {
    const s = ease((t - 0.45) * 2);
    for (let i = 0; i < 6; i++) {
      const a = i * 1.0472 + 0.26, ex = Math.cos(a) * R * 0.55 * s, ey = Math.sin(a) * R * 0.55 * s;
      g.strokeStyle = "#eab4c6"; g.lineWidth = 1.2; g.beginPath(); g.moveTo(0, 0);
      g.quadraticCurveTo(ex * 0.4 + ey * 0.15, ey * 0.4 - ex * 0.15, ex, ey); g.stroke();
      g.save(); g.translate(ex, ey); g.rotate(a); g.fillStyle = "#a8481f"; g.beginPath(); g.ellipse(0, 0, R * 0.075, R * 0.032, 0, 0, 7); g.fill();
      g.fillStyle = "#e5a13a"; g.beginPath(); g.arc(R * 0.02, 0, R * 0.014, 0, 7); g.fill(); g.restore();
    }
    g.strokeStyle = "#e8efc4"; g.lineWidth = 1.6; g.beginPath(); g.moveTo(0, 0); g.lineTo(-R * 0.5 * s, R * 0.18 * s); g.stroke();
    g.fillStyle = "#cfe0a0"; g.beginPath(); g.arc(-R * 0.5 * s, R * 0.18 * s, R * 0.025, 0, 7); g.fill();
  }
}

function leaf(g, x, y, len, ang, p) {
  const L = len * ease(p); if (L <= 0) return;
  g.save(); g.translate(x, y); g.rotate(ang);
  const gr = g.createLinearGradient(0, 0, L, 0); gr.addColorStop(0, "#5f8f6a"); gr.addColorStop(1, "#a5cba5");
  g.fillStyle = gr; g.beginPath(); g.moveTo(0, 0);
  g.bezierCurveTo(L * 0.3, -L * 0.28, L * 0.75, -L * 0.2, L, 0); g.bezierCurveTo(L * 0.75, L * 0.16, L * 0.3, L * 0.22, 0, 0); g.fill();
  g.strokeStyle = "rgba(255,255,255,.35)"; g.lineWidth = 0.8; g.beginPath(); g.moveTo(0, 0); g.lineTo(L * 0.9, 0); g.stroke(); g.restore();
}
function stem(g, x0, y0, cx, cy, x1, y1, p) {
  const s = ease(p); if (s <= 0) return;
  const mx = x0 + (cx - x0) * s, my = y0 + (cy - y0) * s;
  const ex = (1 - s) * (1 - s) * x0 + 2 * (1 - s) * s * cx + s * s * x1, ey = (1 - s) * (1 - s) * y0 + 2 * (1 - s) * s * cy + s * s * y1;
  g.strokeStyle = "#7fae88"; g.lineWidth = 2.4; g.lineCap = "round"; g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo(mx, my, ex, ey); g.stroke();
}
const flower = (kind, x, y, R, d, rot, seed) => (g, tt) => {
  const t = clamp((tt - d) / 2.4); if (t <= 0) return;
  g.save(); g.translate(x, y); g.rotate(rot + Math.sin(tt * 1.1 + seed) * 0.04 * t);
  const s = 0.55 + 0.45 * ease(t * 1.5); g.scale(s, s);
  kind === "k" ? drawKrisan(g, R, t) : drawLily(g, R, t, seed);
  g.restore();
};
const leafOp = (x, y, len, ang, d) => (g, tt) => leaf(g, x, y, len, ang, (tt - d) / 1.2);
const stemOp = (x0, y0, cx, cy, x1, y1, d) => (g, tt) => stem(g, x0, y0, cx, cy, x1, y1, (tt - d) / 1.1);
const ribbon = (x, y, d) => (g, tt) => {
  const p = ease((tt - d) / 0.8); if (p <= 0) return;
  g.save(); g.translate(x, y); g.scale(p, p); g.fillStyle = "#ea7ea4";
  [-1, 1].forEach((m) => { g.save(); g.rotate(m * 0.45); g.beginPath(); g.ellipse(m * 13, 0, 14, 7, 0, 0, 7); g.fill(); g.restore(); });
  g.fillStyle = "#d95c88"; g.beginPath(); g.arc(0, 0, 6, 0, 7); g.fill();
  g.strokeStyle = "#ea7ea4"; g.lineWidth = 5; g.lineCap = "round";
  [-1, 1].forEach((m) => { g.beginPath(); g.moveTo(m * 2, 5); g.quadraticCurveTo(m * 10, 18, m * 14, 28); g.stroke(); });
  g.restore();
};

function scene(canvas, W0, H0, layout) {
  const g = canvas.getContext("2d");
  let ops = [], t0 = 0, raf = 0, W, H, d = 1;
  function build() {
    d = Math.min(devicePixelRatio || 1, 2);
    W = W0 || canvas.clientWidth; H = H0 || canvas.clientHeight;
    canvas.width = W * d; canvas.height = H * d;
    ops = layout(W, H);
  }
  function frame(now) {
    const tt = reduce ? 99 : (now - t0) / 1000;
    g.setTransform(d, 0, 0, d, 0, 0); g.clearRect(0, 0, W, H);
    ops.forEach((op) => op(g, tt));
    raf = canvas.offsetParent && !reduce && tt < ops.end ? requestAnimationFrame(frame) : 0;
  }
  return {
    start() { canvas.hidden = false; build(); t0 = performance.now(); cancelAnimationFrame(raf); raf = requestAnimationFrame(frame); },
    stop() { cancelAnimationFrame(raf); raf = 0; canvas.hidden = true; },
    now() { return (performance.now() - t0) / 1000; },
    rebuild() { if (canvas.hidden) return; build(); cancelAnimationFrame(raf); raf = requestAnimationFrame(frame); },
    resize() { if (!canvas.hidden) { build(); cancelAnimationFrame(raf); raf = requestAnimationFrame(() => { t0 = -1e6; frame(performance.now()); }); } }
  };
}

const shellW = () => document.querySelector(".shell").clientWidth || 360;
const gardenUnit = () => clamp(shellW() * 0.17, 48, 92);
const letterPad = () => Math.round(gardenUnit() * 2.1);
let gardenAt = Infinity; // seconds when the letter appears; the lower flowers bloom after that

// Flowers frame the letter from behind: corner clusters on top, then corners and the sides once the letter is open.
const letterGarden = scene($("letterGarden"), 0, 0, (W, H) => {
  const u = gardenUnit(), pw = Math.min(670, shellW()), x0 = (W - pw) / 2, x1 = x0 + pw, T = Math.PI;
  const late = (i) => gardenAt + 0.15 + i * 0.2;
  const items = [];
  if (x0 > 0.7 * u) items.push(
    ["k", x0 - 0.1 * u, H * 0.4, 0.6 * u, 0.1, late(6), 9, [T + 0.8, T - 0.8]],
    ["l", x1 + 0.1 * u, H * 0.62, 0.66 * u, 0.4, late(7), 10, [0.8, -0.8]]
  );
  if (x0 > 1.4 * u) items.push(
    ["l", x0 - 0.6 * u, H * 0.7, 0.48 * u, -0.4, late(8), 11, [T - 0.6]],
    ["k", x1 + 0.55 * u, H * 0.32, 0.44 * u, 0, late(9), 12, [0.6]],
    ["k", x0 - 0.5 * u, H * 0.22, 0.3 * u, 0, late(10), 17, []],
    ["k", x1 + 0.45 * u, H * 0.84, 0.32 * u, 0, late(11), 18, []]
  );
  const leaves = [], fl = [];
  items.forEach(([k, x, y, R, rot, d, seed, lv]) => {
    lv.forEach((a) => leaves.push(leafOp(x, y, R * 1.5, a, d)));
    fl.push(flower(k, x, y, R, d, rot, seed));
  });
  const ops = [...leaves, ...fl]; ops.end = isFinite(gardenAt) ? gardenAt + 4.4 : Infinity; return ops;
});

// Corsages pinned on the four corners of the envelope / paper (drawn in front, but kept clear of every line of text and ornament).
const letterFront = scene($("letterFront"), 0, 0, (W, H) => {
  const cv = $("letterFront"), C = cv.getBoundingClientRect(), L0 = document.querySelector(".letter-layout"), L = (L0.hidden ? $("envelope") : L0).getBoundingClientRect(), ops = [];
  ops.end = 3.6;
  if (!L.width) return ops;
  const u = gardenUnit(), lx0 = L.left - C.left, lx1 = L.right - C.left, ly0 = L.top - C.top, ly1 = L.bottom - C.top, prot = [];
  const pad = 4, add = (r) => prot.push([r.left - C.left - pad, r.top - C.top - pad, r.right - C.left + pad, r.bottom - C.top + pad]);
  if (L0.hidden) document.querySelectorAll("#envelope .env-hint,#envelope svg,#envelope .env-heart").forEach((e) => add(e.getBoundingClientRect()));
  if (!L0.hidden) {
    document.querySelectorAll(".side-flower,.side-heart,.paper-top span,.letter-side p").forEach((e) => add(e.getBoundingClientRect()));
    document.querySelectorAll(".letter-paper .eyebrow,#letterTitle,.letter-text p,.letter-sign").forEach((e) => { const rg = document.createRange(); rg.selectNodeContents(e); [...rg.getClientRects()].forEach(add); });
  }
  const fit = (x, y, R) => { // biggest radius that keeps clear of text and ornaments
    for (let r = R; r > 0.28 * u; r -= 0.04 * u) if (prot.every(([a, b, c, d]) => Math.hypot(x - clamp(x, a, c), y - clamp(y, b, d)) > r)) return r;
    return 0.28 * u;
  };
  [[-1, -1, "l", 1.0, -0.4, 21], [1, -1, "k", 0.9, 0.2, 22], [-1, 1, "k", 0.9, 0.3, 23], [1, 1, "l", 1.05, 0.45, 24]].forEach(([sx, sy, k, rf, rot, seed], i) => {
    const x = clamp((sx < 0 ? lx0 : lx1) - sx * 0.12 * u, 0.9 * rf * u, W - 0.9 * rf * u), y = clamp((sy < 0 ? ly0 : ly1) - sy * 0.1 * u, 0.9 * rf * u, H - 0.9 * rf * u), R = fit(x, y, rf * u), a = Math.atan2(sy, sx), d = 0.1 + i * 0.18;
    [-0.5, 0.5, -0.85, 0.85].forEach((o) => ops.unshift(leafOp(x, y, R * (Math.abs(o) > 0.6 ? 1.25 : 1.6), a + o, d)));
    ops.push(flower(k, x, y, R, d, rot, seed));
    // a small bud on the outer side of the corner
    const bx = x + sx * R * 1.15, by = y + sy * R * 0.95;
    ops.push(flower(k === "l" ? "k" : "l", bx, by, R * 0.42, d + 0.25, -rot, seed + 10));
    // a little flower resting on the paper edge
    const ex = clamp(x - sx * 1.75 * u, 0.5 * u, W - 0.5 * u), ey = clamp((sy < 0 ? ly0 : ly1) + sy * 0.02 * u, 0.5 * u, H - 0.5 * u), er = fit(ex, ey, 0.42 * u);
    ops.unshift(leafOp(ex, ey, er * 1.7, sy < 0 ? -0.5 - (sx < 0 ? 0 : 2.14) : 0.5 + (sx < 0 ? 0 : -2.14), d + 0.3));
    ops.push(flower(k === "l" ? "l" : "k", ex, ey, er, d + 0.35, rot * 2, seed + 20));
  });
  return ops;
});
function fitLetter() { const l = $("letter"); l.style.paddingTop = l.style.paddingBottom = letterPad() + "px"; }
fitLetter();
addEventListener("resize", () => { fitLetter(); letterGarden.resize(); letterFront.resize(); bouquet.resize(); });

// The finishing bouquet: a real 3D scene (Three.js / WebGL) built in js/bouquet3d.js.
const bouquet = (() => {
  const cv = $("bouquetCv"); let api = null, failed = false;
  return {
    start() {
      cv.hidden = false;
      if (!api && !failed) { try { api = Bouquet3D.create(cv, reduce); } catch (e) { failed = true; console.warn("WebGL tidak tersedia", e); } }
      if (api) api.start(); else { cv.hidden = true; $("bqFallback").hidden = false; }
    },
    stop() { if (api) api.stop(); cv.hidden = true; },
    resize() { if (api) api.resize(); },
    get api() { return api; }
  };
})();
$("bloomNext").addEventListener("click", () => showScreen("ending"));
$("flowerBtn").addEventListener("click", () => showScreen("bloom"));
