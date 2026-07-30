function fitCanvas() {
  const canvas = document.getElementById("canvas");

  if (!canvas) return;

  const scale = Math.min(
    window.innerWidth / 1920,
    window.innerHeight / 1080
  );

  canvas.style.transform = `translate(-50%, -50%) scale(${scale})`;
}

window.addEventListener("resize", fitCanvas);
window.addEventListener("load", fitCanvas);

function updateClock() {
  const now = new Date();

  const time = now.toLocaleTimeString("it-IT", {
    hour: "2-digit",
    minute: "2-digit"
  });

  const date = now.toLocaleDateString("it-IT", {
    weekday: "long",
    day: "2-digit",
    month: "long"
  });

  const timeEl = document.getElementById("time");
  const dateEl = document.getElementById("date");

  if (timeEl) timeEl.textContent = time;
  if (dateEl) dateEl.textContent = date;
}

updateClock();
setInterval(updateClock, 1000);

const eq = document.getElementById("equalizer");

if (eq) {

  eq.innerHTML = "";

  for (let i = 0; i < 64; i++) {

    const bar = document.createElement("i");

    bar.style.animationDuration =
      (0.5 + Math.random() * 0.8) + "s";

    bar.style.animationDelay =
      (Math.random() * 0.4) + "s";

    eq.appendChild(bar);
  }
}
