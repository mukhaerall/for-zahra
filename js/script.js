const screens = ["intro", "error", "birthday", "game", "letter", "gallery", "ending"];
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
  run(4200, (p) => {
    const v = Math.round(p * 100);
    bar.style.transform = `scaleX(${p})`;
    pct.textContent = v + "%";
    box.setAttribute("aria-valuenow", v);
    const i = pick(loadMsgs, v);
    if (i !== idx) { idx = i; setStatus(st, loadMsgs[i][1]); }
  }, () => {
    if (isLocked()) { setStatus(st, "opens on 09 November ♡"); return; }
    setStatus(st, "everything is ready for you ♡");
    btn.disabled = false;
    btn.classList.add("ready");
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

$("startBtn").addEventListener("click", () => showScreen("error"));

$("fixBtn").addEventListener("click", () => {
  const btn = $("fixBtn"), st = $("fixStatus");
  let idx = -1;
  btn.disabled = true;
  btn.firstChild.textContent = "Fixing... ";
  $("fixProgress").classList.add("on");
  run(2600, (p) => {
    $("fixBar").style.transform = `scaleX(${p})`;
    const i = pick(fixMsgs, Math.round(p * 100));
    if (i !== idx) { idx = i; setStatus(st, fixMsgs[i][1]); }
  }, () => setTimeout(() => {
    showScreen("birthday");
    launchConfetti();
  }, reduce ? 0 : 500));
});

$("letterBtn").addEventListener("click", () => showScreen("game"));
$("lastBtn").addEventListener("click", () => showScreen("gallery"));
$("galleryBtn").addEventListener("click", () => showScreen("ending"));
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
  for (let i = 0; i < 90; i++) {
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
const musicToggle = $("musicToggle");
const musicLabel = $("musicLabel");
musicToggle.addEventListener("click", async () => {
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
});

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
$("envelope").addEventListener("click", () => {
  $("envelope").classList.add("open");
  setTimeout(() => {
    $("envelope").hidden = true;
    $("letterLayout").hidden = false;
    $("lastBtn").hidden = false;
  }, reduce ? 0 : 650);
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
  resetFix();
  $("secretMessage").hidden = true;
  $("secretBtn").textContent = "psst... one more click?";
  wi = 0;
  const c = $("candleBtn");
  c.classList.remove("out");
  c.textContent = "✦";
  $("candleHint").textContent = "tap the candle to make a wish ✦";
  const e = $("envelope");
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
