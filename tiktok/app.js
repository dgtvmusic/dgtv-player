
function fitCanvas(){
  const canvas = document.getElementById("canvas");
  const sx = window.innerWidth / 1080;
  const sy = window.innerHeight / 1920;
  canvas.style.transform = `scale(${sx},${sy})`;
}
window.addEventListener("resize", fitCanvas);
fitCanvas();

function updateClock(){
  const now = new Date();
  document.getElementById("time").textContent =
    now.toLocaleTimeString("it-IT",{hour:"2-digit",minute:"2-digit"});
  document.getElementById("date").textContent =
    now.toLocaleDateString("it-IT",{weekday:"long",day:"2-digit",month:"long"});
}
updateClock();
setInterval(updateClock,1000);

const eq = document.getElementById("equalizer");
for(let i=0;i<30;i++){
  const bar = document.createElement("i");
  bar.style.animationDuration = (0.58 + Math.random()*0.92) + "s";
  bar.style.animationDelay = (Math.random()*0.45) + "s";
  eq.appendChild(bar);
}
