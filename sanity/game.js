// ============================================================
//  BLINDSPOT CTF — Puzzle Game Logic
// ============================================================

// Game State
let gridSize = 5;
let tiles = [];        // Current board state: tiles[position] = tileId
let moves = 0;
let secondsElapsed = 0;
let timerInterval = null;
let isPlaying = false;
let soundEnabled = true;
let showNumbers = false;
let selectedTileIndex = null;  // click-to-swap state
let gameWon = false;           // guard so victory fires only once

// Tiles that are visually pure-black (avg luminance < 5) — confirmed by pixel analysis of puzzle.png
// For this 5x5 grid:
//   Tile 0  (r0,c0): 0.18  — pure black corner
//   Tile 4  (r0,c4): 0.36  — pure black corner
//   Tile 5  (r1,c0): 0.17  — pure black left edge
//   Tile 9  (r1,c4): 0.37  — pure black right edge
//   Tile 20 (r4,c0): 2.46  — nearly black corner
//   Tile 24 (r4,c4): 3.14  — nearly black corner
// These tiles are interchangeable in the win check.
const DARK_TILES = new Set([0, 4, 5, 9, 20, 24]);

// ── Web Audio Synth ──────────────────────────────────────────
let audioCtx = null;

function playSound(type) {
  if (!soundEnabled) return;
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const now = audioCtx.currentTime;

    if (type === 'victory') {
      // Arpeggio fanfare
      [261.63, 329.63, 392.00, 523.25].forEach((freq, i) => {
        const o = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        o.connect(g); g.connect(audioCtx.destination);
        o.type = 'sine';
        o.frequency.setValueAtTime(freq, now + i * 0.12);
        g.gain.setValueAtTime(0.18, now + i * 0.12);
        g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.5);
        o.start(now + i * 0.12);
        o.stop(now + i * 0.12 + 0.55);
      });
      return;
    }

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain); gain.connect(audioCtx.destination);

    if (type === 'select') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(900, now + 0.08);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
      osc.start(now); osc.stop(now + 0.08);
    } else if (type === 'swap') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.15);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
      osc.start(now); osc.stop(now + 0.15);
    } else {
      // 'click'
      osc.type = 'sine';
      osc.frequency.setValueAtTime(300, now);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      osc.start(now); osc.stop(now + 0.04);
    }
  } catch (e) {
    // Audio not critical — silent fail
  }
}

// ── Particle Celebration ─────────────────────────────────────
const celebCanvas = document.getElementById('victory-canvas');
const celebCtx = celebCanvas.getContext('2d');
let particles = [];
let confettiId = null;

function resizeCanvas() {
  celebCanvas.width = window.innerWidth;
  celebCanvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

class Particle {
  constructor(x, y) {
    this.x = x; this.y = y;
    this.size = Math.random() * 8 + 4;
    this.vx = Math.random() * 12 - 6;
    this.vy = Math.random() * -14 - 4;
    this.gravity = 0.38;
    this.alpha = 1;
    this.rot = Math.random() * 360;
    this.rotV = Math.random() * 10 - 5;
    this.isDigit = Math.random() > 0.5;
    const palette = ['#a855f7','#c77dff','#ff007f','#00ffff','#ffffff','#00ff66'];
    this.color = palette[Math.floor(Math.random() * palette.length)];
  }
  update() {
    this.vy += this.gravity;
    this.x += this.vx; this.y += this.vy;
    this.rot += this.rotV;
    this.alpha -= 0.014;
  }
  draw() {
    celebCtx.save();
    celebCtx.globalAlpha = Math.max(0, this.alpha);
    celebCtx.translate(this.x, this.y);
    celebCtx.rotate(this.rot * Math.PI / 180);
    celebCtx.fillStyle = this.color;
    celebCtx.shadowBlur = 8; celebCtx.shadowColor = this.color;
    if (this.isDigit) {
      celebCtx.font = `${this.size + 4}px monospace`;
      celebCtx.fillText(Math.random() > 0.5 ? '1' : '0', 0, 0);
    } else {
      celebCtx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size * 1.6);
    }
    celebCtx.restore();
  }
}

function startCelebration() {
  particles = [];
  const cx = window.innerWidth / 2, cy = window.innerHeight * 0.55;
  for (let i = 0; i < 200; i++) particles.push(new Particle(cx, cy));

  const spawnId = setInterval(() => {
    if (particles.length < 350) {
      particles.push(new Particle(Math.random() * window.innerWidth, window.innerHeight));
    }
  }, 80);
  setTimeout(() => clearInterval(spawnId), 6000);

  function animate() {
    celebCtx.clearRect(0, 0, celebCanvas.width, celebCanvas.height);
    particles = particles.filter(p => p.alpha > 0);
    particles.forEach(p => { p.update(); p.draw(); });
    confettiId = requestAnimationFrame(animate);
  }
  animate();
}

function stopCelebration() {
  if (confettiId) { cancelAnimationFrame(confettiId); confettiId = null; }
  celebCtx.clearRect(0, 0, celebCanvas.width, celebCanvas.height);
}

// ── Board Setup ───────────────────────────────────────────────
const board = document.getElementById('puzzle-board');

function initGame() {
  stopCelebration();
  gameWon = false;
  moves = 0;
  secondsElapsed = 0;
  selectedTileIndex = null;

  document.getElementById('moves').textContent = '0';
  document.getElementById('timer').textContent = '00:00';
  document.getElementById('victory-modal').classList.remove('show');

  clearInterval(timerInterval);
  timerInterval = null;
  isPlaying = false;

  // Build a solved order then shuffle until it differs from solved
  const total = gridSize * gridSize;
  do {
    tiles = Array.from({ length: total }, (_, i) => i);
    for (let i = tiles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
    }
  } while (isSolved());

  renderBoard();
}

// ── Rendering ─────────────────────────────────────────────────
function renderBoard() {
  board.innerHTML = '';
  board.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
  board.style.gridTemplateRows    = `repeat(${gridSize}, 1fr)`;
  board.classList.toggle('show-numbers', showNumbers);

  tiles.forEach((tileId, position) => {
    const tile = document.createElement('div');
    tile.className = 'puzzle-tile';
    tile.dataset.index = position;
    tile.draggable = true;

    const col = tileId % gridSize;
    const row = Math.floor(tileId / gridSize);
    const factor = gridSize - 1;

    tile.style.backgroundImage    = "url('puzzle.png')";
    tile.style.backgroundSize     = `${gridSize * 100}% ${gridSize * 100}%`;
    tile.style.backgroundPosition = factor === 0
      ? '0% 0%'
      : `${(col / factor) * 100}% ${(row / factor) * 100}%`;

    if (selectedTileIndex === position) tile.classList.add('selected');

    const num = document.createElement('span');
    num.className = 'tile-number';
    num.textContent = tileId + 1;
    tile.appendChild(num);

    tile.addEventListener('dragstart',  handleDragStart);
    tile.addEventListener('dragover',   handleDragOver);
    tile.addEventListener('dragenter',  handleDragEnter);
    tile.addEventListener('dragleave',  handleDragLeave);
    tile.addEventListener('drop',       handleDrop);
    tile.addEventListener('dragend',    handleDragEnd);
    tile.addEventListener('click',      handleTileClick);

    board.appendChild(tile);
  });
}

// ── Timer ─────────────────────────────────────────────────────
function startTimer() {
  if (isPlaying) return;
  isPlaying = true;
  timerInterval = setInterval(() => {
    secondsElapsed++;
    const m = String(Math.floor(secondsElapsed / 60)).padStart(2, '0');
    const s = String(secondsElapsed % 60).padStart(2, '0');
    document.getElementById('timer').textContent = `${m}:${s}`;
  }, 1000);
}

// ── Drag & Drop ───────────────────────────────────────────────
let dragSrcIndex = null;

function handleDragStart(e) {
  dragSrcIndex = parseInt(this.dataset.index);
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', String(dragSrcIndex));
  this.classList.add('selected');
  playSound('select');
  startTimer();
}
function handleDragOver(e)  { e.preventDefault(); return false; }
function handleDragEnter()  { if (parseInt(this.dataset.index) !== dragSrcIndex) this.classList.add('hovered'); }
function handleDragLeave()  { this.classList.remove('hovered'); }
function handleDrop(e) {
  e.stopPropagation(); e.preventDefault();
  const src = parseInt(e.dataTransfer.getData('text/plain'));
  const dst = parseInt(this.dataset.index);
  if (src !== dst) swapTiles(src, dst);
  return false;
}
function handleDragEnd() {
  document.querySelectorAll('.puzzle-tile').forEach(t => t.classList.remove('selected','hovered'));
}

// ── Click-to-Swap ─────────────────────────────────────────────
function handleTileClick() {
  if (gameWon) return;
  startTimer();
  const idx = parseInt(this.dataset.index);
  if (selectedTileIndex === null) {
    selectedTileIndex = idx;
    playSound('select');
    renderBoard();
  } else if (selectedTileIndex === idx) {
    selectedTileIndex = null;
    playSound('click');
    renderBoard();
  } else {
    swapTiles(selectedTileIndex, idx);
    selectedTileIndex = null;
  }
}

// ── Core Swap ─────────────────────────────────────────────────
function swapTiles(i, j) {
  [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
  moves++;
  document.getElementById('moves').textContent = moves;
  playSound('swap');
  renderBoard();
  checkWin();
}

// ── Win Condition ─────────────────────────────────────────────
// A tile is in the correct position when tiles[position] === position
// A tile is "in place" if:
//   - It's a non-dark tile AND its tileId equals its position, OR
//   - It's a dark slot (position is dark) AND the tile sitting there is also dark
// This prevents the puzzle from being blocked by visually-identical black pieces.
function isSolved() {
  for (let pos = 0; pos < tiles.length; pos++) {
    const tileId = tiles[pos];
    if (DARK_TILES.has(pos)) {
      // Dark slot — just needs ANY dark tile
      if (!DARK_TILES.has(tileId)) return false;
    } else {
      // Visible slot — must be exact
      if (tileId !== pos) return false;
    }
  }
  return true;
}

function checkWin() {
  if (gameWon) return;
  if (isSolved()) triggerVictory();
}

function triggerVictory() {
  if (gameWon) return;     // prevent double-fire
  gameWon = true;

  clearInterval(timerInterval);
  isPlaying = false;

  playSound('victory');
  startCelebration();

  // Small delay so the board settles visually before the popup appears
  setTimeout(() => {
    document.getElementById('victory-modal').classList.add('show');
  }, 600);
}

// ── Bootstrap ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initGame();

  // Restart
  document.getElementById('restart-btn').addEventListener('click', () => {
    playSound('click');
    initGame();
  });

  // Sound toggle
  const soundBtn = document.getElementById('sound-btn');
  soundBtn.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    soundBtn.innerHTML = soundEnabled
      ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5zM15.54 8.46a5 5 0 0 1 0 7.07"/></svg> Sound On`
      : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v6H5v-6h4zm2 10v-7.18M21 15c0-1.78-1-3.27-2.5-4m-3.5-3.5V5l-5 4"/></svg> Sound Off`;
    if (soundEnabled) playSound('click');
  });

  // Number hints
  const hintBtn = document.getElementById('hint-btn');
  hintBtn.addEventListener('click', () => {
    showNumbers = !showNumbers;
    hintBtn.classList.toggle('active', showNumbers);
    playSound('click');
    renderBoard();
  });

  // Preview modal
  const previewBox   = document.getElementById('preview-box');
  const previewModal = document.getElementById('preview-modal');
  const closePreview = document.getElementById('close-preview-btn');

  previewBox.addEventListener('click', () => { playSound('click'); previewModal.classList.add('show'); });
  closePreview.addEventListener('click', () => { playSound('click'); previewModal.classList.remove('show'); });
  previewModal.addEventListener('click', e => {
    if (e.target === previewModal) { playSound('click'); previewModal.classList.remove('show'); }
  });

  // Copy flag
  const copyBtn  = document.getElementById('copy-flag-btn');
  const flagText = document.getElementById('flag-text').textContent.trim();
  const toast    = document.getElementById('copy-toast');

  copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(flagText)
      .then(() => {
        playSound('click');
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2000);
      })
      .catch(() => {
        // Fallback for browsers that block clipboard on file://
        const tmp = document.createElement('textarea');
        tmp.value = flagText;
        document.body.appendChild(tmp);
        tmp.select();
        document.execCommand('copy');
        document.body.removeChild(tmp);
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2000);
      });
  });

  // Play again
  document.getElementById('play-again-btn').addEventListener('click', () => {
    playSound('click');
    initGame();
  });

  // ── Easter Egg: click the subtitle 5× quickly to win instantly ──
  let eggCount = 0, eggTimer = null;
  const sub = document.querySelector('.logo-subtitle');
  if (sub) {
    sub.style.cursor = 'pointer';
    sub.addEventListener('click', () => {
      eggCount++;
      clearTimeout(eggTimer);
      eggTimer = setTimeout(() => { eggCount = 0; }, 3000);
      if (eggCount >= 5) {
        eggCount = 0;
        tiles = Array.from({ length: gridSize * gridSize }, (_, i) => i);
        renderBoard();
        checkWin();
      }
    });
  }
});
