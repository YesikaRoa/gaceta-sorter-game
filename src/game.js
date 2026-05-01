import { CRIMES, CATEGORY_NAMES } from './data.js';

const MAX_LIVES = 3;

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
    this.spawnTimer = null;
    this.dragEl     = null;
    this.offsetX    = 0;
    this.offsetY    = 0;

    // DOM references are resolved lazily in start() to avoid timing issues
    this.dropArea = null;
    this.zones    = null;

    window.addEventListener('pointermove', e => this._onMove(e));
    window.addEventListener('pointerup',   e => this._onUp(e));
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
    this.paused  = false;
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
        el.remove();
      });
    }
  }

  // ── PRIVATE ───────────────────────────────────────
  _scheduleSpawn() {
    clearTimeout(this.spawnTimer);
    if (!this.playing || this.paused) return;
    const delay = Math.max(800, 3000 - (this.level - 1) * 200);
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
    el._speed = (1 + (this.level - 1) * 0.15) * 1.5;
    el._crime = crime;
    el._dragging = false;

    this.dropArea.appendChild(el);
    el.addEventListener('pointerdown', e => this._onDown(e, el));
    this._fall(el);
  }

  _fall(el) {
    const tick = () => {
      if (!this.playing || this.paused || el._dragging || !el.isConnected) return;
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

  _onDown(e, el) {
    if (!this.playing || this.paused) return;
    e.preventDefault();
    this.dragEl  = el;
    el._dragging = true;
    cancelAnimationFrame(el._raf);
    el.classList.add('dragging');
    const r     = el.getBoundingClientRect();
    this.offsetX = e.clientX - r.left;
    this.offsetY = e.clientY - r.top;
  }

  _onMove(e) {
    if (!this.dragEl || !this.dropArea) return;
    const ar = this.dropArea.getBoundingClientRect();
    this.dragEl.style.left = `${e.clientX - ar.left - this.offsetX}px`;
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
      // Resume falling from current position
      el._dragging = false;
      const ar = this.dropArea.getBoundingClientRect();
      el._yPos = el.getBoundingClientRect().top - ar.top;
      this._fall(el);
    }
  }

  _hits(x, y, el) {
    const r = el.getBoundingClientRect();
    return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
  }

  _handleCorrect(crime, zone) {
    this.score   += 1500 + (this.level - 1) * 200;
    this.correct += 1;
    const cnt = document.getElementById(`cnt-${crime.category}`);
    if (cnt) cnt.textContent = (parseInt(cnt.textContent) || 0) + 1;
    if (this.correct % 5 === 0) { this.level++; this._scheduleSpawn(); }
    this._updateHUD();
    this._flashZone(zone, 'success');
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
