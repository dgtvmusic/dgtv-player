const els = {
  card: document.getElementById('playerCard'),
  cover: document.getElementById('cover'),
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

/* =========================================================
   IPHONE / IOS MEDIA SESSION
   Aggiorna titolo, DJ e copertina nella schermata di blocco
   ========================================================= */

function updateMediaSession(program){
  if (!('mediaSession' in navigator) || !program) return;

  const coverUrl = program.cover
    ? new URL(program.cover, window.location.href).href
    : new URL('images/demo-cover.jpg', window.location.href).href;

  try {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: program.title || 'Programma',
      artist: program.speaker || 'DG TV LIVE RADIO',
      album: 'DG TV LIVE RADIO • ON DEMAND',
      artwork: [
        {
          src: coverUrl,
          sizes: '96x96',
          type: 'image/png'
        },
        {
          src: coverUrl,
          sizes: '128x128',
          type: 'image/png'
        },
        {
          src: coverUrl,
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: coverUrl,
          sizes: '256x256',
          type: 'image/png'
        },
        {
          src: coverUrl,
          sizes: '384x384',
          type: 'image/png'
        },
        {
          src: coverUrl,
          sizes: '512x512',
          type: 'image/png'
        }
      ]
    });
  } catch (err) {
    console.warn('Media Session metadata non disponibile:', err);
  }
}

function setupMediaSession(){

  if (!('mediaSession' in navigator)) return;

  try {
    navigator.mediaSession.setActionHandler('play', () => {
      els.audio.play().catch(() => {});
    });
  } catch (err) {}

  try {
    navigator.mediaSession.setActionHandler('pause', () => {
      els.audio.pause();
    });
  } catch (err) {}

  try {
    navigator.mediaSession.setActionHandler('nexttrack', () => {
      playNextProgram();
    });
  } catch (err) {}

  try {
    navigator.mediaSession.setActionHandler('previoustrack', () => {
      playPreviousProgram();
    });
  } catch (err) {}
}

/* =========================================================
   PROGRESSO
   ========================================================= */

function updateProgress(){
  if (Number.isFinite(els.audio.duration) && els.audio.duration > 0) {
    const percent = (els.audio.currentTime / els.audio.duration) * 100;

    els.seek.value = percent;
    els.seek.style.setProperty('--progress', `${percent}%`);

    els.currentTime.textContent = formatTime(els.audio.currentTime);
    els.duration.textContent = formatTime(els.audio.duration);
  }
}

/* =========================================================
   CAMBIO PROGRAMMA
   ========================================================= */

function setProgram(program, autoplay = false){
  if (!program) return;

  currentProgram = program;
  currentIndex = programs.findIndex(p => p.title === program.title);

  els.card.classList.add('changing');

  setTimeout(() => {

    els.cover.src = program.cover || 'images/demo-cover.jpg';
    els.cover.alt = `Copertina ${program.title || 'programma'}`;

    els.title.textContent = program.title || 'Programma';

    els.title.classList.remove('title-small','title-xsmall');

    const titleLen = (program.title || '').length;

    if (titleLen > 22) {
      els.title.classList.add('title-xsmall');
    } else if (titleLen > 16) {
      els.title.classList.add('title-small');
    }

    els.speaker.textContent =
      program.speaker || 'DG TV Music Live Radio';

    els.description.textContent =
      program.description || '';

    const audioUrl = safeUrl(program.audio, '');

    els.audio.src = audioUrl
      ? `${audioUrl}?v=${Date.now()}`
      : '';

    els.seek.value = 0;
    els.seek.style.setProperty('--progress', '0%');

    els.currentTime.textContent = '00:00';
    els.duration.textContent = '00:00';

    els.playBtn.textContent = '▶';
    els.card.classList.remove('playing');

    els.whatsappBtn.href =
      safeUrl(program.whatsapp, 'https://wa.me/393208026411');

    /* AGGIORNA TITOLO, DJ E COPERTINA SU IPHONE */
    updateMediaSession(program);

    document.querySelectorAll('.program-card').forEach(card => {
      card.classList.toggle(
        'active',
        card.dataset.title === program.title
      );
    });

    const activeCard =
      document.querySelector('.program-card.active');

    if (activeCard && els.grid) {

      const left =
        activeCard.offsetLeft -
        (els.grid.clientWidth / 2) +
        (activeCard.clientWidth / 2);

      els.grid.scrollTo({
        left: Math.max(0, left),
        behavior: 'smooth'
      });
    }

    removeDgtvLabel();

    els.card.classList.remove('changing');

    if (autoplay && program.audio) {
      els.audio.play().catch(() => {});
    }

  }, 120);
}

/* =========================================================
   CARD PROGRAMMI
   ========================================================= */

function makeCard(program){

  const card = document.createElement('button');

  card.type = 'button';
  card.className = 'program-card';

  card.dataset.title = program.title || '';

  card.innerHTML = `
    <img
      src="${escapeHtml(program.cover || 'images/demo-cover.jpg')}"
      alt="${escapeHtml(program.title || 'Programma')}"
    >

    <div class="card-body">

      <strong>
        ${escapeHtml(program.title || 'Programma')}
      </strong>

      <span>
        ${escapeHtml(program.speaker || 'DG TV')}
      </span>

      <em class="listen-chip">
        ▶ ASCOLTA
      </em>

    </div>
  `;

  card.addEventListener('click', (event) => {

    const autoplay =
      event.target &&
      event.target.classList &&
      event.target.classList.contains('listen-chip');

    setProgram(program, autoplay);

    setTimeout(() => {

      card.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest'
      });

    }, 120);

  });

  return card;
}

/* =========================================================
   RENDER PROGRAMMI
   ========================================================= */

function renderPrograms(list){

  els.grid.innerHTML = '';

  if (!list.length) {

    const empty = document.createElement('div');

    empty.className = 'empty-state';
    empty.textContent = 'Nessun programma trovato.';

    els.grid.appendChild(empty);

    return;
  }

  list.forEach(program => {
    els.grid.appendChild(makeCard(program));
  });

  if (currentProgram) {

    document.querySelectorAll('.program-card').forEach(card => {

      card.classList.toggle(
        'active',
        card.dataset.title === currentProgram.title
      );

    });

  }
}

/* =========================================================
   PROGRAMMA SUCCESSIVO
   ========================================================= */

function playNextProgram(){

  if (!programs.length) return;

  const nextIndex =
    currentIndex >= programs.length - 1
      ? 0
      : currentIndex + 1;

  setProgram(programs[nextIndex], true);
}

/* =========================================================
   PROGRAMMA PRECEDENTE
   ========================================================= */

function playPreviousProgram(){

  if (!programs.length) return;

  const previousIndex =
    currentIndex <= 0
      ? programs.length - 1
      : currentIndex - 1;

  setProgram(programs[previousIndex], true);
}

/* =========================================================
   PLAY / PAUSA
   ========================================================= */

els.playBtn.addEventListener('click', () => {

  if (!els.audio.src) return;

  if (els.audio.paused) {

    els.audio.play().catch(() => {});

  } else {

    els.audio.pause();

  }

});

/* =========================================================
   AUDIO PLAY
   ========================================================= */

els.audio.addEventListener('play', () => {

  els.playBtn.textContent = '❚❚';

  els.card.classList.add('playing');

});

/* =========================================================
   AUDIO PAUSA
   ========================================================= */

els.audio.addEventListener('pause', () => {

  els.playBtn.textContent = '▶';

  els.card.classList.remove('playing');

});

/* =========================================================
   AUDIO TERMINATO
   ========================================================= */

els.audio.addEventListener('ended', () => {

  els.playBtn.textContent = '▶';

  els.card.classList.remove('playing');

  playNextProgram();

});

/* =========================================================
   METADATI AUDIO
   ========================================================= */

els.audio.addEventListener('loadedmetadata', () => {

  els.duration.textContent =
    formatTime(els.audio.duration);

});

/* =========================================================
   TIME UPDATE
   ========================================================= */

els.audio.addEventListener('timeupdate', updateProgress);

/* =========================================================
   SEEK
   ========================================================= */

els.seek.addEventListener('input', () => {

  if (
    Number.isFinite(els.audio.duration) &&
    els.audio.duration > 0
  ) {

    els.audio.currentTime =
      (Number(els.seek.value) / 100) *
      els.audio.duration;

    updateProgress();

  }

});

/* =========================================================
   PULSANTE PRECEDENTE
   ========================================================= */

els.prevBtn.addEventListener('click', () => {

  els.grid.scrollBy({
    left: -Math.round(els.grid.clientWidth * 0.75),
    behavior: 'smooth'
  });

});

/* =========================================================
   PULSANTE SUCCESSIVO
   ========================================================= */

els.nextBtn.addEventListener('click', () => {

  els.grid.scrollBy({
    left: Math.round(els.grid.clientWidth * 0.75),
    behavior: 'smooth'
  });

});

/* =========================================================
   LIVE RADIO
   ========================================================= */

els.siteBtn.innerHTML = 'LIVE RADIO';

els.siteBtn.addEventListener('click', () => {

  window.open(
    'https://www.dgtvmusic.com',
    '_blank'
  );

});

/* =========================================================
   CONDIVIDI
   ========================================================= */

els.shareBtn.addEventListener('click', () => {

  window.open(
    'https://dgtvmusic.github.io/dgtv-player/',
    '_blank'
  );

});

/* =========================================================
   CARICAMENTO PROGRAMMI
   ========================================================= */

async function init(){

  try {

    const response =
      await fetch(
        `data/programs.json?v=${Date.now()}`,
        {
          cache: 'no-store'
        }
      );

    if (!response.ok) {

      throw new Error(
        'programs.json non trovato'
      );

    }

    programs = await response.json();

    renderPrograms(programs);

    /* ATTIVA MEDIA SESSION */
    setupMediaSession();

    if (programs.length) {

      setProgram(
        programs[0],
        false
      );

    }

  } catch (err) {

    els.grid.innerHTML = `
      <div class="empty-state">
        Errore nel caricamento dei programmi.
        Controlla data/programs.json.
      </div>
    `;

    console.error(err);

  }

}

init();

/* =========================================================
   RIMOZIONE ETICHETTA DG TV
   ========================================================= */

function removeDgtvLabel(){

  document
    .querySelectorAll(
      '.eyebrow, .program-brand, .brand, #brand, #programBrand, .category, #category'
    )
    .forEach(el => {

      const txt =
        (el.textContent || '')
          .trim()
          .replace(/\s+/g, ' ')
          .toUpperCase();

      if (
        !txt ||
        txt === 'DG TV' ||
        txt === 'DGTV' ||
        txt === 'D G T V'
      ) {

        el.remove();

      }

    });

  document
    .querySelectorAll('body *')
    .forEach(el => {

      const txt =
        (el.textContent || '')
          .trim()
          .replace(/\s+/g, ' ')
          .toUpperCase();

      const hasChildren =
        el.children &&
        el.children.length > 0;

      if (
        !hasChildren &&
        (
          txt === 'DG TV' ||
          txt === 'DGTV' ||
          txt === 'D G T V'
        )
      ) {

        el.remove();

      }

    });

}

removeDgtvLabel();

window.addEventListener(
  'load',
  removeDgtvLabel
);

setInterval(
  removeDgtvLabel,
  500
);

const dgtvLabelObserver =
  new MutationObserver(
    removeDgtvLabel
  );

dgtvLabelObserver.observe(
  document.body,
  {
    childList: true,
    subtree: true
  }
);
