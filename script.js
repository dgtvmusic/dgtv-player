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
  whatsappBtn: document.getElementById('whatsappBtn'),
  featuredGrid: document.getElementById('featuredGrid'),
  programGrid: document.getElementById('programGrid'),
  search: document.getElementById('search')
};

let programs = [];
let featuredPrograms = [];
let currentProgram = null;
let currentIndex = 0;

function formatTime(seconds){
  if (!Number.isFinite(seconds) || seconds < 0) return '00:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

function safeUrl(url, fallback = '#'){
  return url && typeof url === 'string' ? url : fallback;
}

function escapeHtml(value){
  return String(value || '')
    .replaceAll('&','&amp;')
    .replaceAll('<','&lt;')
    .replaceAll('>','&gt;')
    .replaceAll('"','&quot;')
    .replaceAll("'",'&#039;');
}

function getType(program){
  const text = `${program.title || ''} ${program.category || ''}`.toLowerCase();
  if (text.includes('orosc')) return '⭐ SPECIALE';
  if (text.includes('chi c')) return '🎙 TALK';
  if (text.includes('dance') || text.includes('dj') || text.includes('music')) return '🎧 DJ SET';
  return '🎵 RADIO';
}

function updateProgress(){
  if (Number.isFinite(els.audio.duration) && els.audio.duration > 0) {
    const percent = (els.audio.currentTime / els.audio.duration) * 100;
    els.seek.value = percent;
    els.currentTime.textContent = formatTime(els.audio.currentTime);
    els.duration.textContent = formatTime(els.audio.duration);
  }
}

function setProgram(program, autoplay = false){
  if (!program) return;

  currentProgram = program;
  currentIndex = programs.findIndex(p => p.title === program.title);
  els.card.classList.add('changing');

  setTimeout(() => {
    els.cover.src = program.cover || 'images/demo-cover.jpg';
    els.cover.alt = `Copertina ${program.title || 'programma'}`;
    els.category.textContent = program.category || 'DG TV';
    els.title.textContent = program.title || 'Programma';
    els.speaker.textContent = program.speaker || 'DG TV Music Live Radio';
    els.description.textContent = program.description || 'Ascolta il programma on demand.';
    els.audio.src = safeUrl(program.audio, '');
    els.seek.value = 0;
    els.currentTime.textContent = '00:00';
    els.duration.textContent = '00:00';
    els.playBtn.textContent = '▶';
    els.card.classList.remove('playing');
    els.whatsappBtn.href = safeUrl(program.whatsapp, 'https://wa.me/393208026411');

    document.querySelectorAll('[data-title]').forEach(card => {
      card.classList.toggle('active', card.dataset.title === program.title);
    });

    els.card.classList.remove('changing');

    if (autoplay && program.audio) {
      els.audio.play().catch(() => {});
    }
  }, 160);
}

function pickFeatured(list){
  const wanted = ['chi', 'retro', 'music', 'orosc'];
  const selected = [];

  wanted.forEach(word => {
    const found = list.find(p =>
      !selected.includes(p) &&
      `${p.title || ''} ${p.category || ''}`.toLowerCase().includes(word)
    );
    if (found) selected.push(found);
  });

  list.forEach(p => {
    if (selected.length < 4 && !selected.includes(p)) selected.push(p);
  });

  return selected.slice(0, 4);
}

function makeFeaturedCard(program){
  const card = document.createElement('button');
  card.type = 'button';
  card.className = 'featured-card';
  card.dataset.title = program.title || '';

  card.innerHTML = `
    <div class="thumb">
      <img src="${escapeHtml(program.cover || 'images/demo-cover.jpg')}" alt="${escapeHtml(program.title || 'Programma')}">
      <span class="card-badge">${getType(program)}</span>
    </div>
    <div class="card-copy">
      <strong>${escapeHtml(program.title || 'Programma')}</strong>
      <span>${escapeHtml(program.speaker || 'DG TV Music Live Radio')}</span>
      <em class="listen">▶ Ascolta ora</em>
    </div>
  `;

  card.addEventListener('click', () => setProgram(program, false));
  return card;
}

function makeProgramCard(program){
  const card = document.createElement('button');
  card.type = 'button';
  card.className = 'program-card';
  card.dataset.title = program.title || '';

  card.innerHTML = `
    <img src="${escapeHtml(program.cover || 'images/demo-cover.jpg')}" alt="${escapeHtml(program.title || 'Programma')}">
    <div>
      <strong>${escapeHtml(program.title || 'Programma')}</strong>
      <span>${escapeHtml(program.speaker || 'DG TV Music Live Radio')}</span>
    </div>
  `;

  card.addEventListener('click', () => {
    setProgram(program, false);
    els.card.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  return card;
}

function renderFeatured(){
  els.featuredGrid.innerHTML = '';
  featuredPrograms.forEach(program => els.featuredGrid.appendChild(makeFeaturedCard(program)));
}

function renderAll(list){
  els.programGrid.innerHTML = '';

  if (!list.length) {
    els.programGrid.innerHTML = '<div class="empty-state">Nessun programma trovato.</div>';
    return;
  }

  list.forEach(program => els.programGrid.appendChild(makeProgramCard(program)));

  if (currentProgram) {
    document.querySelectorAll('[data-title]').forEach(card => {
      card.classList.toggle('active', card.dataset.title === currentProgram.title);
    });
  }
}

function playNextProgram(){
  if (!programs.length) return;
  const nextIndex = currentIndex >= programs.length - 1 ? 0 : currentIndex + 1;
  setProgram(programs[nextIndex], true);
}

els.playBtn.addEventListener('click', () => {
  if (!els.audio.src) return;

  if (els.audio.paused) {
    els.audio.play().catch(() => {});
  } else {
    els.audio.pause();
  }
});

els.audio.addEventListener('play', () => {
  els.playBtn.textContent = '❚❚';
  els.card.classList.add('playing');
});

els.audio.addEventListener('pause', () => {
  els.playBtn.textContent = '▶';
  els.card.classList.remove('playing');
});

els.audio.addEventListener('ended', playNextProgram);

els.audio.addEventListener('loadedmetadata', () => {
  els.duration.textContent = formatTime(els.audio.duration);
});

els.audio.addEventListener('timeupdate', updateProgress);

els.seek.addEventListener('input', () => {
  if (Number.isFinite(els.audio.duration) && els.audio.duration > 0) {
    els.audio.currentTime = (Number(els.seek.value) / 100) * els.audio.duration;
    updateProgress();
  }
});

els.search.addEventListener('input', () => {
  const q = els.search.value.trim().toLowerCase();
  const filtered = programs.filter(p =>
    `${p.title || ''} ${p.speaker || ''} ${p.category || ''}`.toLowerCase().includes(q)
  );
  renderAll(filtered);
});

async function init(){
  try {
    const response = await fetch('data/programs.json', { cache: 'no-store' });
    if (!response.ok) throw new Error('programs.json non trovato');

    programs = await response.json();
    featuredPrograms = pickFeatured(programs);
    renderFeatured();
    renderAll(programs);

    if (featuredPrograms.length) setProgram(featuredPrograms[0], false);
    else if (programs.length) setProgram(programs[0], false);
  } catch (err) {
    els.featuredGrid.innerHTML = '<div class="empty-state">Errore nel caricamento dei programmi.</div>';
    els.programGrid.innerHTML = '<div class="empty-state">Controlla data/programs.json.</div>';
    console.error(err);
  }
}

init();
