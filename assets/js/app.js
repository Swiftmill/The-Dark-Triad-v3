let backgroundVideos = [];
let activeBackgroundIndex = 0;

function initSite() {
  loadGlyphs();
  initBackground();
  attachTitleClick();
  observeSections();
  animateHeroIntro();
  initCursor();
  bindForm();
}

document.addEventListener('DOMContentLoaded', initSite);

function initBackground() {
  const hero = document.querySelector('.hero');
  if (!hero) return;

  backgroundVideos = Array.from(hero.querySelectorAll('.hero-video'));
  const fallback = hero.querySelector('.hero-fallback');

  if (!backgroundVideos.length) {
    if (fallback) {
      fallback.classList.add('active');
    }
    return;
  }

  backgroundVideos.forEach((video, index) => {
    video.dataset.index = index;
    if (index === 0) {
      video.classList.add('active');
      ensurePlayback(video);
    } else {
      video.classList.remove('active');
    }
    video.addEventListener('loadeddata', () => ensurePlayback(video));
    video.addEventListener('error', () => {
      console.warn('Video failed to load:', video.currentSrc);
      video.classList.remove('active');
      if (fallback) {
        fallback.classList.add('active');
      }
    });
  });
}

function ensurePlayback(video) {
  if (!video) return;
  const playPromise = video.play();
  if (playPromise !== undefined) {
    playPromise.catch(() => {
      // playback may fail on some browsers when not interacted
    });
  }
}

function attachTitleClick() {
  const title = document.getElementById('site-title');
  if (!title) return;
  title.addEventListener('click', swapBackground);
  title.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      swapBackground();
    }
  });
  title.setAttribute('tabindex', '0');
  title.setAttribute('role', 'button');
  title.setAttribute('aria-label', 'Change background');
}

function swapBackground() {
  if (!backgroundVideos.length) return;

  const nextIndex = (activeBackgroundIndex + 1) % backgroundVideos.length;
  const currentVideo = backgroundVideos[activeBackgroundIndex];
  const nextVideo = backgroundVideos[nextIndex];
  const hero = document.querySelector('.hero');
  const overlay = hero ? hero.querySelector('.overlay') : null;

  if (!nextVideo || nextVideo === currentVideo) return;

  currentVideo.classList.remove('active');
  currentVideo.classList.add('swapping');

  nextVideo.classList.add('active', 'swapping');
  nextVideo.currentTime = 0;
  ensurePlayback(nextVideo);

  if (overlay) {
    overlay.classList.remove('pulse');
    void overlay.offsetWidth; // restart animation
    overlay.classList.add('pulse');
    setTimeout(() => overlay.classList.remove('pulse'), 700);
  }

  setTimeout(() => {
    currentVideo.classList.remove('swapping');
    nextVideo.classList.remove('swapping');
  }, 600);

  if (hero) {
    hero.classList.add('background-swap');
    setTimeout(() => hero.classList.remove('background-swap'), 600);
  }

  activeBackgroundIndex = nextIndex;
}

function observeSections() {
  const sections = document.querySelectorAll('.content-section');
  if (!sections.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        }
      });
    },
    { threshold: 0.25 }
  );

  sections.forEach((section) => observer.observe(section));
}

function animateHeroIntro() {
  const titleBlock = document.querySelector('.title-block');
  const subtitle = document.querySelector('.subtitle');
  requestAnimationFrame(() => {
    if (titleBlock) {
      titleBlock.classList.add('is-visible');
    }
    if (subtitle) {
      subtitle.classList.add('is-visible');
    }
  });
}

function initCursor() {
  const cursor = document.querySelector('.custom-cursor');
  if (!cursor) return;

  const prefersFine = window.matchMedia('(pointer: fine)').matches;
  if (!prefersFine) {
    cursor.style.display = 'none';
    document.body.style.cursor = 'auto';
    return;
  }

  document.addEventListener('pointermove', (event) => {
    cursor.style.transform = `translate(${event.clientX}px, ${event.clientY}px)`;
  });

  const interactiveSelector = 'a, button, .cta, .triad-logo, [role="button"]';

  document.addEventListener('pointerover', (event) => {
    if (event.target.closest(interactiveSelector)) {
      cursor.classList.add('interactive');
    }
  });

  document.addEventListener('pointerout', (event) => {
    if (!event.target.closest(interactiveSelector)) return;
    const nextTarget = event.relatedTarget;
    if (nextTarget && nextTarget.closest && nextTarget.closest(interactiveSelector)) {
      return;
    }
    cursor.classList.remove('interactive');
  });

  document.addEventListener('focusin', (event) => {
    if (event.target.closest(interactiveSelector)) {
      cursor.classList.add('interactive');
    }
  });

  document.addEventListener('focusout', (event) => {
    if (event.target.closest(interactiveSelector)) {
      cursor.classList.remove('interactive');
    }
  });
}

function bindForm() {
  const form = document.querySelector('.contact-form');
  if (!form) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const button = form.querySelector('.cta');
    if (button) {
      button.classList.add('sent');
      button.textContent = 'Transmission Sent';
      setTimeout(() => {
        button.classList.remove('sent');
        button.textContent = 'Transmit';
      }, 2500);
    }
    form.reset();
  });
}

window.swapBackground = swapBackground;
window.initSite = initSite;
