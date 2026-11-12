(function () {
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  const scoreEl = document.getElementById('score');
  const bestEl = document.getElementById('best');
  const livesEl = document.getElementById('lives');
  const levelEl = document.getElementById('level');
  const overlay = document.getElementById('overlay');
  const overlayTitle = document.getElementById('overlayTitle');
  const overlayDesc = document.getElementById('overlayDesc');
  const startBtn = document.getElementById('startBtn');
  const pauseBtn = document.getElementById('pauseBtn');

  const W = canvas.width;
  const H = canvas.height;
  const PADDLE_W = 92;
  const PADDLE_H = 12;
  const BALL_R = 7;
  const STORAGE_KEY = 'cinder_breaker_best_v1';

  let best = Number(localStorage.getItem(STORAGE_KEY) || 0);
  bestEl.textContent = String(best);

  let state = 'MENU';
  let paddleX = W / 2 - PADDLE_W / 2;
  let ballX = W / 2;
  let ballY = H - 48;
  let vx = 3.5;
  let vy = -4.2;
  let bricks = [];
  let trail = [];
  let score = 0;
  let lives = 3;
  let level = 1;
  let keys = { left: false, right: false };
  let rafId = null;

  function makeBricks(lvl) {
    const cols = 8;
    const rows = Math.min(6, 4 + lvl - 1);
    const padX = 18;
    const gap = 8;
    const bw = (W - padX * 2 - gap * (cols - 1)) / cols;
    const bh = 18;
    const list = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const hp = r === 0 || (lvl > 1 && r === 1 && (c + r) % 2 === 0) ? 2 : 1;
        list.push({
          x: padX + c * (bw + gap),
          y: 36 + r * (bh + gap),
          w: bw,
          h: bh,
          hp,
          maxHp: hp,
        });
      }
    }
    return list;
  }

  function resetBall() {
    paddleX = W / 2 - PADDLE_W / 2;
    ballX = W / 2;
    ballY = H - 48;
    const mult = 1 + (level - 1) * 0.1;
    vx = (Math.random() > 0.5 ? 1 : -1) * 3.4 * mult;
    vy = -4.2 * mult;
    trail = [];
  }

  function draw() {
    ctx.fillStyle = '#0d0d0f';
    ctx.fillRect(0, 0, W, H);

    for (const b of bricks) {
      if (b.hp <= 0) continue;
      ctx.fillStyle = b.hp === 2 ? '#ea580c' : b.maxHp === 2 ? '#fdba74' : '#f97316';
      ctx.beginPath();
      ctx.roundRect(b.x, b.y, b.w, b.h, 4);
      ctx.fill();
    }

    trail.forEach((pt, idx) => {
      const alpha = ((idx + 1) / trail.length) * 0.35;
      ctx.fillStyle = 'rgba(249, 115, 22, ' + alpha + ')';
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, BALL_R * 0.7, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.save();
    ctx.shadowColor = '#f97316';
    ctx.shadowBlur = 12;
    ctx.fillStyle = '#fff7ed';
    ctx.beginPath();
    ctx.arc(ballX, ballY, BALL_R, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.fillStyle = '#f4f4f6';
    ctx.beginPath();
    ctx.roundRect(paddleX, H - 26, PADDLE_W, PADDLE_H, 6);
    ctx.fill();
    ctx.fillStyle = '#f97316';
    ctx.fillRect(paddleX + 14, H - 26, PADDLE_W - 28, 3);
  }

  function loop() {
    if (state !== 'PLAYING') return;

    if (keys.left) paddleX -= 7;
    if (keys.right) paddleX += 7;
    paddleX = Math.max(8, Math.min(W - PADDLE_W - 8, paddleX));

    trail.push({ x: ballX, y: ballY });
    if (trail.length > 8) trail.shift();

    ballX += vx;
    ballY += vy;

    if (ballX - BALL_R < 0) { ballX = BALL_R; vx = Math.abs(vx); }
    if (ballX + BALL_R > W) { ballX = W - BALL_R; vx = -Math.abs(vx); }
    if (ballY - BALL_R < 0) { ballY = BALL_R; vy = Math.abs(vy); }

    const pTop = H - 26;
    if (vy > 0 && ballY + BALL_R >= pTop && ballY - BALL_R <= pTop + PADDLE_H && ballX >= paddleX - 4 && ballX <= paddleX + PADDLE_W + 4) {
      const norm = (ballX - (paddleX + PADDLE_W / 2)) / (PADDLE_W / 2);
      const spd = Math.hypot(vx, vy);
      const ang = norm * (Math.PI / 3);
      vx = spd * Math.sin(ang);
      vy = -Math.abs(spd * Math.cos(ang));
      ballY = pTop - BALL_R;
    }

    for (const b of bricks) {
      if (b.hp <= 0) continue;
      if (ballX + BALL_R > b.x && ballX - BALL_R < b.x + b.w && ballY + BALL_R > b.y && ballY - BALL_R < b.y + b.h) {
        b.hp -= 1;
        const ox = Math.min(ballX + BALL_R - b.x, b.x + b.w - (ballX - BALL_R));
        const oy = Math.min(ballY + BALL_R - b.y, b.y + b.h - (ballY - BALL_R));
        if (ox < oy) vx = -vx;
        else vy = -vy;
        score += b.hp === 0 ? 25 : 10;
        scoreEl.textContent = String(score);
        if (score > best) {
          best = score;
          bestEl.textContent = String(best);
          localStorage.setItem(STORAGE_KEY, String(best));
        }
        break;
      }
    }

    if (bricks.every((b) => b.hp <= 0)) {
      level += 1;
      levelEl.textContent = String(level);
      bricks = makeBricks(level);
      resetBall();
    }

    if (ballY - BALL_R > H) {
      lives -= 1;
      livesEl.textContent = String(lives);
      if (lives <= 0) {
        state = 'OVER';
        overlayTitle.textContent = 'Game Over';
        overlayDesc.textContent = 'Final Score: ' + score + ' · Best: ' + best;
        startBtn.textContent = 'Play Again';
        overlay.classList.remove('hidden');
        draw();
        return;
      }
      resetBall();
    }

    draw();
    rafId = window.requestAnimationFrame(loop);
  }

  function start() {
    window.cancelAnimationFrame(rafId);
    score = 0;
    lives = 3;
    level = 1;
    scoreEl.textContent = '0';
    livesEl.textContent = '3';
    levelEl.textContent = '1';
    bricks = makeBricks(1);
    resetBall();
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
    const x = ((e.clientX - rect.left) / rect.width) * W - PADDLE_W / 2;
    paddleX = Math.max(8, Math.min(W - PADDLE_W - 8, x));
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') keys.left = true;
    if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') keys.right = true;
    if (e.key === ' ') {
      e.preventDefault();
      if (state === 'MENU' || state === 'OVER') start();
      else togglePause();
    }
  });
  window.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') keys.left = false;
    if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') keys.right = false;
  });

  bricks = makeBricks(1);
  draw();
})();
