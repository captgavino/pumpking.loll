(function () {
  const boardEl = document.getElementById('board');
  const scoreEl = document.getElementById('score');
  const bestEl = document.getElementById('best');
  const undoBtn = document.getElementById('undoBtn');
  const restartBtn = document.getElementById('restartBtn');
  const overlay = document.getElementById('overlay');
  const overlayTitle = document.getElementById('overlayTitle');
  const overlayDesc = document.getElementById('overlayDesc');
  const againBtn = document.getElementById('againBtn');

  const STORAGE_KEY = 'forge_2048_best_v1';
  let best = Number(localStorage.getItem(STORAGE_KEY) || 0);
  bestEl.textContent = String(best);

  let grid = [];
  let prev = null;
  let score = 0;
  let touchStart = null;

  function empty() {
    return Array.from({ length: 4 }, () => [0, 0, 0, 0]);
  }

  function clone(g) {
    return g.map((r) => [...r]);
  }

  function addTile(g) {
    const free = [];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (g[r][c] === 0) free.push([r, c]);
      }
    }
    if (!free.length) return;
    const [r, c] = free[Math.floor(Math.random() * free.length)];
    g[r][c] = Math.random() < 0.9 ? 2 : 4;
  }

  function slideLeft(line) {
    const vals = line.filter((v) => v !== 0);
    const out = [];
    let gained = 0;
    for (let i = 0; i < vals.length; i++) {
      if (i + 1 < vals.length && vals[i] === vals[i + 1]) {
        const merged = vals[i] * 2;
        out.push(merged);
        gained += merged;
        i++;
      } else {
        out.push(vals[i]);
      }
    }
    while (out.length < 4) out.push(0);
    return { row: out, gained };
  }

  function hasMoves(g) {
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (g[r][c] === 0) return true;
        if (r < 3 && g[r][c] === g[r + 1][c]) return true;
        if (c < 3 && g[r][c] === g[r][c + 1]) return true;
      }
    }
    return false;
  }

  function render() {
    boardEl.innerHTML = '';
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        const val = grid[r][c];
        const div = document.createElement('div');
        div.className = 'tile t' + (val > 2048 ? 2048 : val);
        div.textContent = val > 0 ? String(val) : '';
        boardEl.appendChild(div);
      }
    }
    scoreEl.textContent = String(score);
    undoBtn.disabled = !prev;
  }

  function move(dir) {
    const next = empty();
    let gained = 0;

    if (dir === 'LEFT') {
      for (let r = 0; r < 4; r++) {
        const res = slideLeft(grid[r]);
        next[r] = res.row;
        gained += res.gained;
      }
    } else if (dir === 'RIGHT') {
      for (let r = 0; r < 4; r++) {
        const res = slideLeft([...grid[r]].reverse());
        next[r] = res.row.reverse();
        gained += res.gained;
      }
    } else if (dir === 'UP') {
      for (let c = 0; c < 4; c++) {
        const res = slideLeft([grid[0][c], grid[1][c], grid[2][c], grid[3][c]]);
        for (let r = 0; r < 4; r++) next[r][c] = res.row[r];
        gained += res.gained;
      }
    } else {
      for (let c = 0; c < 4; c++) {
        const res = slideLeft([grid[3][c], grid[2][c], grid[1][c], grid[0][c]]);
        const rev = res.row.reverse();
        for (let r = 0; r < 4; r++) next[r][c] = rev[r];
        gained += res.gained;
      }
    }

    let changed = false;
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (next[r][c] !== grid[r][c]) changed = true;
      }
    }
    if (!changed) return;

    prev = { grid: clone(grid), score };
    addTile(next);
    grid = next;
    score += gained;
    if (score > best) {
      best = score;
      bestEl.textContent = String(best);
      localStorage.setItem(STORAGE_KEY, String(best));
    }
    render();

    if (!hasMoves(grid)) {
      overlayTitle.textContent = 'No Moves Left';
      overlayDesc.textContent = 'Final Score: ' + score + ' · Best: ' + best;
      overlay.classList.remove('hidden');
    }
  }

  function start() {
    grid = empty();
    addTile(grid);
    addTile(grid);
    prev = null;
    score = 0;
    overlay.classList.add('hidden');
    render();
  }

  undoBtn.addEventListener('click', () => {
    if (!prev) return;
    grid = prev.grid;
    score = prev.score;
    prev = null;
    overlay.classList.add('hidden');
    render();
  });

  restartBtn.addEventListener('click', start);
  againBtn.addEventListener('click', start);

  window.addEventListener('keydown', (e) => {
    const k = e.key.toLowerCase();
    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(k)) e.preventDefault();
    if (k === 'arrowup' || k === 'w') move('UP');
    if (k === 'arrowdown' || k === 's') move('DOWN');
    if (k === 'arrowleft' || k === 'a') move('LEFT');
    if (k === 'arrowright' || k === 'd') move('RIGHT');
  });

  boardEl.addEventListener('touchstart', (e) => {
    touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  });
  boardEl.addEventListener('touchend', (e) => {
    if (!touchStart) return;
    const dx = e.changedTouches[0].clientX - touchStart.x;
    const dy = e.changedTouches[0].clientY - touchStart.y;
    touchStart = null;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;
    if (Math.abs(dx) > Math.abs(dy)) move(dx > 0 ? 'RIGHT' : 'LEFT');
    else move(dy > 0 ? 'DOWN' : 'UP');
  });

  start();
})();
