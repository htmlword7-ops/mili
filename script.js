// ===== CONFIG =====
// Set the date you started apologizing (YYYY-MM-DD)
const START_DATE_ISO = '2025-10-17'; // change this to your real start date

// Image loading options
// 1) Preferred: create images/manifest.json with: ["photo1.jpg","photo2.png", ...]
// 2) Or fallback: list file names here and put them in images/ folder
const IMAGE_DIR = 'images/';
const IMAGE_FILES = [
  'WhatsApp Image 2025-10-17 at 20.51.57.jpeg'
];

// ===== Day Counter =====
function calculateDaysSince(startDateIso){
  const start = new Date(startDateIso + 'T00:00:00');
  const today = new Date();
  // Normalize to midnight to avoid TZ partial days
  const startUTC = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
  const todayUTC = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  const diffMs = todayUTC - startUTC;
  const days = Math.floor(diffMs / (1000*60*60*24)) + 1; // Day 1 on start date
  return Math.max(days, 1);
}

function formatSinceText(startDateIso){
  const d = new Date(startDateIso + 'T00:00:00');
  const formatter = new Intl.DateTimeFormat(undefined, { year:'numeric', month:'long', day:'numeric' });
  return `since ${formatter.format(d)}`;
}

function initDayCounter(){
  const dayEl = document.getElementById('dayNumber');
  const sinceEl = document.getElementById('sinceText');
  if(!dayEl || !sinceEl) return;
  const day = calculateDaysSince(START_DATE_ISO);
  dayEl.textContent = String(day);
  sinceEl.textContent = formatSinceText(START_DATE_ISO);
}

// ===== Gallery / Carousel =====
function createSlideElement(src, index){
  const s = document.createElement('div');
  s.className = 'slide';
  const img = document.createElement('img');
  img.src = src;
  img.alt = `Photo ${index+1}`;
  s.appendChild(img);
  return s;
}

function createDotElement(index){
  const d = document.createElement('div');
  d.className = 'dot';
  d.dataset.index = String(index);
  return d;
}

async function initCarousel(){
  const slidesEl = document.getElementById('slides');
  const dotsEl = document.getElementById('dots');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  if(!slidesEl || !dotsEl || !prevBtn || !nextBtn) return;

  async function loadManifest(){
    // Try inline media first (works when opening file:// locally)
    const inline = document.getElementById('inline-media');
    if(inline){
      try{
        const arr = JSON.parse(inline.textContent || '[]');
        if(Array.isArray(arr) && arr.length){ return arr; }
      }catch(_e){ /* ignore */ }
    }
    // Fallback to fetching manifest.json (works when hosted)
    try{
      const res = await fetch(IMAGE_DIR + 'manifest.json', { cache:'no-store' });
      if(!res.ok) return null;
      const data = await res.json();
      if(Array.isArray(data)) return data;
      return null;
    }catch(_e){
      return null;
    }
  }

  const manifest = await loadManifest();
  const files = Array.isArray(manifest) && manifest.length > 0 ? manifest : IMAGE_FILES;
  const imageSources = files.filter(Boolean).map(src => {
    // If src is a URL, starts with images/, or already contains a path separator, keep as is
    if(/^https?:\/\//i.test(src) || src.startsWith(IMAGE_DIR) || src.includes('/')) return src;
    return IMAGE_DIR + src;
  });
  if(imageSources.length === 0){
    // graceful placeholder
    slidesEl.appendChild(createSlideElement('https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop', 0));
    dotsEl.appendChild(createDotElement(0));
  } else {
    imageSources.forEach((src, i) => {
      const isVideo = /\.(mp4|webm|ogg)$/i.test(src);
      const el = document.createElement('div');
      el.className = 'slide';
      if(isVideo){
        const v = document.createElement('video');
        v.src = src;
        v.playsInline = true;
        v.muted = true;
        v.loop = true;
        v.autoplay = true;
        el.appendChild(v);
      }else{
        const img = document.createElement('img');
        img.src = src;
        img.alt = `Photo ${i+1}`;
        el.appendChild(img);
      }
      slidesEl.appendChild(el);
      dotsEl.appendChild(createDotElement(i));
    });
  }

  const total = slidesEl.children.length;
  let index = 0;
  let intervalId = null;

  const captionEl = document.getElementById('slideCaption');

  function setActive(i){
    index = (i + total) % total;
    const offset = -index * 100;
    slidesEl.style.transform = `translateX(${offset}%)`;
    [...dotsEl.children].forEach((dot, di) => {
      dot.classList.toggle('active', di === index);
    });
    if(captionEl){
      const child = slidesEl.children[index];
      let src = '';
      const vid = child.querySelector('video');
      const img = child.querySelector('img');
      if(vid) src = vid.currentSrc || vid.src || '';
      if(!src && img) src = img.currentSrc || img.src || '';
      captionEl.textContent = src ? deriveCaptionFromSrc(src) : '';
    }
  }

  prevBtn.addEventListener('click', () => setActive(index - 1));
  nextBtn.addEventListener('click', () => setActive(index + 1));
  dotsEl.addEventListener('click', (e) => {
    const target = e.target;
    if(target && target.classList.contains('dot')){
      const di = Number(target.dataset.index || 0);
      setActive(di);
    }
  });

  // swipe support (basic)
  let startX = null;
  slidesEl.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; }, { passive:true });
  slidesEl.addEventListener('touchend', (e) => {
    if(startX === null) return;
    const dx = e.changedTouches[0].clientX - startX;
    if(Math.abs(dx) > 40){
      if(dx > 0) setActive(index - 1); else setActive(index + 1);
    }
    startX = null;
  });

  function startAutoAdvance(){
    stopAutoAdvance();
    intervalId = setInterval(() => setActive(index + 1), 5000);
  }
  function stopAutoAdvance(){
    if(intervalId){
      clearInterval(intervalId);
      intervalId = null;
    }
  }

  // pause on hover/focus
  const carouselEl = slidesEl.parentElement;
  if(carouselEl){
    carouselEl.addEventListener('mouseenter', stopAutoAdvance);
    carouselEl.addEventListener('mouseleave', startAutoAdvance);
    carouselEl.addEventListener('focusin', stopAutoAdvance);
    carouselEl.addEventListener('focusout', startAutoAdvance);
  }

  setActive(0);
  startAutoAdvance();
}

// Background video selection (first video if present)
async function initBackgroundVideo(){
  const videoEl = document.getElementById('bgVideo');
  if(!videoEl) return;
  try{
    const inline = document.getElementById('inline-media');
    let files = [];
    if(inline){
      try{ files = JSON.parse(inline.textContent || '[]'); }catch(_e){ files = []; }
    }
    if(!Array.isArray(files) || files.length === 0){
      const res = await fetch(IMAGE_DIR + 'manifest.json', { cache:'no-store' });
      const list = res.ok ? await res.json() : [];
      files = Array.isArray(list) ? list : [];
    }
    const vids = files.filter(f => /\.(mp4|webm|ogg)$/i.test(f)).map(f => f.includes('/') ? f : IMAGE_DIR + f);
    if(vids.length > 0){
      let bi = 0;
      function setBg(){
        videoEl.src = vids[bi];
        videoEl.play().catch(() => {});
        bi = (bi + 1) % vids.length;
      }
      setBg();
      setInterval(setBg, 12000); // rotate every 12s
    }
  }catch(_e){ /* ignore */ }
}

// ===== Init =====
document.addEventListener('DOMContentLoaded', () => {
  initDayCounter();
  initCarousel();
  initBackgroundVideo();
  initTypingSubtitle();
  initHearts();
});

// ===== Typing effect for subtitle =====
function initTypingSubtitle(){
  const el = document.getElementById('subtitleText');
  if(!el) return;
  const full = el.textContent || '';
  el.textContent = '';
  let i = 0;
  const speed = 25; // ms per char
  function step(){
    if(i <= full.length){
      el.textContent = full.slice(0, i);
      i += 1;
      setTimeout(step, speed);
    }
  }
  step();
}

// ===== Hearts particles =====
function initHearts(){
  const canvas = document.getElementById('heartsCanvas');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  let width, height, rafId;
  const hearts = [];

  function onResize(){
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', onResize);
  onResize();

  function spawnHeart(){
    const x = Math.random() * width;
    const size = 6 + Math.random() * 10;
    const speed = 0.3 + Math.random() * 0.6;
    const drift = (Math.random() - 0.5) * 0.3;
    const hue = 330 + Math.random() * 20; // pinkish
    hearts.push({ x, y: height + size, size, speed, drift, alpha: 0.7, hue });
  }

  function drawHeart(x, y, s, color){
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s/16, s/16);
    ctx.beginPath();
    // simple heart path
    ctx.moveTo(0, 4);
    ctx.bezierCurveTo(0, -4, 16, -4, 16, 4);
    ctx.bezierCurveTo(16, 12, 8, 16, 8, 20);
    ctx.bezierCurveTo(8, 16, 0, 12, 0, 4);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.7;
    ctx.fill();
    ctx.restore();
  }

  function tick(){
    ctx.clearRect(0, 0, width, height);
    if(Math.random() < 0.08) spawnHeart();
    for(let i=hearts.length-1; i>=0; i--){
      const h = hearts[i];
      h.y -= h.speed;
      h.x += h.drift;
      if(h.y < -20){
        hearts.splice(i,1);
        continue;
      }
      drawHeart(h.x, h.y, h.size, `hsl(${h.hue} 90% 65%)`);
    }
    rafId = requestAnimationFrame(tick);
  }
  tick();
}

// ===== Captions helper =====
function deriveCaptionFromSrc(src){
  const parts = src.split('/');
  const file = parts[parts.length - 1];
  const name = file.replace(/\.[^.]+$/, '');
  // Replace separators with spaces
  let caption = name.replace(/[_.-]+/g, ' ');
  // Strip common prefixes like WhatsApp Image/Video timestamps
  caption = caption.replace(/^WhatsApp\s+(Image|Video)\s+/i, '');
  return caption.trim();
}


