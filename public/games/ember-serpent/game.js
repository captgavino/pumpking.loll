(function () {
  const params = new URLSearchParams(window.location.search);
  const root = document.documentElement.style;
  if (params.get('accent')) root.setProperty('--accent', params.get('accent'));
  if (params.get('accentFg')) root.setProperty('--accent-fg', params.get('accentFg'));
  if (params.get('bg')) root.setProperty('--bg', params.get('bg'));
  if (params.get('surface')) root.setProperty('--surface', params.get('surface'));
  if (params.get('text')) root.setProperty('--text', params.get('text'));

  const accentColor = params.get('accent') || '#f97316';
  const canvasBg = '#0d0d0f';

  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  const scoreEl = document.getElementById('score');
  const bestEl = document.getElementById('best');
  const overlay = document.getElementById('overlay');
  const overlayTitle = document.getElementById('overlayTitle');
  const overlayDesc = document.getElementById('overlayDesc');
  const startBtn = document.getElementById('startBtn');
  const pauseBtn = document.getElementById('pauseBtn');

  const GRID = 20;
  const SIZE = canvas.width;
  const CELL = SIZE / GRID;
  const STORAGE_KEY = 'ember_serpent_best_v1';

  let best = Number(localStorage.getItem(STORAGE_KEY) || 0);
  bestEl.textContent = String(best);

  let snake = [];
  let dir = { x: 1, y: 0 };
  let nextDir = { x: 1, y: 0 };
  let food = { x: 14, y: 10 };
  let bonus = null;
  let bonusTicks = 0;
  let score = 0;
  let speedMs = 115;
  let state = 'MENU';
  let timer = null;

  function spawnFood() {
    const occupied = new Set(snake.map((s) => s.x + ',' + s.y));
    const free = [];
    for (let x = 0; x < GRID; x++) {
      for (let y = 0; y < GRID; y++) {
        if (!occupied.has(x + ',' + y)) free.push({ x, y });
      }
    }
    return free.length ? free[Math.floor(Math.random() * free.length)] : { x: 0, y: 0 };
  }

  function draw() {
    ctx.fillStyle = canvasBg;
    ctx.fillRect(0, 0, SIZE, SIZE);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    for (let i = 1; i < GRID; i++) {
      const p = i * CELL;
      ctx.beginPath(); ctx.moveTo(p, 0); ctx.lineTo(p, SIZE); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, p); ctx.lineTo(SIZE, p); ctx.stroke();
    }

    // Food
    const fx = food.x * CELL + CELL / 2;
    const fy = food.y * CELL + CELL / 2;
    ctx.save();
    ctx.shadowColor = accentColor;
    ctx.shadowBlur = 12;
    ctx.fillStyle = accentColor;
    ctx.beginPath();
    ctx.arc(fx, fy, CELL * 0.34, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    if (bonus) {
      const bx = bonus.x * CELL + CELL / 2;
      const by = bonus.y * CELL + CELL / 2;
      ctx.save();
      ctx.translate(bx, by);
      ctx.rotate(Math.PI / 4);
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(-CELL * 0.26, -CELL * 0.26, CELL * 0.52, CELL * 0.52);
      ctx.restore();
    }

    snake.forEach((seg, i) => {
      ctx.fillStyle = i === 0 ? '#f4f4f6' : accentColor;
      ctx.globalAlpha = i === 0 ? 1 : Math.max(0.35, 1 - i / (snake.length + 4));
      ctx.beginPath();
      ctx.roundRect(seg.x * CELL + 2, seg.y * CELL + 2, CELL - 4, CELL - 4, i === 0 ? 6 : 4);
      ctx.fill();
      ctx.globalAlpha = 1;
    });
  }

  function step() {
    if (state !== 'PLAYING') return;
    dir = nextDir;
    const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
    const hitWall = head.x < 0 || head.x >= GRID || head.y < 0 || head.y >= GRID;
    const hitSelf = snake.some((s) => s.x === head.x && s.y === head.y);

    if (hitWall || hitSelf) {
      state = 'OVER';
      overlayTitle.textContent = 'Game Over';
      overlayDesc.textContent = 'Final Score: ' + score + ' · Best: ' + best;
      startBtn.textContent = 'Play Again';
      overlay.classList.remove('hidden');
      draw();
      return;
    }

    snake.unshift(head);
    if (head.x === food.x && head.y === food.y) {
      score += 10;
      speedMs = Math.max(58, speedMs - 2);
      food = spawnFood();
      if (!bonus && Math.random() < 0.22) {
        bonus = spawnFood();
        bonusTicks = 45;
      }
    } else if (bonus && head.x === bonus.x && head.y === bonus.y) {
      score += 30;
      bonus = null;
    } else {
      snake.pop();
    }

    if (bonus) {
      bonusTicks--;
      if (bonusTicks <= 0) bonus = null;
    }

    scoreEl.textContent = String(score);
    if (score > best) {
      best = score;
      bestEl.textContent = String(best);
      localStorage.setItem(STORAGE_KEY, String(best));
    }

    draw();
    timer = window.setTimeout(step, speedMs);
  }

  function start() {
    window.clearTimeout(timer);
    snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
    dir = { x: 1, y: 0 };
    nextDir = { x: 1, y: 0 };
    food = spawnFood();
    bonus = null;
    score = 0;
    speedMs = 115;
    scoreEl.textContent = '0';
    state = 'PLAYING';
    pauseBtn.textContent = 'Pause';
    overlay.classList.add('hidden');
    draw();
    timer = window.setTimeout(step, speedMs);
  }

  function togglePause() {
    if (state === 'PLAYING') {
      state = 'PAUSED';
      window.clearTimeout(timer);
      pauseBtn.textContent = 'Resume';
      overlayTitle.textContent = 'Paused';
      overlayDesc.textContent = 'Current Score: ' + score;
      startBtn.textContent = 'Resume';
      overlay.classList.remove('hidden');
    } else if (state === 'PAUSED') {
      state = 'PLAYING';
      pauseBtn.textContent = 'Pause';
      overlay.classList.add('hidden');
      timer = window.setTimeout(step, speedMs);
    }
  }

  function setDir(x, y) {
    if (state !== 'PLAYING') return;
    if (dir.x + x === 0 && dir.y + y === 0) return;
    nextDir = { x, y };
  }

  startBtn.addEventListener('click', () => {
    if (state === 'PAUSED') togglePause();
    else start();
  });
  pauseBtn.addEventListener('click', togglePause);

  window.addEventListener('keydown', (e) => {
    const k = e.key.toLowerCase();
    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(k)) e.preventDefault();
    if (k === 'arrowup' || k === 'w') setDir(0, -1);
    else if (k === 'arrowdown' || k === 's') setDir(0, 1);
    else if (k === 'arrowleft' || k === 'a') setDir(-1, 0);
    else if (k === 'arrowright' || k === 'd') setDir(1, 0);
    else if (k === ' ') {
      if (state === 'MENU' || state === 'OVER') start();
      else togglePause();
    }
  });

  document.querySelectorAll('[data-dir]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const d = btn.getAttribute('data-dir');
      if (d === 'up') setDir(0, -1);
      if (d === 'down') setDir(0, 1);
      if (d === 'left') setDir(-1, 0);
      if (d === 'right') setDir(1, 0);
    });
  });

  snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
  draw();
})();
