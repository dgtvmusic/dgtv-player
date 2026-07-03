const audio = document.getElementById('audio');
const playBtn = document.getElementById('playBtn');
const seek = document.getElementById('seek');
const currentEl = document.getElementById('current');
const durationEl = document.getElementById('duration');
const coverEl = document.getElementById('cover');
const titleEl = document.getElementById('title');
const descEl = document.getElementById('description');
const speakerEl = document.getElementById('speaker');
const categoryEl = document.getElementById('category');
const programList = document.getElementById('programList');
const search = document.getElementById('search');
const shareBtn = document.getElementById('shareBtn');
const downloadBtn = document.getElementById('downloadBtn');
const whatsappBtn = document.getElementById('whatsappBtn');
const playerCard = document.querySelector('.player-card');

let programs = [];
let selected = 0;

function fmt(sec){
  if(!isFinite(sec)) return '00:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

async function loadPrograms(){
  try{
    const res = await fetch('data/programs.json');
    programs = await res.json();
  }catch(e){
    programs = [{
      title:'Music Night',
      category:'On Demand',
      description:'Le hit più belle di oggi e di sempre, selezionate da DG TV Music Live Radio.',
      cover:'images/music-night.svg',
      audio:'audio/music-night.mp3',
      whatsapp:'https://wa.me/390000000000'
    }];
  }
  renderPrograms(programs);
  selectProgram(0);
}

function renderPrograms(list){
  programList.innerHTML = '';
  list.forEach((p, i) => {
    const originalIndex = programs.indexOf(p);
    const card = document.createElement('button');
    card.className = `program-card ${originalIndex === selected ? 'active' : ''}`;
    card.innerHTML = `<img src="${p.cover}" alt=""><div><strong>${p.title}</strong><span>${p.speaker || p.category || 'On Demand'}</span></div>`;
    card.addEventListener('click', () => selectProgram(originalIndex));
    programList.appendChild(card);
  });
}

function selectProgram(i){
  selected = i;
  const p = programs[i];
  audio.pause();
  audio.src = p.audio;
  coverEl.src = p.cover;
  titleEl.textContent = p.title;
  descEl.textContent = p.description;
  speakerEl.textContent = p.speaker ? p.speaker : '';
  categoryEl.textContent = p.category || 'On Demand';
  downloadBtn.href = p.audio;
  whatsappBtn.href = p.whatsapp || 'https://wa.me/';
  playBtn.textContent = '▶';
  playerCard.classList.remove('playing');
  renderPrograms(programs.filter(x => `${x.title} ${x.category} ${x.description}`.toLowerCase().includes(search.value.toLowerCase())));
}

playBtn.addEventListener('click', () => {
  if(audio.paused) audio.play(); else audio.pause();
});
audio.addEventListener('play', () => { playBtn.textContent = '❚❚'; playerCard.classList.add('playing'); });
audio.addEventListener('pause', () => { playBtn.textContent = '▶'; playerCard.classList.remove('playing'); });
audio.addEventListener('loadedmetadata', () => durationEl.textContent = fmt(audio.duration));
audio.addEventListener('timeupdate', () => {
  currentEl.textContent = fmt(audio.currentTime);
  seek.value = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
});
seek.addEventListener('input', () => { if(audio.duration) audio.currentTime = (seek.value / 100) * audio.duration; });
search.addEventListener('input', () => renderPrograms(programs.filter(p => `${p.title} ${p.category} ${p.description}`.toLowerCase().includes(search.value.toLowerCase()))));
shareBtn.addEventListener('click', async () => {
  const p = programs[selected];
  const shareData = { title: p.title, text: p.description, url: window.location.href };
  if(navigator.share) await navigator.share(shareData); else navigator.clipboard.writeText(window.location.href);
});

loadPrograms();
