(function () {
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  const scoreEl = document.getElementById('score');
  const bestEl = document.getElementById('best');
  const overlay = document.getElementById('overlay');
  const overlayTitle = document.getElementById('overlayTitle');
  const overlayDesc = document.getElementById('overlayDesc');
  const startBtn = document.getElementById('startBtn');
  const pauseBtn = document.getElementById('pauseBtn');

  const W = canvas.width;
  const H = canvas.height;
  const GRAVITY = 0.36;
  const THRUST = -7.0;
  const PILLAR_W = 54;
  const GAP_H = 132;
  const STORAGE_KEY = 'volt_flappy_best_v1';

  let best = Number(localStorage.getItem(STORAGE_KEY) || 0);
  bestEl.textContent = String(best);

  let state = 'MENU';
  let y = H / 2;
  let vy = 0;
  let pillars = [];
  let sparks = [];
  let score = 0;
  let rafId = null;

  function draw() {
    ctx.fillStyle = '#0d0d0f';
    ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    for (let gy = 60; gy < H; gy += 60) {
      ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke();
    }

    for (const p of pillars) {
      ctx.fillStyle = '#1b1b20';
      ctx.strokeStyle = '#f97316';
      ctx.lineWidth = 2;
      ctx.fillRect(p.x, 0, PILLAR_W, p.gapTop);
      ctx.strokeRect(p.x, -2, PILLAR_W, p.gapTop + 2);
      const by = p.gapTop + GAP_H;
      ctx.fillRect(p.x, by, PILLAR_W, H - by);
      ctx.strokeRect(p.x, by, PILLAR_W, H - by + 2);
    }

    for (const sp of sparks) {
      ctx.fillStyle = 'rgba(249, 115, 22, ' + sp.life + ')';
      ctx.beginPath();
      ctx.arc(sp.x, sp.y, 3 * sp.life, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.save();
    ctx.translate(120, y);
    ctx.rotate(Math.max(-0.45, Math.min(0.65, vy * 0.06)));
    ctx.fillStyle = '#f4f4f6';
    ctx.beginPath();
    ctx.moveTo(16, 0);
    ctx.lineTo(-12, -10);
    ctx.lineTo(-7, 0);
    ctx.lineTo(-12, 10);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.arc(2, 0, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function loop() {
    if (state !== 'PLAYING') return;

    vy += GRAVITY;
    y += vy;
    sparks = sparks
      .map((sp) => ({ ...sp, x: sp.x + sp.vx, y: sp.y + sp.vy, life: sp.life - 0.07 }))
      .filter((sp) => sp.life > 0);

    const last = pillars[pillars.length - 1];
    if (!last || W - last.x >= 210) {
      const gapTop = 44 + Math.random() * (H - GAP_H - 88);
      pillars.push({ x: W + 10, gapTop, scored: false });
    }

    const dx = 120;
    const dr = 10;

    for (const p of pillars) {
      p.x -= 2.8;
      if (!p.scored && p.x + PILLAR_W < dx) {
        p.scored = true;
        score += 1;
        scoreEl.textContent = String(score);
        if (score > best) {
          best = score;
          bestEl.textContent = String(best);
          localStorage.setItem(STORAGE_KEY, String(best));
        }
      }
      if (dx + dr > p.x && dx - dr < p.x + PILLAR_W && (y - dr < p.gapTop || y + dr > p.gapTop + GAP_H)) {
        endGame();
        return;
      }
    }

    pillars = pillars.filter((p) => p.x + PILLAR_W > -20);
    if (y - dr < 0 || y + dr > H) {
      endGame();
      return;
    }

    draw();
    rafId = window.requestAnimationFrame(loop);
  }

  function endGame() {
    state = 'OVER';
    overlayTitle.textContent = 'Flight Terminated';
    overlayDesc.textContent = 'Score: ' + score + ' · Best: ' + best;
    startBtn.textContent = 'Play Again';
    overlay.classList.remove('hidden');
    draw();
  }

  function start() {
    window.cancelAnimationFrame(rafId);
    y = H / 2;
    vy = THRUST * 0.7;
    pillars = [{ x: W + 60, gapTop: 120, scored: false }];
    sparks = [];
    score = 0;
    scoreEl.textContent = '0';
    state = 'PLAYING';
    pauseBtn.textContent = 'Pause';
    overlay.classList.add('hidden');
    rafId = window.requestAnimationFrame(loop);
  }

  function thrust() {
    if (state === 'MENU' || state === 'OVER') {
      start();
      return;
    }
    if (state !== 'PLAYING') return;
    vy = THRUST;
    for (let i = 0; i < 6; i++) {
      sparks.push({ x: 112, y: y + 4, vx: -1.5 - Math.random() * 2, vy: (Math.random() - 0.5) * 2.5 + 1, life: 1 });
    }
  }

  function togglePause() {
    if (state === 'PLAYING') {
      state = 'PAUSED';
      window.cancelAnimationFrame(rafId);
      pauseBtn.textContent = 'Resume';
      overlayTitle.textContent = 'Paused';
      overlayDesc.textContent = 'Current Score: ' + score;
      startBtn.textContent = 'Resume';
      overlay.classList.remove('hidden');
    } else if (state === 'PAUSED') {
      state = 'PLAYING';
      pauseBtn.textContent = 'Pause';
      overlay.classList.add('hidden');
      rafId = window.requestAnimationFrame(loop);
    }
  }

  startBtn.addEventListener('click', () => (state === 'PAUSED' ? togglePause() : start()));
  pauseBtn.addEventListener('click', togglePause);
  canvas.addEventListener('pointerdown', thrust);
  window.addEventListener('keydown', (e) => {
    if (e.key === ' ' || e.key === 'ArrowUp' || e.key.toLowerCase() === 'w') {
      e.preventDefault();
      thrust();
    }
  });

  draw();
})();
