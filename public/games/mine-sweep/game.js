(function () {
  const gridEl = document.getElementById('grid');
  const minesLeftEl = document.getElementById('minesLeft');
  const flagBtn = document.getElementById('flagBtn');
  const timerEl = document.getElementById('timer');
  const overlay = document.getElementById('overlay');
  const overlayTitle = document.getElementById('overlayTitle');
  const overlayDesc = document.getElementById('overlayDesc');
  const againBtn = document.getElementById('againBtn');

  const ROWS = 9;
  const COLS = 9;
  const MINES = 10;
  const BEST_KEY = 'mine_sweep_best_v1';

  let board = [];
  let seeded = false;
  let flagMode = false;
  let over = false;
  let sec = 0;
  let timerId = null;

  function initBoard() {
    board = Array.from({ length: ROWS }, () =>
      Array.from({ length: COLS }, () => ({ mine: false, revealed: false, flagged: false, adj: 0 }))
    );
  }

  function seedMines(sr, sc) {
    let placed = 0;
    while (placed < MINES) {
      const r = Math.floor(Math.random() * ROWS);
      const c = Math.floor(Math.random() * COLS);
      if (Math.abs(r - sr) <= 1 && Math.abs(c - sc) <= 1) continue;
      if (!board[r][c].mine) {
        board[r][c].mine = true;
        placed++;
      }
    }
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (board[r][c].mine) continue;
        let cnt = 0;
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const nr = r + dr, nc = c + dc;
            if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && board[nr][nc].mine) cnt++;
          }
        }
        board[r][c].adj = cnt;
      }
    }
    seeded = true;
    timerId = window.setInterval(() => {
      sec += 1;
      timerEl.textContent = sec + 's';
    }, 1000);
  }

  function flood(sr, sc) {
    const q = [[sr, sc]];
    while (q.length) {
      const [r, c] = q.shift();
      const cell = board[r][c];
      if (cell.revealed || cell.flagged) continue;
      cell.revealed = true;
      if (cell.adj === 0 && !cell.mine) {
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const nr = r + dr, nc = c + dc;
            if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && !board[nr][nc].revealed) q.push([nr, nc]);
          }
        }
      }
    }
  }

  function render() {
    gridEl.innerHTML = '';
    let flags = 0;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const cell = board[r][c];
        if (cell.flagged) flags++;
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'cell';
        if (cell.revealed) {
          btn.classList.add('revealed');
          if (cell.mine) {
            btn.classList.add('mine');
            btn.textContent = '*';
          } else if (cell.adj > 0) {
            btn.classList.add('n' + cell.adj);
            btn.textContent = String(cell.adj);
          }
        } else if (cell.flagged) {
          btn.classList.add('flagged');
          btn.textContent = 'F';
        }
        btn.addEventListener('click', () => handleCell(r, c));
        btn.addEventListener('contextmenu', (e) => {
          e.preventDefault();
          toggleFlag(r, c);
        });
        gridEl.appendChild(btn);
      }
    }
    minesLeftEl.textContent = String(MINES - flags);
  }

  function toggleFlag(r, c) {
    if (over || board[r][c].revealed) return;
    board[r][c].flagged = !board[r][c].flagged;
    render();
  }

  function handleCell(r, c) {
    if (over) return;
    if (flagMode) {
      toggleFlag(r, c);
      return;
    }
    if (!seeded) seedMines(r, c);
    const cell = board[r][c];
    if (cell.revealed || cell.flagged) return;

    if (cell.mine) {
      over = true;
      window.clearInterval(timerId);
      board.forEach((row) => row.forEach((item) => { if (item.mine) item.revealed = true; }));
      render();
      overlayTitle.textContent = 'Mine Detonated';
      overlayDesc.textContent = 'Elapsed Time: ' + sec + 's';
      overlay.classList.remove('hidden');
      return;
    }

    flood(r, c);
    render();

    const safeLeft = board.flat().filter((item) => !item.mine && !item.revealed).length;
    if (safeLeft === 0) {
      over = true;
      window.clearInterval(timerId);
      const time = Math.max(1, sec);
      const prevBest = Number(localStorage.getItem(BEST_KEY) || 0);
      const best = prevBest > 0 ? Math.min(prevBest, time) : time;
      localStorage.setItem(BEST_KEY, String(best));
      overlayTitle.textContent = 'Grid Cleared';
      overlayDesc.textContent = 'Cleared in ' + time + 's · Best: ' + best + 's';
      overlay.classList.remove('hidden');
    }
  }

  function start() {
    window.clearInterval(timerId);
    seeded = false;
    over = false;
    sec = 0;
    timerEl.textContent = '0s';
    overlay.classList.add('hidden');
    initBoard();
    render();
  }

  flagBtn.addEventListener('click', () => {
    flagMode = !flagMode;
    flagBtn.textContent = 'Flag Mode: ' + (flagMode ? 'On' : 'Off');
    flagBtn.classList.toggle('flag-active', flagMode);
  });

  againBtn.addEventListener('click', start);
  start();
})();
