import { GameEngine } from './game.js';
import { CATEGORY_NAMES } from './data.js';
import menuMusicSrc from './assets/music/Random Sequences.mp3';
import defeatSfxSrc from './assets/music/sfx-defeat3.mp3';
import gameplayMusicSrc from './assets/music/WhatsApp-Audio-2026-05-01-at-3.10.37-PM.mp3';

const MUSIC_START_OFFSET_SECONDS = 8;
const menuMusic = new Audio(menuMusicSrc);
const defeatSfx = new Audio(defeatSfxSrc);
const gameplayMusic = new Audio(gameplayMusicSrc);
menuMusic.preload = 'auto';
menuMusic.loop = true;
menuMusic.volume = 0.35;
defeatSfx.preload = 'auto';
defeatSfx.volume = 0.7;
gameplayMusic.preload = 'auto';
gameplayMusic.loop = true;
gameplayMusic.volume = 0.45;
let defeatSfxReady = false;

function playMenuMusic() {
  menuMusic.play().catch(() => {
    // Browsers can reject audio playback until a direct user interaction occurs.
  });
}

function stopMenuMusic() {
  menuMusic.pause();
  menuMusic.currentTime = 0;
}

function playDefeatSfx() {
  defeatSfx.pause();
  defeatSfx.currentTime = 0;
  defeatSfx.play().catch(() => {
    // Browsers can reject audio playback until a direct user interaction occurs.
  });
}

function stopDefeatSfx() {
  defeatSfx.pause();
  defeatSfx.currentTime = 0;
}

function prepareDefeatSfx() {
  if (defeatSfxReady) return;
  defeatSfxReady = true;

  const originalVolume = defeatSfx.volume;
  defeatSfx.volume = 0;
  defeatSfx.play()
    .then(() => {
      defeatSfx.pause();
      defeatSfx.currentTime = 0;
      defeatSfx.volume = originalVolume;
    })
    .catch(() => {
      defeatSfx.volume = originalVolume;
      defeatSfxReady = false;
    });
}

function playGameplayMusic({ restart = false } = {}) {
  if (restart) {
    gameplayMusic.currentTime = MUSIC_START_OFFSET_SECONDS;
  }

  gameplayMusic.play().catch(() => {
    // Browsers can reject audio playback until a direct user interaction occurs.
  });
}

function pauseGameplayMusic() {
  gameplayMusic.pause();
}

function stopGameplayMusic() {
  gameplayMusic.pause();
  gameplayMusic.currentTime = MUSIC_START_OFFSET_SECONDS;
}

window.addEventListener('load', () => {
  menuMusic.load();
  defeatSfx.load();
  gameplayMusic.load();
  playMenuMusic();
});

menuMusic.addEventListener('canplaythrough', () => {
  if (document.getElementById('screen-menu').classList.contains('active')) {
    playMenuMusic();
  }
}, { once: true });

window.addEventListener('pointerdown', () => {
  prepareDefeatSfx();

  if (document.getElementById('screen-menu').classList.contains('active')) {
    playMenuMusic();
  }
}, { once: true });

// ── Screen Navigation ────────────────────────────
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}
function showModal(id) { document.getElementById(id).classList.remove('hidden'); }
function hideModal(id) { document.getElementById(id).classList.add('hidden'); }

const engine = new GameEngine({
  onError(data) {
    pauseGameplayMusic();
    showSancionModal(data);
  },
  onGameOver(data) {
    pauseGameplayMusic();
    showGameOver(data);
  },
  onVictory(data) {
    showVictory(data);
  }
});

document.getElementById('btn-play').addEventListener('click', () => {
  prepareDefeatSfx();
  stopMenuMusic();
  stopDefeatSfx();
  showScreen('screen-game');
  engine.start();
  playGameplayMusic({ restart: true });
});

document.getElementById('btn-howto').addEventListener('click', () => {
  stopMenuMusic();
  showScreen('screen-howto');
});

document.getElementById('btn-back-menu').addEventListener('click', () => {
  stopGameplayMusic();
  showScreen('screen-menu');
  playMenuMusic();
});

// ── HUD Buttons ───────────────────────────────────
document.getElementById('btn-pause').addEventListener('click', () => {
  engine.pause();
  pauseGameplayMusic();
  showModal('modal-pause');
});

document.getElementById('btn-exit').addEventListener('click', () => {
  engine.stop();
  stopGameplayMusic();
  showScreen('screen-menu');
  playMenuMusic();
});

// ── Pause Modal ───────────────────────────────────
document.getElementById('btn-resume').addEventListener('click', () => {
  hideModal('modal-pause');
  engine.resume();
  playGameplayMusic();
});

document.getElementById('btn-pause-menu').addEventListener('click', () => {
  hideModal('modal-pause');
  engine.stop();
  stopGameplayMusic();
  showScreen('screen-menu');
  playMenuMusic();
});

// ── Sanción Modal ─────────────────────────────────
function showSancionModal({ crime, reason }) {
  document.getElementById('modal-err-reason').textContent = reason;
  document.getElementById('modal-err-code').textContent = `ERR: 0x${crime.id.toUpperCase()}`;
  document.getElementById('modal-crime-name').textContent = crime.title;
  document.getElementById('modal-crime-cat').textContent = `${CATEGORY_NAMES[crime.category]} · ${crime.chapter}`;
  document.getElementById('modal-pena').textContent = crime.penalty;
  document.getElementById('modal-multa').textContent = crime.fine;
  document.getElementById('modal-article').textContent = crime.article;
  showModal('modal-sancion');
}

document.getElementById('btn-modal-continue').addEventListener('click', () => {
  hideModal('modal-sancion');
  engine.resume();
  playGameplayMusic();
});

// ── Game Over Modal ───────────────────────────────
function showGameOver({ score, correct, wrong, level }) {
  playDefeatSfx();
  document.getElementById('go-score').textContent = String(score).padStart(6, '0');
  document.getElementById('go-stats').innerHTML = `
    <div class="go-stat"><div class="go-stat-val neon-green">${correct}</div><div class="go-stat-label">Correctos</div></div>
    <div class="go-stat"><div class="go-stat-val neon-red">${wrong}</div><div class="go-stat-label">Errores</div></div>
    <div class="go-stat"><div class="go-stat-val neon-yellow">${level}</div><div class="go-stat-label">Nivel alcanzado</div></div>
  `;
  showModal('modal-gameover');
}

function showVictory({ score, correct, wrong, level }) {
  document.getElementById('victory-score').textContent = String(score).padStart(6, '0');
  document.getElementById('victory-stats').innerHTML = `
    <div class="go-stat"><div class="go-stat-val neon-green">${correct}</div><div class="go-stat-label">Correctos</div></div>
    <div class="go-stat"><div class="go-stat-val neon-red">${wrong}</div><div class="go-stat-label">Errores</div></div>
    <div class="go-stat"><div class="go-stat-val neon-yellow">${level}</div><div class="go-stat-label">Nivel alcanzado</div></div>
  `;
  showModal('modal-victory');
}

document.getElementById('btn-go-retry').addEventListener('click', () => {
  hideModal('modal-gameover');
  stopDefeatSfx();
  engine.start();
  playGameplayMusic({ restart: true });
});

document.getElementById('btn-go-menu').addEventListener('click', () => {
  hideModal('modal-gameover');
  engine.stop();
  stopGameplayMusic();
  stopDefeatSfx();
  showScreen('screen-menu');
  playMenuMusic();
});

document.getElementById('btn-victory-retry').addEventListener('click', () => {
  hideModal('modal-victory');
  engine.start();
});

document.getElementById('btn-victory-menu').addEventListener('click', () => {
  hideModal('modal-victory');
  engine.stop();
  showScreen('screen-menu');
});
