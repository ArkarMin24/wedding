/* ==========================================================================
   Wedding Appreciation & Pre-Wedding Digital Keepsake - JavaScript
   ========================================================================== */

/* 1. CORE DATA STORE & LOCAL STORAGE MANAGEMENT */
const DEFAULT_COUPLE = {
  groomName: 'ကိုမင်းဟိန်းထက်',
  brideName: 'မဆုမြတ်နိုး',
  weddingDate: '၂၀၂၆ ခုနှစ် မင်္ဂလာနှစ်မြတ်',
  blessingText: 'နှစ်ဦးနှစ်ဖက် လက်တွဲခိုင်မြဲလျက် ရှေ့ဆက်မည့် ဘဝခရီးလမ်းတလျှောက်တွင် စိတ်၏ချမ်းသာခြင်း၊ ကိုယ်၏ကျန်းမာခြင်းတို့နှင့် ပြည့်စုံပြီး စီးပွားဥစ္စာ ရတနာအဖြာဖြာ ဒီရေအလား တိုးတက်ကြပါစေ။ အချင်းချင်း နားလည်မှု၊ ယုံကြည်မှု၊ မေတ္တာတရားတို့ဖြင့် ရာသက်ပန် ထာဝရ ချစ်ခင်ကြည်နူးစွာ သာယာပျော်ရွှင်သော အိမ်ထောင်ရှင်ဘဝကို တည်ဆောက်နိုင်ကြပါစေကြောင်း ဆုတောင်းမေတ္တာ ပို့သအပ်ပါသည်။',
  blessingAuthor: 'ချစ်လှစွာသော ညီလေးတုန်တုန်'
};

const DEFAULT_PHOTOS = [
  {
    id: 'photo-1',
    src: 'photo_2026-11-02_10-20-16.jpg',
    title: 'ရိုးရာဂုဏ်ရည်နှင့် ပုသိမ်ထီးရိပ်အောက်က မေတ္တာအလှ',
    category: 'traditional',
    categoryLabel: 'ရိုးရာအလှ',
    caption: 'မြန်မာ့ရိုးရာ အဝါရောင် ရွှေပိုးဖဲဝတ်စုံတော်နှင့် ပုသိမ်ထီးရိပ်အောက်က နူးညံ့သိမ်မွေ့သော မေတ္တာပုံရိပ်။',
    isDefault: true
  },
  {
    id: 'photo-2',
    src: 'photo_2026-11-02_10-20-14.jpg',
    title: 'ဖြူစင်ကြည်လင်သော မေတ္တာနန်းတော်',
    category: 'modern',
    categoryLabel: 'ခေတ်မီအလှ',
    caption: 'ပန်းပွင့်လေးများ သီကုံးထားသော နှင်းဖြူရောင် မင်္ဂလာဝတ်စုံနှင့် အဖြူရောင် မုခ်ဦးစင်္ကြံလမ်းထက်က ခေတ်မီဆန်းသစ်သော အလှ။',
    isDefault: true
  },
  {
    id: 'photo-3',
    src: 'photo_2026-11-02_10-20-11.jpg',
    title: 'ရွှေရောင်လွှမ်းသော မင်္ဂလာကျက်သရေ',
    category: 'traditional',
    categoryLabel: 'ရိုးရာအလှ',
    caption: 'မြန်မာ့ရိုးရာ ရွှေထည်ကနုတ်ပန်းလက်ရာ၊ ကန်တော့ပွဲနှင့် မင်္ဂလာပလ္လင်ထက်တွင် ရွှေလက်တွဲဆုတောင်းပြုခြင်း။',
    isDefault: true
  }
];

let coupleData = {};
let photosList = [];
let currentFilter = 'all';
let currentLightboxIndex = 0;
let slideshowInterval = null;
let isSlideshowPlaying = false;
let slideshowProgress = 0;
let progressTimer = null;
let tempFileDataUrl = null;

// Initialize Data
function initData() {
  const storedCouple = localStorage.getItem('keepsake_couple_data');
  if (storedCouple) {
    try { coupleData = JSON.parse(storedCouple); } catch (e) { coupleData = { ...DEFAULT_COUPLE }; }
  } else {
    coupleData = { ...DEFAULT_COUPLE };
  }

  const storedPhotos = localStorage.getItem('keepsake_photos_list');
  if (storedPhotos) {
    try { photosList = JSON.parse(storedPhotos); } catch (e) { photosList = [...DEFAULT_PHOTOS]; }
  } else {
    photosList = [...DEFAULT_PHOTOS];
  }

  renderCoupleInfo();
  renderGallery();
}

// Render dynamic couple texts
function renderCoupleInfo() {
  const ids = {
    'header-groom-name': coupleData.groomName,
    'header-bride-name': coupleData.brideName,
    'hero-groom-name': coupleData.groomName,
    'hero-bride-name': coupleData.brideName,
    'hero-wedding-date': coupleData.weddingDate,
    'blessing-groom-name': coupleData.groomName,
    'blessing-bride-name': coupleData.brideName,
    'blessing-custom-text': coupleData.blessingText,
    'blessing-author': coupleData.blessingAuthor,
    'footer-couple-names': `${coupleData.groomName} & ${coupleData.brideName}`
  };

  for (const [id, value] of Object.entries(ids)) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }
}

/* 2. ADD PHOTO MODAL & FILE HANDLING */
const addPhotoModal = document.getElementById('add-photo-modal');

function openAddPhotoModal() {
  tempFileDataUrl = null;
  document.getElementById('add-photo-form').reset();
  document.getElementById('image-preview-container').classList.add('hidden');
  addPhotoModal.classList.remove('hidden');
}

function closeAddPhotoModal() {
  addPhotoModal.classList.add('hidden');
}

function handleFileSelect(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      tempFileDataUrl = e.target.result;
      document.getElementById('image-preview').src = tempFileDataUrl;
      document.getElementById('image-preview-container').classList.remove('hidden');
    };
    reader.readAsDataURL(file);
  }
}

function saveNewPhoto(e) {
  e.preventDefault();
  const directUrl = document.getElementById('input-photo-url').value.trim();
  const finalSrc = tempFileDataUrl || directUrl;

  if (!finalSrc) {
    alert('ကျေးဇူးပြု၍ ဓာတ်ပုံဖိုင် ရွေးချယ်ပါ သို့မဟုတ် URL ရိုက်ထည့်ပါ။');
    return;
  }

  const category = document.getElementById('input-photo-category').value;
  const categoryLabel = category === 'traditional' ? 'ရိုးရာအလှ' : 'ခေတ်မီအလှ';
  const caption = document.getElementById('input-photo-caption').value.trim();

  const newPhotoObj = {
    id: 'photo-' + Date.now(),
    src: finalSrc,
    title: caption.substring(0, 30),
    category: category,
    categoryLabel: categoryLabel,
    caption: caption,
    isDefault: false
  };

  photosList.unshift(newPhotoObj);
  localStorage.setItem('keepsake_photos_list', JSON.stringify(photosList));

  renderGallery();
  closeAddPhotoModal();
}

function deletePhoto(id, e) {
  e.stopPropagation();
  if (confirm('ဤဓာတ်ပုံကို အယ်လ်ဘမ်ထဲမှ ဖျက်ပစ်ရန် သေချာပါသလား?')) {
    photosList = photosList.filter(item => item.id !== id);
    localStorage.setItem('keepsake_photos_list', JSON.stringify(photosList));
    renderGallery();
  }
}

/* 4. GALLERY FILTERS & RENDERING */
function setFilter(category) {
  currentFilter = category;
  document.querySelectorAll('.filter-tab-btn').forEach(btn => {
    btn.classList.remove('bg-gold', 'text-white', 'shadow-sm');
    btn.classList.add('text-charcoal-soft');
  });

  const activeBtn = document.getElementById(`filter-${category === 'all' ? 'all' : category === 'traditional' ? 'trad' : 'modern'}-btn`);
  if (activeBtn) {
    activeBtn.classList.add('bg-gold', 'text-white', 'shadow-sm');
    activeBtn.classList.remove('text-charcoal-soft');
  }

  renderGallery();
}

function getFilteredPhotos() {
  if (currentFilter === 'all') return photosList;
  return photosList.filter(item => item.category === currentFilter);
}

function renderGallery() {
  const grid = document.getElementById('photo-album-grid');
  const emptyState = document.getElementById('empty-state');
  const currentItems = getFilteredPhotos();

  grid.innerHTML = '';

  if (currentItems.length === 0) {
    emptyState.classList.remove('hidden');
    return;
  } else {
    emptyState.classList.add('hidden');
  }

  currentItems.forEach((photo, idx) => {
    const card = document.createElement('div');
    card.className = "group relative bg-white p-3.5 sm:p-4 rounded-2xl shadow-gold-glow border border-gold/30 hover:border-gold transition-all duration-500 hover:-translate-y-1.5 flex flex-col justify-between cursor-pointer";
    card.onclick = () => openLightboxByIndex(idx);

    card.innerHTML = `
      <div>
        <div class="relative overflow-hidden rounded-xl aspect-[3/4] bg-champagne">
          <img src="${photo.src}" alt="${photo.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700">
          
          <span class="absolute top-3 left-3 px-3 py-1 rounded-full text-[11px] font-burmese font-bold bg-white/90 text-charcoal border border-gold/30 shadow-sm backdrop-blur-sm">
            ${photo.categoryLabel}
          </span>

          ${!photo.isDefault ? `
            <button onclick="deletePhoto('${photo.id}', event)" title="ဖျက်မည်" class="absolute top-3 right-3 w-7 h-7 rounded-full bg-red-600/80 hover:bg-red-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
            </button>
          ` : ''}

          <div class="absolute inset-0 bg-gold/15 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <span class="p-2.5 rounded-full bg-white/90 text-gold-dark shadow-md">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"></path>
              </svg>
            </span>
          </div>
        </div>

        <div class="pt-4 pb-1">
          <p class="font-burmese text-sm font-bold text-charcoal line-clamp-2 leading-relaxed">
            ${photo.caption}
          </p>
        </div>
      </div>

      <div class="pt-2 border-t border-gold/15 flex items-center justify-between text-[11px] text-charcoal-muted font-serif-luxury italic">
        <span>Pre-Wedding Memory</span>
        <span class="text-gold font-bold">♥ Click to view</span>
      </div>
    `;

    grid.appendChild(card);
  });
}

/* 5. FULLSCREEN LIGHTBOX & AUTO SLIDESHOW */
const lightboxModal = document.getElementById('lightbox-modal');
const lightboxImg = document.getElementById('lightbox-image');
const lightboxCaption = document.getElementById('lightbox-caption');
const lightboxBadge = document.getElementById('lightbox-badge');
const lightboxCounter = document.getElementById('lightbox-counter');
const progressBar = document.getElementById('slideshow-progress-bar');

function openLightbox(src, caption, categoryLabel) {
  const filtered = getFilteredPhotos();
  const matchIdx = filtered.findIndex(p => p.src === src);
  if (matchIdx !== -1) {
    openLightboxByIndex(matchIdx);
  } else {
    lightboxImg.src = src;
    lightboxCaption.textContent = caption;
    lightboxBadge.textContent = categoryLabel || 'မင်္ဂလာပုံရိပ်';
    lightboxCounter.textContent = '1 / 1';
    lightboxModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }
}

function openLightboxByIndex(index) {
  const filtered = getFilteredPhotos();
  if (filtered.length === 0) return;
  if (index < 0) index = filtered.length - 1;
  if (index >= filtered.length) index = 0;

  currentLightboxIndex = index;
  const photo = filtered[index];

  lightboxImg.src = photo.src;
  lightboxCaption.textContent = photo.caption;
  lightboxBadge.textContent = photo.categoryLabel;
  lightboxCounter.textContent = `${index + 1} / ${filtered.length}`;

  lightboxModal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function navigateLightbox(dir) {
  const filtered = getFilteredPhotos();
  if (filtered.length === 0) return;
  openLightboxByIndex(currentLightboxIndex + dir);
  if (isSlideshowPlaying) resetSlideshowTimer();
}

function closeLightbox() {
  lightboxModal.classList.add('hidden');
  document.body.style.overflow = 'auto';
  if (isSlideshowPlaying) toggleSlideshow();
}

window.addEventListener('keydown', (e) => {
  if (lightboxModal.classList.contains('hidden')) return;
  if (e.key === 'ArrowLeft') navigateLightbox(-1);
  if (e.key === 'ArrowRight') navigateLightbox(1);
  if (e.key === 'Escape') closeLightbox();
});

// Mobile Touch Swipe Navigation for Lightbox
let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;

lightboxModal.addEventListener('touchstart', (e) => {
  touchStartX = e.changedTouches[0].screenX;
  touchStartY = e.changedTouches[0].screenY;
}, { passive: true });

lightboxModal.addEventListener('touchend', (e) => {
  touchEndX = e.changedTouches[0].screenX;
  touchEndY = e.changedTouches[0].screenY;
  handleLightboxSwipe();
}, { passive: true });

function handleLightboxSwipe() {
  const diffX = touchEndX - touchStartX;
  const diffY = touchEndY - touchStartY;
  if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 35) {
    if (diffX < 0) {
      navigateLightbox(1);
    } else {
      navigateLightbox(-1);
    }
  }
}

function toggleSlideshow() {
  isSlideshowPlaying = !isSlideshowPlaying;
  const label = document.getElementById('slideshow-label');
  const icon = document.getElementById('slideshow-icon');
  const lbIcon = document.getElementById('lightbox-slideshow-icon');

  if (isSlideshowPlaying) {
    label.textContent = "Slideshow ရပ်ရန်";
    const pauseIconHtml = `<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"></path>`;
    icon.innerHTML = pauseIconHtml;
    lbIcon.innerHTML = pauseIconHtml;

    if (lightboxModal.classList.contains('hidden')) {
      openLightboxByIndex(currentLightboxIndex);
    }
    startSlideshowTimer();
  } else {
    label.textContent = "Auto Slideshow";
    const playIconHtml = `<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd"></path>`;
    icon.innerHTML = playIconHtml;
    lbIcon.innerHTML = playIconHtml;
    clearInterval(slideshowInterval);
    clearInterval(progressTimer);
    progressBar.style.width = '0%';
  }
}

function startSlideshowTimer() {
  clearInterval(slideshowInterval);
  clearInterval(progressTimer);
  slideshowProgress = 0;
  progressBar.style.width = '0%';

  const stepMs = 50;
  const totalMs = 4000;

  progressTimer = setInterval(() => {
    slideshowProgress += (stepMs / totalMs) * 100;
    progressBar.style.width = `${Math.min(slideshowProgress, 100)}%`;
  }, stepMs);

  slideshowInterval = setInterval(() => {
    navigateLightbox(1);
    slideshowProgress = 0;
    progressBar.style.width = '0%';
  }, totalMs);
}

function resetSlideshowTimer() {
  if (!isSlideshowPlaying) return;
  startSlideshowTimer();
}

/* 5. BACKGROUND WEDDING MUSIC (wedding_music.mp3) - AUTOPLAY & CONTROLS */
const weddingAudio = document.getElementById('wedding-audio');
const musicBtn = document.getElementById('music-toggle-btn');
const musicText = document.getElementById('music-text');
const eqIndicator = document.getElementById('eq-indicator');
const floatingMusicBtn = document.getElementById('floating-music-btn');
const floatingMusicText = document.getElementById('floating-music-text');
const floatingMusicIcon = document.getElementById('floating-music-icon');

let isAudioPlaying = false;
let isAudioStarting = false;

// Preload audio element immediately for mobile devices
if (weddingAudio) {
  weddingAudio.load();
}

function updateMusicUI(isPlaying) {
  isAudioPlaying = isPlaying;
  if (isPlaying) {
    if (musicText) musicText.textContent = "သံစဉ် ပိတ်ရန်";
    if (eqIndicator) eqIndicator.classList.remove('paused-eq');
    if (floatingMusicText) floatingMusicText.textContent = "သံစဉ် ပိတ်ရန်";
    if (floatingMusicIcon) {
      floatingMusicIcon.classList.add('animate-spin-disc');
      floatingMusicIcon.innerHTML = `
        <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
        </svg>`;
    }
  } else {
    if (musicText) musicText.textContent = "သံစဉ် ဖွင့်ရန်";
    if (eqIndicator) eqIndicator.classList.add('paused-eq');
    if (floatingMusicText) floatingMusicText.textContent = "သံစဉ် ဖွင့်ရန်";
    if (floatingMusicIcon) {
      floatingMusicIcon.classList.remove('animate-spin-disc');
      floatingMusicIcon.innerHTML = `
        <svg class="w-4 h-4 fill-current opacity-80" viewBox="0 0 24 24">
          <path d="M4.34 2.93L2.93 4.34 7.29 8.7 7 9H3v6h4l5 5v-6.59l4.18 4.18c-.65.49-1.38.88-2.18 1.11v2.06c1.34-.3 2.57-.92 3.61-1.75l2.05 2.05 1.41-1.41L4.34 2.93zM10 15.17L7.83 13H5v-2h2.83l.88-.88L10 11.41v3.76zM19 12c0 .82-.15 1.61-.41 2.34l1.53 1.53c.56-1.17.88-2.48.88-3.87 0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zm-7-8l-1.88 1.88L12 7.76zm4.5 8A4.5 4.5 0 0 0 14 7.97v1.79l2.48 2.48c.01-.08.02-.16.02-.24z"/>
        </svg>`;
    }
  }
}

function dismissWelcomeGate() {
  const gate = document.getElementById('welcome-gate');
  if (gate) {
    gate.style.opacity = '0';
    gate.style.pointerEvents = 'none';
    setTimeout(() => {
      gate.classList.add('hidden');
    }, 600);
  }
}

// Master Play function - robust, debounced, resilient on mobile Safari/Chrome
function playWeddingMusic() {
  if (!weddingAudio) return;
  if (isAudioPlaying) {
    dismissWelcomeGate();
    return;
  }
  if (isAudioStarting) return;

  isAudioStarting = true;
  weddingAudio.muted = false;

  const playPromise = weddingAudio.play();
  if (playPromise !== undefined) {
    playPromise
      .then(() => {
        isAudioStarting = false;
        isAudioPlaying = true;
        updateMusicUI(true);
        dismissWelcomeGate();
        removeAutoPlayListeners();
      })
      .catch((err) => {
        isAudioStarting = false;
        console.log("Audio play awaiting valid touch interaction:", err.message);
      });
  } else {
    isAudioStarting = false;
  }
}

const startMusicAndEnter = playWeddingMusic;

function toggleMusic() {
  if (!weddingAudio) return;
  if (weddingAudio.paused) {
    playWeddingMusic();
  } else {
    weddingAudio.pause();
    isAudioPlaying = false;
    updateMusicUI(false);
  }
}

// Global user interaction triggers for mobile phones (iOS & Android)
// Explicitly exclude 'scroll' because browsers reject scroll as a media activation gesture
const AUTO_PLAY_EVENTS = ['touchend', 'click', 'pointerup'];

function onUserInteraction() {
  if (!isAudioPlaying) {
    playWeddingMusic();
  }
}

function setupAutoPlayListeners() {
  AUTO_PLAY_EVENTS.forEach(evt => {
    window.addEventListener(evt, onUserInteraction, { capture: true, passive: true });
    document.addEventListener(evt, onUserInteraction, { capture: true, passive: true });
  });
}

function removeAutoPlayListeners() {
  AUTO_PLAY_EVENTS.forEach(evt => {
    window.removeEventListener(evt, onUserInteraction, { capture: true });
    document.removeEventListener(evt, onUserInteraction, { capture: true });
  });
}

// Auto start music when opened
function tryAutoPlayMusic() {
  if (!weddingAudio) return;

  // 1. Attempt immediate unmuted play (succeeds on desktop or engaged browsers)
  const promise = weddingAudio.play();
  if (promise !== undefined) {
    promise
      .then(() => {
        isAudioPlaying = true;
        updateMusicUI(true);
        dismissWelcomeGate();
      })
      .catch(() => {
        // 2. Blocked by mobile browser policy -> listen for user's touch anywhere on screen!
        updateMusicUI(false);
        setupAutoPlayListeners();
      });
  } else {
    setupAutoPlayListeners();
  }
}

// WeChat & Mobile in-app browser auto-play bridge
document.addEventListener("WeixinJSBridgeReady", () => {
  playWeddingMusic();
}, false);

if (weddingAudio) {
  weddingAudio.addEventListener('play', () => updateMusicUI(true));
  weddingAudio.addEventListener('pause', () => updateMusicUI(false));
  weddingAudio.addEventListener('ended', () => updateMusicUI(false));
}

/* 7. FLOATING GOLDEN SPARKLES & ROSE PETALS CANVAS ANIMATION */
const canvas = document.getElementById('ambient-canvas');
const ctx = canvas.getContext('2d');
let width, height;
let particles = [];

function resizeCanvas() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

class Particle {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = Math.random() * width;
    this.y = Math.random() * -height;
    this.type = Math.random() > 0.45 ? 'sparkle' : 'petal';

    if (this.type === 'sparkle') {
      this.size = Math.random() * 2.5 + 1;
      this.speedY = Math.random() * 0.4 + 0.2;
      this.speedX = (Math.random() - 0.5) * 0.3;
      this.alpha = Math.random() * 0.7 + 0.3;
      this.pulseSpeed = Math.random() * 0.03 + 0.01;
    } else {
      this.size = Math.random() * 7 + 5;
      this.speedY = Math.random() * 0.8 + 0.4;
      this.speedX = Math.sin(Math.random() * Math.PI) * 0.5;
      this.rotation = Math.random() * Math.PI * 2;
      this.rotSpeed = (Math.random() - 0.5) * 0.02;
      this.alpha = Math.random() * 0.45 + 0.25;
    }
  }

  update() {
    this.y += this.speedY;
    this.x += this.speedX;

    if (this.type === 'sparkle') {
      this.alpha += Math.sin(Date.now() * this.pulseSpeed * 0.05) * 0.01;
      if (this.alpha < 0.2) this.alpha = 0.2;
      if (this.alpha > 0.8) this.alpha = 0.8;
    } else {
      this.rotation += this.rotSpeed;
      this.x += Math.sin(this.y * 0.015) * 0.3;
    }

    if (this.y > height + 20 || this.x < -20 || this.x > width + 20) {
      this.reset();
      this.y = -10;
    }
  }

  draw() {
    ctx.save();
    if (this.type === 'sparkle') {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(212, 175, 55, ${this.alpha})`;
      ctx.shadowColor = 'rgba(212, 175, 55, 0.8)';
      ctx.shadowBlur = 8;
      ctx.fill();
    } else {
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      ctx.beginPath();
      ctx.moveTo(0, -this.size);
      ctx.bezierCurveTo(this.size * 0.8, -this.size * 0.5, this.size * 0.8, this.size * 0.5, 0, this.size);
      ctx.bezierCurveTo(-this.size * 0.8, this.size * 0.5, -this.size * 0.8, -this.size * 0.5, 0, -this.size);
      const petalGrad = ctx.createLinearGradient(-this.size, -this.size, this.size, this.size);
      petalGrad.addColorStop(0, `rgba(249, 235, 232, ${this.alpha})`);
      petalGrad.addColorStop(1, `rgba(229, 197, 131, ${this.alpha * 0.8})`);
      ctx.fillStyle = petalGrad;
      ctx.fill();
    }
    ctx.restore();
  }
}

// Responsive ambient particles: 20 for mobile phones to save battery/GPU, 42 for desktops
const maxParticles = window.innerWidth < 640 ? 20 : 42;
for (let i = 0; i < maxParticles; i++) {
  const p = new Particle();
  p.y = Math.random() * height;
  particles.push(p);
}

function animateAmbient() {
  ctx.clearRect(0, 0, width, height);
  particles.forEach(p => {
    p.update();
    p.draw();
  });
  requestAnimationFrame(animateAmbient);
}
animateAmbient();

/* 8. MOBILE MENU TOGGLE */
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');

if (mobileMenuBtn && mobileMenu) {
  mobileMenuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    mobileMenu.classList.toggle('hidden');
  });

  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.add('hidden');
    });
  });

  // Close mobile menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!mobileMenu.classList.contains('hidden')) {
      if (!mobileMenu.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
        mobileMenu.classList.add('hidden');
      }
    }
  });
}

// Start application and auto-play music
document.addEventListener('DOMContentLoaded', () => {
  initData();
  tryAutoPlayMusic();
});
window.addEventListener('load', tryAutoPlayMusic);

