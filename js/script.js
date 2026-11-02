const screens = ["intro", "error", "birthday", "letter", "ending"];
const $ = (id) => document.getElementById(id);

function showScreen(name) {
  screens.forEach((screen) => $(screen).classList.toggle("active", screen === name));
  window.scrollTo({ top: 0, behavior: "smooth" });
}

$("startBtn").addEventListener("click", () => {
  $("statusText").textContent = "surprise successfully prepared ♡";
  showScreen("error");
});

$("fixBtn").addEventListener("click", () => {
  showScreen("birthday");
  launchConfetti();
});

$("letterBtn").addEventListener("click", () => showScreen("letter"));
$("lastBtn").addEventListener("click", () => showScreen("ending"));
$("replayBtn").addEventListener("click", () => {
  $("secretMessage").hidden = true;
  showScreen("intro");
});
$("secretBtn").addEventListener("click", () => {
  $("secretMessage").hidden = !$("secretMessage").hidden;
});

function launchConfetti() {
  const area = $("confetti");
  area.innerHTML = "";
  for (let i = 0; i < 42; i++) {
    const piece = document.createElement("i");
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.animationDelay = `${Math.random() * 1.4}s`;
    piece.style.animationDuration = `${2.5 + Math.random() * 2}s`;
    area.appendChild(piece);
  }
}

const audio = $("bgMusic");
const musicToggle = $("musicToggle");
const musicLabel = $("musicLabel");
musicToggle.addEventListener("click", async () => {
  if (audio.paused) {
    try {
      await audio.play();
      musicToggle.classList.add("playing");
      musicLabel.textContent = "sound on";
    } catch (error) {
      musicLabel.textContent = "add music file";
    }
  } else {
    audio.pause();
    musicToggle.classList.remove("playing");
    musicLabel.textContent = "sound off";
  }
});

// A small typing-style welcome status, without delaying the experience.
window.addEventListener("load", () => {
  const status = $("statusText");
  if (status) status.textContent = "everything is ready for you ♡";
});
