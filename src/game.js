import { CRIMES, CATEGORY_NAMES } from './data.js';

const MAX_LIVES = 3;
const POINTS_PER_CORRECT = 1500;
const WIN_SCORE = 9000;
const BASE_SPAWN_DELAY = 4200;
const MIN_SPAWN_DELAY = 1400;
const SPAWN_DELAY_STEP = 250;
const BASE_FALL_SPEED = 0.82;
const FALL_SPEED_STEP = 0.09;
const RELEASE_PAUSE_MS = 2200;
const RELEASE_MARGIN = 12;
const DRAG_EDGE_MARGIN = 8;

export class GameEngine {
  constructor(callbacks) {
    this.callbacks  = callbacks;
    this.score      = 0;
    this.lives      = MAX_LIVES;
    this.level      = 1;
    this.correct    = 0;
    this.wrong      = 0;
    this.playing    = false;
    this.paused     = false;
    this.won        = false;
    this.spawnTimer = null;
    this.dragEl     = null;
    this.offsetX    = 0;
    this.offsetY    = 0;

    // DOM references are resolved lazily in start() to avoid timing issues
    this.dropArea = null;
    this.zones    = null;

    window.addEventListener('pointermove', e => this._onMove(e));
    window.addEventListener('pointerup',   e => this._onUp(e));
    window.addEventListener('pointercancel', e => this._onUp(e));
  }

  // ── PUBLIC ────────────────────────────────────────
  start() {
    // Resolve DOM here — screen is guaranteed visible now
    this.dropArea = document.getElementById('drop-area');
    this.zones    = document.querySelectorAll('.drop-zone');

    this.score   = 0;
    this.lives   = MAX_LIVES;
    this.level   = 1;
    this.correct = 0;
    this.wrong   = 0;
    this.playing = true;
    this.paused  = false;
    this.won     = false;

    this.dropArea.innerHTML = '';
    const hint = document.getElementById('drop-hint');
    if (hint) hint.style.opacity = '.4';
    this._updateHUD();

    // Wait one frame so the browser has computed layout
    requestAnimationFrame(() => {
      this._spawn();
      this._scheduleSpawn();
    });
  }

  pause() {
    this.paused = true;
    clearTimeout(this.spawnTimer);
  }

  resume() {
    if (!this.playing || !this.paused) return;
    this.paused  = false;
    this._resumeFallingBlocks();
    this._scheduleSpawn();
    this._spawn(); // always spawn a new block after a modal
  }

  stop() {
    this.playing = false;
    this.paused  = false;
    clearTimeout(this.spawnTimer);
    if (this.dropArea) {
      this.dropArea.querySelectorAll('.crime-block').forEach(el => {
        cancelAnimationFrame(el._raf);
        clearTimeout(el._resumeTimer);
        el.remove();
      });
    }
  }

  // ── PRIVATE ───────────────────────────────────────
  _scheduleSpawn() {
    clearTimeout(this.spawnTimer);
    if (!this.playing || this.paused) return;
    const delay = Math.max(MIN_SPAWN_DELAY, BASE_SPAWN_DELAY - (this.level - 1) * SPAWN_DELAY_STEP);
    this.spawnTimer = setTimeout(() => {
      if (this.playing && !this.paused) {
        this._spawn();
        this._scheduleSpawn();
      }
    }, delay);
  }

  _spawn() {
    if (!this.playing || this.paused || !this.dropArea) return;

    const hint = document.getElementById('drop-hint');
    if (hint) hint.style.opacity = '0';

    const crime = CRIMES[Math.floor(Math.random() * CRIMES.length)];
    const el    = document.createElement('div');
    el.className   = 'crime-block';
    el.dataset.id  = crime.id;
    el.dataset.cat = crime.category;

    const tagsHtml = crime.tags.map(t => {
      const cls = (t === 'CRÍTICO' || t === 'SEVERO') ? 'critical' : '';
      return `<span class="cb-tag ${cls}">${t}</span>`;
    }).join('');

    el.innerHTML = `
      <div class="cb-id">ART. ${crime.id.replace('art','').toUpperCase()} · ${crime.chapter.split('—')[0].trim()}</div>
      <div class="cb-title">${crime.title}</div>
      <div class="cb-tags">${tagsHtml}</div>`;

    const areaW = this.dropArea.clientWidth || window.innerWidth;
    el.style.left = `${Math.max(0, Math.random() * (areaW - 250))}px`;
    el.style.top  = '-130px';
    el._yPos  = -130;
    el._speed = BASE_FALL_SPEED + (this.level - 1) * FALL_SPEED_STEP;
    el._crime = crime;
    el._dragging = false;
    el._falling = false;
    el._releasePaused = false;
    el._resumeTimer = null;

    this.dropArea.appendChild(el);
    el.addEventListener('pointerdown', e => this._onDown(e, el));
    this._fall(el);
  }

  _fall(el) {
    if (el._falling) return;
    el._falling = true;

    const tick = () => {
      if (!this.playing || this.paused || el._dragging || el._releasePaused || !el.isConnected) {
        el._falling = false;
        return;
      }
      const areaH = this.dropArea.clientHeight;
      el._yPos += el._speed;
      el.style.top = `${el._yPos}px`;
      if (areaH > 0 && el._yPos > areaH) {
        el.remove();
        this._handleWrong(el._crime, 'El delito no fue clasificado a tiempo');
        return;
      }
      el._raf = requestAnimationFrame(tick);
    };
    el._raf = requestAnimationFrame(tick);
  }

  _resumeFallingBlocks() {
    if (!this.dropArea) return;
    this.dropArea.querySelectorAll('.crime-block').forEach(el => {
      if (el._dragging || el._releasePaused) return;
      const currentTop = parseFloat(el.style.top);
      if (!Number.isNaN(currentTop)) el._yPos = currentTop;
      this._fall(el);
    });
  }

  _onDown(e, el) {
    if (!this.playing || this.paused) return;
    e.preventDefault();
    this.dragEl  = el;
    if (el.setPointerCapture) {
      try { el.setPointerCapture(e.pointerId); } catch {}
    }
    el._dragging = true;
    el._releasePaused = false;
    clearTimeout(el._resumeTimer);
    cancelAnimationFrame(el._raf);
    el._falling = false;
    el.classList.add('dragging');
    const r     = el.getBoundingClientRect();
    this.offsetX = e.clientX - r.left;
    this.offsetY = e.clientY - r.top;
  }

  _onMove(e) {
    if (!this.dragEl || !this.dropArea) return;
    const ar = this.dropArea.getBoundingClientRect();
    const blockRect = this.dragEl.getBoundingClientRect();
    const maxLeft = Math.max(DRAG_EDGE_MARGIN, ar.width - blockRect.width - DRAG_EDGE_MARGIN);
    const nextLeft = e.clientX - ar.left - this.offsetX;

    this.dragEl.style.left = `${Math.min(Math.max(nextLeft, DRAG_EDGE_MARGIN), maxLeft)}px`;
    this.dragEl.style.top  = `${e.clientY - ar.top  - this.offsetY}px`;
    this.zones.forEach(z =>
      z.classList.toggle('drag-over', this._hits(e.clientX, e.clientY, z))
    );
  }

  _onUp(e) {
    if (!this.dragEl) return;
    const el    = this.dragEl;
    const crime = el._crime;
    this.dragEl = null;
    if (el.releasePointerCapture) {
      try { el.releasePointerCapture(e.pointerId); } catch {}
    }
    el.classList.remove('dragging');
    this.zones.forEach(z => z.classList.remove('drag-over'));

    let hit = null;
    this.zones.forEach(z => { if (this._hits(e.clientX, e.clientY, z)) hit = z; });

    if (hit) {
      el.remove();
      if (hit.dataset.category === crime.category) {
        this._handleCorrect(crime, hit);
      } else {
        this._handleWrong(crime,
          `Clasificado en "${CATEGORY_NAMES[hit.dataset.category]}" — incorrecto`);
      }
    } else {
      this._pauseThenResumeFall(el);
    }
  }

  _pauseThenResumeFall(el) {
    if (!this.dropArea || !el.isConnected) return;

    const ar = this.dropArea.getBoundingClientRect();
    const blockRect = el.getBoundingClientRect();
    const maxLeft = Math.max(RELEASE_MARGIN, ar.width - blockRect.width - RELEASE_MARGIN);
    const maxTop = Math.max(RELEASE_MARGIN, ar.height - blockRect.height - RELEASE_MARGIN);

    el._dragging = false;
    el._releasePaused = true;
    el._yPos = Math.min(Math.max(blockRect.top - ar.top, RELEASE_MARGIN), maxTop);

    el.style.left = `${Math.min(Math.max(blockRect.left - ar.left, RELEASE_MARGIN), maxLeft)}px`;
    el.style.top = `${el._yPos}px`;

    clearTimeout(el._resumeTimer);
    el._resumeTimer = setTimeout(() => {
      el._releasePaused = false;
      if (this.playing && !this.paused && el.isConnected) {
        this._fall(el);
      }
    }, RELEASE_PAUSE_MS);
  }

  _hits(x, y, el) {
    const r = el.getBoundingClientRect();
    return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
  }

  _handleCorrect(crime, zone) {
    this.score   += POINTS_PER_CORRECT;
    this.correct += 1;
    const cnt = document.getElementById(`cnt-${crime.category}`);
    if (cnt) cnt.textContent = (parseInt(cnt.textContent) || 0) + 1;
    if (this.correct % 5 === 0) { this.level++; this._scheduleSpawn(); }
    this._updateHUD();
    this._flashZone(zone, 'success');
    if (this.score >= WIN_SCORE) {
      this._handleVictory();
    }
  }

  _handleVictory() {
    if (this.won) return;
    this.won = true;
    this.playing = false;
    this.paused = true;
    clearTimeout(this.spawnTimer);
    if (this.dropArea) {
      this.dropArea.querySelectorAll('.crime-block').forEach(el => {
        cancelAnimationFrame(el._raf);
        clearTimeout(el._resumeTimer);
        el.remove();
      });
    }
    this.callbacks.onVictory({
      score: this.score, correct: this.correct,
      wrong: this.wrong, level: this.level
    });
  }

  _handleWrong(crime, reason) {
    this.wrong += 1;
    this.lives  = Math.max(0, this.lives - 1);
    this._updateHUD();
    this.pause();
    if (this.lives <= 0) {
      this.callbacks.onGameOver({
        score: this.score, correct: this.correct,
        wrong: this.wrong, level: this.level
      });
    } else {
      this.callbacks.onError({ crime, reason });
    }
  }

  _flashZone(zone, type) {
    const cls = type === 'success' ? 'zone-flash-success' : 'zone-flash-error';
    zone.classList.add(cls);
    zone.addEventListener('animationend', () => zone.classList.remove(cls), { once: true });
  }

  _updateHUD() {
    const scoreEl = document.getElementById('score');
    const levelEl = document.getElementById('level-display');
    const livesEl = document.getElementById('lives-display');
    if (scoreEl) scoreEl.textContent = String(this.score).padStart(6, '0');
    if (levelEl) levelEl.textContent = this.level;
    const hearts = ['❤️ ❤️ ❤️', '❤️ ❤️ 🖤', '❤️ 🖤 🖤', '🖤 🖤 🖤'];
    if (livesEl) livesEl.textContent = hearts[MAX_LIVES - this.lives] ?? '🖤 🖤 🖤';
  }
}
