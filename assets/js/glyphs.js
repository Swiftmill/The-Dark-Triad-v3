const GLYPH_RATE_MS = 70;
const REVEAL_RATE_MS = 15;
const HIDE_DELAY_MS = 500;

const glyphControllers = new Map();

async function loadGlyphs() {
  const nav = document.getElementById('glyph-nav');
  if (!nav) return;

  let data = [];
  try {
    const response = await fetch('assets/data/glyphs.json');
    if (!response.ok) {
      throw new Error('Failed to load glyph data');
    }
    data = await response.json();
  } catch (error) {
    console.warn('Glyph data could not be fetched. Using fallback glyphs.', error);
    data = [
      { id: 'intro', real: 'ENTER TEMPLE', glyphs: ['◬◈◬', '卄卄卄', '₪₪₪'] },
      { id: 'triad', real: 'THE DARK TRIAD', glyphs: ['𐍉𐍊𐌼', '◬△◬', '✠✠✠'] },
      { id: 'library', real: 'LIBRARY', glyphs: ['◬◩◪', '卐卍卐', '☿☌☍'] },
      { id: 'board', real: 'BOARD', glyphs: ['⋇⋇⋇', '𓆣𓆣𓆣', '◈◈◈'] },
      { id: 'tributes', real: 'TRIBUTES', glyphs: ['✷✶✷', 'ψψψ', '◊◊◊'] },
      { id: 'contact', real: 'CONTACT', glyphs: ['卐☍卐', '⎔⎔⎔', '✠✠✠'] }
    ];
  }

  nav.innerHTML = '';

  data.forEach((item, index) => {
    const button = document.createElement('button');
    button.className = 'glyph';
    button.setAttribute('data-target', item.id);
    button.setAttribute('aria-label', item.real);
    button.innerHTML = '<span class="glyph-caret" aria-hidden="true"></span><span class="reveal"></span>';

    nav.appendChild(button);

    const controller = createGlyphController(button, item, index);
    glyphControllers.set(button, controller);
    startGlyphCycle(controller, index * 80);

    button.addEventListener('mouseenter', () => revealText(controller));
    button.addEventListener('focus', () => revealText(controller));
    button.addEventListener('mouseleave', () => scheduleReset(controller));
    button.addEventListener('blur', () => scheduleReset(controller));
    button.addEventListener('click', (event) => {
      event.preventDefault();
      navigateToSection(item.id);
    });
  });
}

function createGlyphController(element, data, index) {
  const span = element.querySelector('span.reveal');
  span.textContent = pickRandomGlyph(data.glyphs);

  return {
    element,
    span,
    glyphs: data.glyphs,
    real: data.real,
    cycleInterval: null,
    revealInterval: null,
    hideTimeout: null,
    revealTimeout: null,
    index
  };
}

function pickRandomGlyph(collection) {
  return collection[Math.floor(Math.random() * collection.length)];
}

function startGlyphCycle(controller, initialDelay = 0) {
  stopGlyphCycle(controller);

  const runCycle = () => {
    controller.span.textContent = pickRandomGlyph(controller.glyphs);
  };

  if (initialDelay > 0) {
    controller.revealTimeout = setTimeout(() => {
      runCycle();
      controller.cycleInterval = setInterval(() => {
        runCycle();
      }, Math.max(1, GLYPH_RATE_MS) + Math.floor(Math.random() * 35));
    }, initialDelay);
  } else {
    runCycle();
    controller.cycleInterval = setInterval(() => {
      runCycle();
    }, Math.max(1, GLYPH_RATE_MS) + Math.floor(Math.random() * 35));
  }
}

function stopGlyphCycle(controller) {
  if (controller.cycleInterval) {
    clearInterval(controller.cycleInterval);
    controller.cycleInterval = null;
  }
  if (controller.revealTimeout) {
    clearTimeout(controller.revealTimeout);
    controller.revealTimeout = null;
  }
}

function revealText(controller) {
  stopGlyphCycle(controller);
  clearInterval(controller.revealInterval);
  clearTimeout(controller.hideTimeout);

  const target = controller.real;
  let currentIndex = 0;

  controller.revealInterval = setInterval(() => {
    controller.span.textContent = target.slice(0, currentIndex + 1);
    currentIndex += 1;
    if (currentIndex >= target.length) {
      clearInterval(controller.revealInterval);
      controller.revealInterval = null;
    }
  }, Math.max(1, REVEAL_RATE_MS));
}

function scheduleReset(controller) {
  clearTimeout(controller.hideTimeout);
  controller.hideTimeout = setTimeout(() => {
    resetGlyphs(controller);
  }, HIDE_DELAY_MS);
}

function resetGlyphs(controller) {
  clearInterval(controller.revealInterval);
  controller.revealInterval = null;
  startGlyphCycle(controller, 0);
}

function navigateToSection(id) {
  const section = document.getElementById(id);
  if (!section) return;

  section.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

window.loadGlyphs = loadGlyphs;
window.startGlyphCycle = startGlyphCycle;
window.revealText = revealText;
window.resetGlyphs = resetGlyphs;
