const els = {
  playerCard: document.getElementById('playerCard'),
  cover: document.getElementById('cover'),
  category: document.getElementById('category'),
  title: document.getElementById('title'),
  speaker: document.getElementById('speaker'),
  description: document.getElementById('description'),
  audio: document.getElementById('audio'),
  playBtn: document.getElementById('playBtn'),
  progress: document.getElementById('progress'),
  currentTime: document.getElementById('currentTime'),
  duration: document.getElementById('duration'),
  whatsappBtn: document.getElementById('whatsappBtn'),
  shareBtn: document.getElementById('shareBtn'),
  grid: document.getElementById('programGrid'),
  search: document.getElementById('search')
};

let programs = [];
let activeIndex = -1;

function formatTime(seconds){
  if(!Number.isFinite(seconds)) return '00:00';
  const m = Math.floor(seconds / 60).toString().padStart(2,'0');
  const s = Math.floor(seconds % 60).toString().padStart(2,'0');
  return `${m}:${s}`;
}

function renderPrograms(list = programs){
  els.grid.innerHTML = '';
  list.forEach((p) => {
    const originalIndex = programs.indexOf(p);
    const card = document.createElement('button');
    card.className = 'program-card' + (originalIndex === activeIndex ? ' active' : '');
    card.type = 'button';
    card.innerHTML = `
      <img src="${p.cover}" alt="${p.title}" onerror="this.src='images/demo-cover.jpg'">
      <div><strong>${p.title}</strong><span>${p.speaker}</span></div>
    `;
    card.addEventListener('click', () => selectProgram(originalIndex, true));
    els.grid.appendChild(card);
  });
}

function selectProgram(index, autoplay = false){
  const p = programs[index];
  if(!p) return;
  activeIndex = index;
  els.cover.src = p.cover;
  els.cover.alt = `Copertina ${p.title}`;
  els.category.textContent = p.category || 'DG TV';
  els.title.textContent = p.title;
  els.speaker.textContent = p.speaker;
  els.description.textContent = p.description || '';
  els.audio.src = p.audio;
  els.whatsappBtn.href = p.whatsapp || 'https://wa.me/390000000000';
  els.progress.value = 0;
  els.currentTime.textContent = '00:00';
  els.duration.textContent = '00:00';
  els.playBtn.textContent = '▶';
  els.playerCard.classList.remove('playing');
  renderPrograms(filterPrograms());
  if(autoplay){
    els.audio.play().then(() => {
      els.playBtn.textContent = '❚❚';
      els.playerCard.classList.add('playing');
    }).catch(() => {});
  }
}

function filterPrograms(){
  const q = (els.search.value || '').toLowerCase().trim();
  if(!q) return programs;
  return programs.filter(p => `${p.title} ${p.speaker} ${p.category}`.toLowerCase().includes(q));
}

els.playBtn.addEventListener('click', () => {
  if(activeIndex < 0 && programs.length) selectProgram(0, false);
  if(els.audio.paused){
    els.audio.play().then(() => {
      els.playBtn.textContent = '❚❚';
      els.playerCard.classList.add('playing');
    }).catch(() => {});
  } else {
    els.audio.pause();
    els.playBtn.textContent = '▶';
    els.playerCard.classList.remove('playing');
  }
});

els.audio.addEventListener('loadedmetadata', () => { els.duration.textContent = formatTime(els.audio.duration); });
els.audio.addEventListener('timeupdate', () => {
  if(Number.isFinite(els.audio.duration) && els.audio.duration > 0){
    els.progress.value = (els.audio.currentTime / els.audio.duration) * 100;
  }
  els.currentTime.textContent = formatTime(els.audio.currentTime);
});
els.audio.addEventListener('ended', () => { els.playBtn.textContent = '▶'; els.playerCard.classList.remove('playing'); });
els.progress.addEventListener('input', () => {
  if(Number.isFinite(els.audio.duration) && els.audio.duration > 0){
    els.audio.currentTime = (Number(els.progress.value) / 100) * els.audio.duration;
  }
});
els.search.addEventListener('input', () => renderPrograms(filterPrograms()));
els.shareBtn.addEventListener('click', async () => {
  const text = activeIndex >= 0 ? `Ascolta ${programs[activeIndex].title} su DG TV Music Live Radio` : 'DG TV Music Live Radio On Demand';
  const url = window.location.href;
  if(navigator.share){
    try{ await navigator.share({title:text, text, url}); }catch(e){}
  } else {
    await navigator.clipboard.writeText(url);
    els.shareBtn.textContent = 'Link copiato';
    setTimeout(() => els.shareBtn.textContent = 'Condividi', 1500);
  }
});

fetch('data/programs.json?ts=' + Date.now())
  .then(r => r.json())
  .then(data => {
    programs = Array.isArray(data) ? data : [];
    renderPrograms();
    if(programs.length) selectProgram(0, false);
  })
  .catch(() => {
    els.grid.innerHTML = '<p style="color:#fff">Impossibile caricare data/programs.json</p>';
  });
