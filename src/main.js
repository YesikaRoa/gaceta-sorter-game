import { GameEngine } from './game.js';
import { CATEGORY_NAMES } from './data.js';

// ── Screen Navigation ────────────────────────────
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}
function showModal(id)  { document.getElementById(id).classList.remove('hidden'); }
function hideModal(id)  { document.getElementById(id).classList.add('hidden'); }

// ── Init Engine ──────────────────────────────────
const engine = new GameEngine({
  onError(data) { showSancionModal(data); },
  onGameOver(data) { showGameOver(data); },
  onVictory(data) { showVictory(data); }
});

// ── Menu Buttons ─────────────────────────────────
document.getElementById('btn-play').addEventListener('click', () => {
  showScreen('screen-game');
  engine.start();
});

document.getElementById('btn-howto').addEventListener('click', () => {
  showScreen('screen-howto');
});

document.getElementById('btn-back-menu').addEventListener('click', () => {
  showScreen('screen-menu');
});

// ── HUD Buttons ───────────────────────────────────
document.getElementById('btn-pause').addEventListener('click', () => {
  engine.pause();
  showModal('modal-pause');
});

document.getElementById('btn-exit').addEventListener('click', () => {
  engine.stop();
  showScreen('screen-menu');
});

// ── Pause Modal ───────────────────────────────────
document.getElementById('btn-resume').addEventListener('click', () => {
  hideModal('modal-pause');
  engine.resume();
});

document.getElementById('btn-pause-menu').addEventListener('click', () => {
  hideModal('modal-pause');
  engine.stop();
  showScreen('screen-menu');
});

// ── Sanción Modal ─────────────────────────────────
function showSancionModal({ crime, reason }) {
  document.getElementById('modal-err-reason').textContent = reason;
  document.getElementById('modal-err-code').textContent   = `ERR: 0x${crime.id.toUpperCase()}`;
  document.getElementById('modal-crime-name').textContent = crime.title;
  document.getElementById('modal-crime-cat').textContent  = `${CATEGORY_NAMES[crime.category]} · ${crime.chapter}`;
  document.getElementById('modal-pena').textContent       = crime.penalty;
  document.getElementById('modal-multa').textContent      = crime.fine;
  document.getElementById('modal-article').textContent    = crime.article;
  showModal('modal-sancion');
}

document.getElementById('btn-modal-continue').addEventListener('click', () => {
  hideModal('modal-sancion');
  engine.resume();
});

// ── Game Over Modal ───────────────────────────────
function showGameOver({ score, correct, wrong, level }) {
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
  engine.start();
});

document.getElementById('btn-go-menu').addEventListener('click', () => {
  hideModal('modal-gameover');
  engine.stop();
  showScreen('screen-menu');
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
