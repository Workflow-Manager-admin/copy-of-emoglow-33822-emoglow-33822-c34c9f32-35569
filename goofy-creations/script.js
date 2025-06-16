// Netflix-style Landing Page: JS for dynamic carousels, navbar, mobile nav, touch/keyboard navigation & accessibility

// ----- SAMPLE GAME DATA -----
const gameData = {
  'Trending Now': [
    {
      title: 'Bubble Bopper',
      desc: 'Pop, shoot, and don\'t let the bubbles take over! Fast-paced classic.',
      img: 'assets/game-bubble-placeholder.jpg',
      url: '#',
      alt: 'Bubble Bopper: color bubbles falling',
      sound: 'assets/sound-pop.mp3'
    },
    {
      title: 'Neon Runner',
      desc: 'Run, jump, and dodge lasers in glowing circuits. Fast reflex mode!',
      img: 'assets/game-neon-placeholder.jpg',
      url: '#',
      alt: 'Neon Runner game preview',
      sound: 'assets/sound-beep.ogg'
    },
    {
      title: 'Fruit Dash',
      desc: 'Collect and dash in juicy fruit lands. Fast, fruity, frantic action!',
      img: 'assets/game-fruit-placeholder.jpg',
      url: '#',
      alt: 'Fruit Dash: fruit character running',
      sound: 'assets/sound-jump.mp3'
    }
  ],
  'Classic Arcade': [
    {
      title: 'Retro Invaders',
      desc: 'Defend earth from pixel invaders! Space classic, boss fights included.',
      img: 'assets/game-invaders-placeholder.jpg',
      url: '#',
      alt: 'Retro Invaders: pixel ships',
      sound: 'assets/sound-classic.wav'
    },
    {
      title: 'Paddle Smash',
      desc: 'Bounce, break, and collect powerups in this neon brick-breaker.',
      img: 'assets/game-paddle-placeholder.jpg',
      url: '#',
      alt: 'Paddle Smash arcade screen',
      sound: 'assets/sound-ping.ogg'
    },
    {
      title: 'Maze Mania',
      desc: 'Outsmart the ghosts, collect all the orbs, classic maze chase!',
      img: 'assets/game-maze-placeholder.jpg',
      url: '#',
      alt: 'Maze Mania: colorful maze labyrinth',
      sound: 'assets/sound-coin.mp3'
    }
  ],
  'PvB Originals': [
    {
      title: 'Stack Buddies',
      desc: 'Stack shapes high for high score! Physics meets puzzle.',
      img: 'assets/game-stack-placeholder.jpg',
      url: '#',
      alt: 'Stack Buddies preview image',
      sound: 'assets/sound-bling.wav'
    },
    {
      title: 'Chill Hop Skater',
      desc: 'Skate, trick, groove to chill tracks. Play and catch the rhythm!',
      img: 'assets/game-skate-placeholder.jpg',
      url: '#',
      alt: 'Chill Hop Skater scene',
      sound: 'assets/sound-skate.mp3'
    },
    {
      title: 'Laser Loops',
      desc: 'Spin, loop, and blast! A neon puzzle with a musical twist.',
      img: 'assets/game-laser-placeholder.jpg',
      url: '#',
      alt: 'Laser Loops neon puzzle screen',
      sound: 'assets/sound-laser.mp3'
    }
  ]
};

const rows = [
  { id: 'trending-row', games: gameData['Trending Now'] },
  { id: 'classic-row', games: gameData['Classic Arcade'] },
  { id: 'pvb-row', games: gameData['PvB Originals'] }
];

// Populate all carousels dynamically
document.addEventListener('DOMContentLoaded', function () {
  rows.forEach(row => {
    const rowEl = document.getElementById(row.id);
    if (!rowEl) return;
    row.games.forEach((g, idx) => {
      const card = document.createElement('div');
      card.className = 'game-card';
      card.tabIndex = 0;
      card.setAttribute('role', 'group');
      card.setAttribute('aria-label', g.title);

      // Card image
      const img = document.createElement('img');
      img.className = 'card-img';
      img.src = g.img;
      img.alt = g.alt || g.title;
      img.setAttribute('width', '340');
      img.setAttribute('height', '205');
      card.appendChild(img);

      // Overlay (title, desc, play)
      const overlay = document.createElement('div');
      overlay.className = 'card-overlay';
      // Title
      const title = document.createElement('div');
      title.className = 'card-title';
      title.textContent = g.title;
      overlay.appendChild(title);
      // Desc
      const desc = document.createElement('div');
      desc.className = 'card-desc';
      desc.textContent = g.desc;
      overlay.appendChild(desc);
      // Play button
      const playBtn = document.createElement('button');
      playBtn.className = 'play-btn';
      playBtn.type = 'button';
      playBtn.innerHTML = 'Play <span aria-hidden="true">▶️</span>';
      playBtn.setAttribute('aria-label', `Play ${g.title}`);
      // Sound demo on play btn click
      playBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        playDemoSound(g.sound);
        window.open(g.url, '_blank');
      });
      overlay.appendChild(playBtn);
      card.appendChild(overlay);

      // KEYBOARD: Enter/Space on card opens Play
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          playBtn.focus();
        }
        // Carousel left/right arrow navigation
        if (e.key === 'ArrowRight') {
          focusNextCard(row.id, idx + 1);
        } else if (e.key === 'ArrowLeft') {
          focusNextCard(row.id, idx - 1);
        }
      });

      // Make overlay/btn accessible
      playBtn.addEventListener('keydown', e => {
        if (e.key === 'Tab' && !e.shiftKey) {
          // Allow going to next focusable item
          card.parentElement.children[(idx + 1) % row.games.length]?.focus();
        }
      });

      rowEl.appendChild(card);
    });

    // Touch/Swipe carousel for mobile
    addTouchScroll(rowEl);
  });

  // Navbar burger for mobile
  setupMobileNav();

  // Explore Games scroll link (smooth)
  const exploreBtn = document.getElementById('explore-link');
  if (exploreBtn) {
    exploreBtn.addEventListener('click', function (e) {
      e.preventDefault();
      const explore = document.getElementById('explore-section');
      explore?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  // Footer date
  const yr = document.getElementById('year');
  if (yr) yr.textContent = new Date().getFullYear();
});

// --------- Utility: Focus next/prev game card --------
function focusNextCard(rowId, idx) {
  const row = document.getElementById(rowId);
  if (!row) return;
  const cards = row.querySelectorAll('.game-card');
  const count = cards.length;
  const next = (idx + count) % count;
  cards[next]?.focus();
}

// ----------- Touch/Swipe Scroll for Mobile -----------
function addTouchScroll(el) {
  let startX = 0, scrollLeft = 0, isDown = false;

  // Mouse/Touch: drag to scroll
  el.addEventListener('mousedown', (e) => {
    el.classList.add('dragging');
    isDown = true;
    startX = e.pageX - el.offsetLeft;
    scrollLeft = el.scrollLeft;
  });
  el.addEventListener('mouseleave', () => { isDown = false; el.classList.remove('dragging'); });
  el.addEventListener('mouseup', () => { isDown = false; el.classList.remove('dragging'); });
  el.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - el.offsetLeft;
    el.scrollLeft = scrollLeft - (x - startX);
  });

  // Touch events
  el.addEventListener('touchstart', (e) => {
    isDown = true;
    startX = e.touches[0].pageX - el.offsetLeft;
    scrollLeft = el.scrollLeft;
  }, { passive: true });
  el.addEventListener('touchend', () => { isDown = false; });
  el.addEventListener('touchmove', (e) => {
    if (!isDown) return;
    const x = e.touches[0].pageX - el.offsetLeft;
    el.scrollLeft = scrollLeft - (x - startX);
  }, { passive: true });
}

// ---------- Mobile Navbar + Accessibility -----------
function setupMobileNav() {
  const burger = document.querySelector('.navbar-burger');
  const menu = document.getElementById('navbar-menu');
  if (!burger || !menu) return;
  burger.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  // Close on link click (mobile)
  menu.querySelectorAll('.navbar-link').forEach(link => {
    link.addEventListener('click', () => menu.classList.remove('open'));
  });
  // Keyboard: Escape closes menu
  document.addEventListener('keydown', (e) => {
    if (menu.classList.contains('open') && e.key === 'Escape') {
      menu.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
      burger.focus();
    }
  });
}

// ----------- DEMO: Play sound for Play btn -----------
function playDemoSound(soundPath) {
  if (!soundPath) return;
  try {
    const audio = new Audio(soundPath);
    audio.volume = 0.33;
    audio.play();
  } catch {}
};
