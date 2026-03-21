// =====================
// GLOBAL SCORE SYSTEM
// =====================
const scores = { ttt: 0, rps: 0, mem: 0 };

function addScore(game, pts) {
  scores[game] += pts;
  document.getElementById('score-' + game).textContent = scores[game];
  document.getElementById('score-total').textContent = scores.ttt + scores.rps + scores.mem;
}

function showToast(msg, color = 'var(--neon-green)') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.style.borderColor = color;
  t.style.color = color;
  t.style.boxShadow = `0 0 10px ${color}88`;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2200);
}

function switchGame(g) {
  document.querySelectorAll('.game-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('panel-' + g).classList.add('active');
  document.querySelector(`.nav-btn[data-game="${g}"]`).classList.add('active');
}

// =====================
// TIC TAC TOE
// =====================
let tttBoard = Array(9).fill('');
let tttCurrent = 'X';
let tttActive = true;
let tttMode = '2p';
const tttWins = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];

function tttSetMode(m) {
  tttMode = m;
  document.getElementById('mode-2p').classList.toggle('active', m === '2p');
  document.getElementById('mode-ai').classList.toggle('active', m === 'ai');
  tttReset();
}

function tttRender() {
  const board = document.getElementById('ttt-board');
  board.innerHTML = '';
  tttBoard.forEach((v, i) => {
    const cell = document.createElement('div');
    cell.className = 'ttt-cell' + (v ? ' taken ' + v : '');
    cell.textContent = v;
    cell.onclick = () => tttClick(i);
    board.appendChild(cell);
  });
}

function tttClick(i) {
  if (!tttActive || tttBoard[i]) return;
  tttBoard[i] = tttCurrent;
  tttRender();
  const winner = tttCheck();
  if (winner) return;
  tttCurrent = tttCurrent === 'X' ? 'O' : 'X';
  document.getElementById('ttt-status').textContent = `Player ${tttCurrent}'s turn`;
  if (tttMode === 'ai' && tttCurrent === 'O' && tttActive) {
    setTimeout(tttAiMove, 380);
  }
}

function tttAiMove() {
  const move = tttBestMove();
  if (move !== -1) {
    tttBoard[move] = 'O';
    tttRender();
    const winner = tttCheck();
    if (!winner) {
      tttCurrent = 'X';
      document.getElementById('ttt-status').textContent = `Player X's turn`;
    }
  }
}

function tttBestMove() {
  // Try to win
  for (let combo of tttWins) {
    const [a, b, c] = combo;
    const vals = [tttBoard[a], tttBoard[b], tttBoard[c]];
    if (vals.filter(v => v === 'O').length === 2 && vals.includes('')) {
      return combo[vals.indexOf('')];
    }
  }
  // Block player
  for (let combo of tttWins) {
    const [a, b, c] = combo;
    const vals = [tttBoard[a], tttBoard[b], tttBoard[c]];
    if (vals.filter(v => v === 'X').length === 2 && vals.includes('')) {
      return combo[vals.indexOf('')];
    }
  }
  // Take center
  if (!tttBoard[4]) return 4;
  // Take random empty
  const empty = tttBoard.map((v, i) => v ? -1 : i).filter(i => i >= 0);
  return empty.length ? empty[Math.floor(Math.random() * empty.length)] : -1;
}

function tttCheck() {
  for (let combo of tttWins) {
    const [a, b, c] = combo;
    if (tttBoard[a] && tttBoard[a] === tttBoard[b] && tttBoard[b] === tttBoard[c]) {
      tttActive = false;
      document.getElementById('ttt-status').textContent =
        tttMode === 'ai' && tttBoard[a] === 'O' ? 'CPU WINS! 🤖' : `Player ${tttBoard[a]} WINS! 🎉`;
      [a, b, c].forEach(idx => document.querySelectorAll('.ttt-cell')[idx].classList.add('win'));
      if (tttBoard[a] === 'X' || tttMode === '2p') {
        addScore('ttt', 10);
        showToast('+ 10 XP !', 'var(--neon-cyan)');
      }
      return true;
    }
  }
  if (!tttBoard.includes('')) {
    tttActive = false;
    document.getElementById('ttt-status').textContent = "DRAW — WELL PLAYED";
    addScore('ttt', 3);
    showToast('+ 3 XP — DRAW', 'var(--neon-yellow)');
    return true;
  }
  return false;
}

function tttReset() {
  tttBoard = Array(9).fill('');
  tttCurrent = 'X';
  tttActive = true;
  document.getElementById('ttt-status').textContent = `Player X's turn`;
  tttRender();
}

tttReset();

// =====================
// ROCK PAPER SCISSORS
// =====================
const rpsMap = { rock: '🪨', paper: '📄', scissors: '✂️' };
const rpsChoices = ['rock', 'paper', 'scissors'];
let rpsW = 0, rpsD = 0, rpsL = 0;

function rpsPlay(choice) {
  const cpu = rpsChoices[Math.floor(Math.random() * 3)];
  document.getElementById('rps-player').textContent = rpsMap[choice];
  document.getElementById('rps-cpu').textContent = rpsMap[cpu];

  // Refresh animation
  ['rps-player', 'rps-cpu'].forEach(id => {
    const el = document.getElementById(id);
    el.style.animation = 'none';
    el.offsetHeight; // reflow
    el.style.animation = '';
  });

  let result, msg, pts = 0;
  if (choice === cpu) {
    result = 'd'; msg = "DRAW — EQUAL FORCES"; pts = 2;
  } else if (
    (choice === 'rock' && cpu === 'scissors') ||
    (choice === 'paper' && cpu === 'rock') ||
    (choice === 'scissors' && cpu === 'paper')
  ) {
    result = 'w'; msg = "YOU WIN! 🏆"; pts = 10;
  } else {
    result = 'l'; msg = "CPU WINS — TRY AGAIN"; pts = 0;
  }

  if (result === 'w') { rpsW++; document.getElementById('rps-w').textContent = rpsW; }
  else if (result === 'd') { rpsD++; document.getElementById('rps-d').textContent = rpsD; }
  else { rpsL++; document.getElementById('rps-l').textContent = rpsL; }

  document.getElementById('rps-status').textContent = msg;
  if (pts > 0) {
    addScore('rps', pts);
    showToast(`+ ${pts} XP !`, result === 'w' ? 'var(--neon-green)' : 'var(--neon-yellow)');
  }
}

function rpsReset() {
  rpsW = rpsD = rpsL = 0;
  ['rps-w', 'rps-d', 'rps-l'].forEach(id => document.getElementById(id).textContent = 0);
  document.getElementById('rps-player').textContent = '🤔';
  document.getElementById('rps-cpu').textContent = '🤖';
  document.getElementById('rps-status').textContent = 'Choose your weapon!';
}

// =====================
// MEMORY GAME
// =====================
const memEmojis = ['🔮', '⚡', '💎', '🌀', '🎯', '🔥', '🌊', '🍀'];
let memCards = [], memFlipped = [], memMatched = 0, memMoves = 0;
let memTimer = null, memSeconds = 0, memLocked = false;

function memReset() {
  clearInterval(memTimer);
  memSeconds = 0; memMoves = 0; memMatched = 0; memLocked = false;
  document.getElementById('mem-moves').textContent = 0;
  document.getElementById('mem-pairs').textContent = 0;
  document.getElementById('mem-time').textContent = '0s';

  const deck = [...memEmojis, ...memEmojis].sort(() => Math.random() - 0.5);
  memCards = deck.map((emoji, i) => ({ id: i, emoji, flipped: false, matched: false }));
  memFlipped = [];
  memRender();
}

function memRender() {
  const board = document.getElementById('mem-board');
  board.innerHTML = '';
  memCards.forEach((card, i) => {
    const el = document.createElement('div');
    el.className = 'mem-card' + (card.flipped ? ' flipped' : '') + (card.matched ? ' matched' : '');
    el.innerHTML = `<div class="mem-inner"><div class="mem-back"></div><div class="mem-front">${card.emoji}</div></div>`;
    el.onclick = () => memClick(i);
    board.appendChild(el);
  });
}

function memClick(i) {
  if (memLocked || memCards[i].matched || memCards[i].flipped) return;

  // Start timer on first click
  if (memMoves === 0 && memFlipped.length === 0) {
    memTimer = setInterval(() => {
      memSeconds++;
      document.getElementById('mem-time').textContent = memSeconds + 's';
    }, 1000);
  }

  memCards[i].flipped = true;
  memFlipped.push(i);
  memRender();

  if (memFlipped.length === 2) {
    memMoves++;
    document.getElementById('mem-moves').textContent = memMoves;
    memLocked = true;
    const [a, b] = memFlipped;
    if (memCards[a].emoji === memCards[b].emoji) {
      memCards[a].matched = memCards[b].matched = true;
      memMatched++;
      document.getElementById('mem-pairs').textContent = memMatched;
      memFlipped = [];
      memLocked = false;
      memRender();
      if (memMatched === 8) {
        clearInterval(memTimer);
        const pts = Math.max(5, 100 - memMoves * 3);
        addScore('mem', pts);
        setTimeout(() => showToast(`COMPLETE! +${pts} XP 🎉`, 'var(--neon-green)'), 200);
      }
    } else {
      setTimeout(() => {
        memCards[a].flipped = memCards[b].flipped = false;
        memFlipped = [];
        memLocked = false;
        memRender();
      }, 900);
    }
  }
}

memReset();
