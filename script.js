const els = {
  card: document.getElementById('playerCard'),
  cover: document.getElementById('cover'),
  category: document.getElementById('category'),
  title: document.getElementById('title'),
  speaker: document.getElementById('speaker'),
  description: document.getElementById('description'),
  audio: document.getElementById('audio'),
  playBtn: document.getElementById('playBtn'),
  seek: document.getElementById('seek'),
  currentTime: document.getElementById('currentTime'),
  duration: document.getElementById('duration'),
  grid: document.getElementById('programGrid'),
  search: document.getElementById('search'),
  whatsapp: document.getElementById('whatsappBtn'),
  share: document.getElementById('shareBtn')
};

let programs = [];
let selectedIndex = 0;

function formatTime(sec){
  if(!Number.isFinite(sec)) return '00:00';
  const m = Math.floor(sec / 60).toString().padStart(2,'0');
  const s = Math.floor(sec % 60).toString().padStart(2,'0');
  return `${m}:${s}`;
}

function setProgram(index, autoplay=false){
  selectedIndex = index;
  const p = programs[index];
  if(!p) return;
  els.cover.src = p.cover;
  els.cover.alt = p.title;
  els.category.textContent = p.category || 'DG TV';
  els.title.textContent = p.title;
  els.speaker.textContent = p.speaker || '';
  els.description.textContent = p.description || '';
  els.audio.src = p.audio;
  els.seek.value = 0;
  els.currentTime.textContent = '00:00';
  els.duration.textContent = '00:00';
  els.whatsapp.href = p.whatsapp || '#';
  document.querySelectorAll('.program-card').forEach((c,i)=>c.classList.toggle('active', i===index));
  if(autoplay){ els.audio.play().catch(()=>{}); }
}

function render(list=programs){
  els.grid.innerHTML = '';
  list.forEach((p)=>{
    const realIndex = programs.indexOf(p);
    const btn = document.createElement('button');
    btn.className = 'program-card';
    btn.type = 'button';
    btn.innerHTML = `
      <img src="${p.cover}" alt="${p.title}">
      <div><strong>${p.title}</strong><span>${p.speaker || ''}</span><small>${p.category || ''}</small></div>
    `;
    btn.addEventListener('click', ()=> setProgram(realIndex, false));
    els.grid.appendChild(btn);
  });
  document.querySelectorAll('.program-card').forEach((c,i)=>c.classList.toggle('active', programs.indexOf(list[i])===selectedIndex));
}

els.playBtn.addEventListener('click', ()=>{
  if(els.audio.paused) els.audio.play().catch(()=>{});
  else els.audio.pause();
});
els.audio.addEventListener('play', ()=>{ els.playBtn.textContent='❚❚'; els.card.classList.add('playing'); });
els.audio.addEventListener('pause', ()=>{ els.playBtn.textContent='▶'; els.card.classList.remove('playing'); });
els.audio.addEventListener('loadedmetadata', ()=>{ els.duration.textContent = formatTime(els.audio.duration); });
els.audio.addEventListener('timeupdate', ()=>{
  els.currentTime.textContent = formatTime(els.audio.currentTime);
  if(els.audio.duration) els.seek.value = (els.audio.currentTime / els.audio.duration) * 100;
});
els.seek.addEventListener('input', ()=>{
  if(els.audio.duration) els.audio.currentTime = (els.seek.value / 100) * els.audio.duration;
});
els.search.addEventListener('input', ()=>{
  const q = els.search.value.toLowerCase().trim();
  render(programs.filter(p => [p.title,p.speaker,p.category].join(' ').toLowerCase().includes(q)));
});
els.share.addEventListener('click', async ()=>{
  const p = programs[selectedIndex];
  const data = {title:p?.title || 'DG TV On Demand', text:'Ascolta su DG TV Music Live Radio', url:location.href};
  if(navigator.share) await navigator.share(data).catch(()=>{});
  else navigator.clipboard?.writeText(location.href);
});

fetch('data/programs.json')
  .then(r => r.json())
  .then(data => { programs = data; render(); setProgram(0); })
  .catch(() => {
    els.description.textContent = 'Errore: non trovo data/programs.json. Controlla che la cartella data e il file programs.json siano presenti.';
  });
