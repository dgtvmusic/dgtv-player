
const cfg = window.DGTV_CONFIG || {};
const audio = document.getElementById("audio");
const play = document.getElementById("play");
const playIcon = document.getElementById("playIcon");
const playText = document.getElementById("playText");
const status = document.getElementById("status");
const bars = document.getElementById("bars");
const title = document.getElementById("title");
const artist = document.getElementById("artist");
const cover = document.getElementById("cover");

title.textContent = cfg.TITLE || "DG TV Live Radio";
artist.textContent = cfg.ARTIST || "Musica non stop";
cover.src = cfg.COVER || "assets/cover.jpg";

for(let i=0;i<24;i++){
  const el=document.createElement("i");
  el.style.animationDuration=(0.55+Math.random()*0.9)+"s";
  el.style.animationDelay=(Math.random()*0.45)+"s";
  bars.appendChild(el);
}
bars.classList.add("paused");

function updateClock(){
  const now=new Date();
  document.getElementById("clock").textContent=now.toLocaleTimeString("it-IT",{hour:"2-digit",minute:"2-digit"});
  document.getElementById("date").textContent=now.toLocaleDateString("it-IT",{weekday:"long",day:"2-digit",month:"long"});
}
updateClock(); setInterval(updateClock,1000);

if(cfg.STREAM_URL && !cfg.STREAM_URL.includes("INCOLLA_QUI")){
  audio.src=cfg.STREAM_URL;
}else{
  status.textContent="URL stream mancante";
}

async function startRadio(){
  if(!audio.src){
    status.textContent="Inserisci l’URL in config.js";
    playText.textContent="CONFIGURA STREAM";
    return;
  }
  try{
    status.textContent="Connessione…";
    await audio.play();
    playIcon.textContent="❚❚";
    playText.textContent="IN RIPRODUZIONE";
    bars.classList.remove("paused");
    status.textContent="In diretta";
  }catch(e){
    status.textContent="Riproduzione bloccata";
    playText.textContent="TOCCA PER ASCOLTARE";
  }
}
function stopRadio(){
  audio.pause();
  playIcon.textContent="▶";
  playText.textContent="ASCOLTA LIVE";
  bars.classList.add("paused");
  status.textContent="In pausa";
}
play.addEventListener("click",()=> audio.paused ? startRadio() : stopRadio());
audio.addEventListener("waiting",()=>status.textContent="Buffering…");
audio.addEventListener("playing",()=>status.textContent="In diretta");
audio.addEventListener("error",()=>status.textContent="Errore stream");
if(cfg.AUTOPLAY) startRadio();
