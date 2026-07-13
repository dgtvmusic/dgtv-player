
const cfg = window.DGTV_OVERLAY || {};
document.getElementById("programTitle").textContent = cfg.PROGRAM_TITLE || "DG TV LIVE RADIO";
document.getElementById("programSubtitle").textContent = cfg.PROGRAM_SUBTITLE || "Musica non stop";

function updateClock(){
  const now = new Date();
  document.getElementById("clock").textContent =
    now.toLocaleTimeString("it-IT",{hour:"2-digit",minute:"2-digit"});
  document.getElementById("date").textContent =
    now.toLocaleDateString("it-IT",{weekday:"long",day:"2-digit",month:"long"});
}
updateClock();
setInterval(updateClock,1000);

const eq = document.getElementById("equalizer");
for(let i=0;i<26;i++){
  const bar = document.createElement("i");
  bar.style.animationDuration = (0.55 + Math.random()*0.95) + "s";
  bar.style.animationDelay = (Math.random()*0.5) + "s";
  eq.appendChild(bar);
}
