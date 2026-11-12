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
  const STORAGE_KEY = 'solar_dodger_best_v1';

  let best = Number(localStorage.getItem(STORAGE_KEY) || 0);
  bestEl.textContent = String(best);

  let state = 'MENU';
  let px = W / 2;
  let py = H / 2;
  let targetX = null;
  let targetY = null;
  let keys = { up: false, down: false, left: false, right: false };
  let shards = [];
  let orb = { x: 140, y: 120, r: 9, pulse: 0 };
  let spawnTick = 0;
  let frames = 0;
  let score = 0;
  let rafId = null;

  function spawnOrb() {
    return {
      x: 36 + Math.random() * (W - 72),
      y: 36 + Math.random() * (H - 72),
      r: 9,
      pulse: 0,
    };
  }

  function spawnShard(diff) {
    const edge = Math.floor(Math.random() * 4);
    const spd = 2.1 + Math.random() * 1.6 + diff * 0.25;
    let x = 0, y = 0, vx = 0, vy = 0;
    if (edge === 0) { x = Math.random() * W; y = -20; vx = (Math.random() - 0.5) * 2; vy = spd; }
    else if (edge === 1) { x = W + 20; y = Math.random() * H; vx = -spd; vy = (Math.random() - 0.5) * 2; }
    else if (edge === 2) { x = Math.random() * W; y = H + 20; vx = (Math.random() - 0.5) * 2; vy = -spd; }
    else { x = -20; y = Math.random() * H; vx = spd; vy = (Math.random() - 0.5) * 2; }
    return { x, y, vx, vy, r: 9 + Math.random() * 7, rot: Math.random() * Math.PI * 2, vRot: (Math.random() - 0.5) * 0.08 };
  }

  function draw() {
    ctx.fillStyle = '#0d0d0f';
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    for (let x = 28; x < W; x += 56) {
      for (let y = 28; y < H; y += 56) {
        ctx.fillRect(x, y, 1.5, 1.5);
      }
    }

    const pr = orb.r + Math.sin(orb.pulse) * 2.2;
    ctx.save();
    ctx.shadowColor = '#fbbf24';
    ctx.shadowBlur = 16;
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.arc(orb.x, orb.y, pr, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fef3c7';
    ctx.beginPath();
    ctx.arc(orb.x, orb.y, pr * 0.45, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    for (const sh of shards) {
      ctx.save();
      ctx.translate(sh.x, sh.y);
      ctx.rotate(sh.rot);
      ctx.fillStyle = '#25252c';
      ctx.strokeStyle = '#ea580c';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, -sh.r);
      ctx.lineTo(sh.r * 0.85, -sh.r * 0.2);
      ctx.lineTo(sh.r * 0.65, sh.r * 0.9);
      ctx.lineTo(-sh.r * 0.8, sh.r * 0.5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    ctx.save();
    ctx.translate(px, py);
    ctx.shadowColor = '#f97316';
    ctx.shadowBlur = 12;
    ctx.fillStyle = '#f4f4f6';
    ctx.beginPath();
    ctx.moveTo(0, -13);
    ctx.lineTo(11, 10);
    ctx.lineTo(0, 5);
    ctx.lineTo(-11, 10);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function loop() {
    if (state !== 'PLAYING') return;

    const spd = 4.8;
    if (targetX !== null && targetY !== null) {
      px += (targetX - px) * 0.22;
      py += (targetY - py) * 0.22;
    } else {
      if (keys.left) px -= spd;
      if (keys.right) px += spd;
      if (keys.up) py -= spd;
      if (keys.down) py += spd;
    }
    px = Math.max(14, Math.min(W - 14, px));
    py = Math.max(14, Math.min(H - 14, py));

    frames += 1;
    orb.pulse += 0.1;

    const diff = Math.floor(frames / 300);
    spawnTick += 1;
    if (spawnTick >= Math.max(14, 34 - diff * 3)) {
      spawnTick = 0;
      shards.push(spawnShard(diff));
    }

    if (Math.hypot(px - orb.x, py - orb.y) < 12 + orb.r) {
      score += 25;
      orb = spawnOrb();
    } else if (frames % 30 === 0) {
      score += 2;
    }

    scoreEl.textContent = String(score);
    if (score > best) {
      best = score;
      bestEl.textContent = String(best);
      localStorage.setItem(STORAGE_KEY, String(best));
    }

    const next = [];
    for (const sh of shards) {
      sh.x += sh.vx;
      sh.y += sh.vy;
      sh.rot += sh.vRot;
      if (Math.hypot(px - sh.x, py - sh.y) < sh.r + 8) {
        state = 'OVER';
        overlayTitle.textContent = 'Hull Breached';
        overlayDesc.textContent = 'Final Score: ' + score + ' · Best: ' + best;
        startBtn.textContent = 'Play Again';
        overlay.classList.remove('hidden');
        draw();
        return;
      }
      if (sh.x > -50 && sh.x < W + 50 && sh.y > -50 && sh.y < H + 50) next.push(sh);
    }
    shards = next;

    draw();
    rafId = window.requestAnimationFrame(loop);
  }

  function start() {
    window.cancelAnimationFrame(rafId);
    px = W / 2;
    py = H / 2;
    targetX = null;
    targetY = null;
    shards = [];
    orb = spawnOrb();
    spawnTick = 0;
    frames = 0;
    score = 0;
    scoreEl.textContent = '0';
    state = 'PLAYING';
    pauseBtn.textContent = 'Pause';
    overlay.classList.add('hidden');
    rafId = window.requestAnimationFrame(loop);
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

  canvas.addEventListener('pointermove', (e) => {
    if (state !== 'PLAYING') return;
    const rect = canvas.getBoundingClientRect();
    targetX = ((e.clientX - rect.left) / rect.width) * W;
    targetY = ((e.clientY - rect.top) / rect.height) * H;
  });

  window.addEventListener('keydown', (e) => {
    const k = e.key.toLowerCase();
    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(k)) e.preventDefault();
    if (k === 'arrowup' || k === 'w') { keys.up = true; targetX = null; }
    if (k === 'arrowdown' || k === 's') { keys.down = true; targetX = null; }
    if (k === 'arrowleft' || k === 'a') { keys.left = true; targetX = null; }
    if (k === 'arrowright' || k === 'd') { keys.right = true; targetX = null; }
    if (k === ' ') {
      if (state === 'MENU' || state === 'OVER') start();
      else togglePause();
    }
  });
  window.addEventListener('keyup', (e) => {
    const k = e.key.toLowerCase();
    if (k === 'arrowup' || k === 'w') keys.up = false;
    if (k === 'arrowdown' || k === 's') keys.down = false;
    if (k === 'arrowleft' || k === 'a') keys.left = false;
    if (k === 'arrowright' || k === 'd') keys.right = false;
  });

  draw();
})();
