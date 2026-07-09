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
  shareBtn: document.getElementById('shareBtn'),
  siteBtn: document.getElementById('siteBtn'),
  grid: document.getElementById('programGrid'),
  prevBtn: document.getElementById('prevBtn'),
  nextBtn: document.getElementById('nextBtn')
};

let programs = [];
let currentProgram = null;
let currentIndex = 0;

function formatTime(seconds){
  if (!Number.isFinite(seconds) || seconds < 0) return '00:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}


function fitTitleToOneLine(){
  const title = els.title;
  if (!title) return;

  title.style.whiteSpace = 'nowrap';
  title.style.overflow = 'hidden';
  title.style.textOverflow = 'ellipsis';

  if (window.innerWidth <= 780) {
    title.style.fontSize = window.innerWidth <= 420 ? '23px' : '24px';
  } else {
    title.style.fontSize = '';
  }

  requestAnimationFrame(() => {
    let size = parseFloat(window.getComputedStyle(title).fontSize);
    while (title.scrollWidth > title.clientWidth && size > 18) {
      size -= 1;
      title.style.fontSize = `${size}px`;
    }
  });
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
    .replaceAll("'","&#039;");
}

function updateProgress(){
  if (Number.isFinite(els.audio.duration) && els.audio.duration > 0) {
    const percent = (els.audio.currentTime / els.audio.duration) * 100;
    els.seek.value = percent;
    els.seek.style.setProperty('--progress', `${percent}%`);
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
    fitTitleToOneLine();
    els.speaker.textContent = program.speaker || 'DG TV Music Live Radio';
    els.description.textContent = program.description || '';

    const audioUrl = safeUrl(program.audio, '');
    els.audio.src = audioUrl ? `${audioUrl}?v=${Date.now()}` : '';

    els.seek.value = 0;
    els.seek.style.setProperty('--progress', '0%');
    els.currentTime.textContent = '00:00';
    els.duration.textContent = '00:00';
    els.playBtn.textContent = '▶';
    els.card.classList.remove('playing');

    els.whatsappBtn.href = safeUrl(program.whatsapp, 'https://wa.me/393208026411');

    document.querySelectorAll('.program-card').forEach(card => {
      card.classList.toggle('active', card.dataset.title === program.title);
    });

    els.card.classList.remove('changing');

    if (autoplay && program.audio) {
      els.audio.play().catch(() => {});
    }
  }, 120);
}

function makeCard(program){
  const card = document.createElement('button');
  card.type = 'button';
  card.className = 'program-card';
  card.dataset.title = program.title || '';

  card.innerHTML = `
    <img src="${escapeHtml(program.cover || 'images/demo-cover.jpg')}" alt="${escapeHtml(program.title || 'Programma')}">
    <div class="card-body">
      <strong>${escapeHtml(program.title || 'Programma')}</strong>
      <span>${escapeHtml(program.speaker || 'DG TV')}</span>
      <em>● ON DEMAND</em>
    </div>
  `;

  card.addEventListener('click', () => {
    setProgram(program, false);
    setTimeout(() => {
      card.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }, 120);
  });
  return card;
}

function renderPrograms(list){
  els.grid.innerHTML = '';

  if (!list.length) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.textContent = 'Nessun programma trovato.';
    els.grid.appendChild(empty);
    return;
  }

  list.forEach(program => els.grid.appendChild(makeCard(program)));

  if (currentProgram) {
    document.querySelectorAll('.program-card').forEach(card => {
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

els.audio.addEventListener('ended', () => {
  els.playBtn.textContent = '▶';
  els.card.classList.remove('playing');
  playNextProgram();
});

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

els.prevBtn.addEventListener('click', () => {
  els.grid.scrollBy({ left: -Math.round(els.grid.clientWidth * 0.75), behavior: 'smooth' });
});

els.nextBtn.addEventListener('click', () => {
  els.grid.scrollBy({ left: Math.round(els.grid.clientWidth * 0.75), behavior: 'smooth' });
});

els.siteBtn.innerHTML = 'LIVE RADIO';
els.siteBtn.addEventListener('click', () => {
  window.open('https://www.dgtvmusic.com', '_blank');
});

els.shareBtn.addEventListener('click', () => {
  window.open('https://dgtvmusic.github.io/dgtv-player/', '_blank');
});

window.addEventListener('resize', fitTitleToOneLine);

async function init(){
  try {
    const response = await fetch('data/programs.json', { cache: 'no-store' });

    if (!response.ok) {
      throw new Error('programs.json non trovato');
    }

    programs = await response.json();
    renderPrograms(programs);

    if (programs.length) {
      setProgram(programs[0], false);
    }
  } catch (err) {
    els.grid.innerHTML = `
      <div class="empty-state">
        Errore nel caricamento dei programmi. Controlla data/programs.json.
      </div>
    `;
    console.error(err);
  }
}

init();
