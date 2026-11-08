const socket = io();

// DOM Elements
const lobbyScreen = document.getElementById('lobby-screen');
const waitingScreen = document.getElementById('waiting-screen');
const gameScreen = document.getElementById('game-screen');
const gameoverModal = document.getElementById('gameover-modal');

const nameInput = document.getElementById('player-name');
const roomCodeInput = document.getElementById('room-code-input');
const btnCreate = document.getElementById('btn-create');
const btnJoin = document.getElementById('btn-join');
const btnReady = document.getElementById('btn-ready');
const btnStart = document.getElementById('btn-start');

const displayRoomCode = document.getElementById('display-room-code');
const playerList = document.getElementById('player-list');
const gameTimer = document.getElementById('game-timer');

const qCounter = document.getElementById('q-counter');
const streakCounter = document.getElementById('streak-counter');
const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');

const attackPanel = document.getElementById('attack-panel');
const targetSelector = document.getElementById('target-selector');
const btnAttackWind = document.getElementById('btn-attack-wind');
const btnAttackQuake = document.getElementById('btn-attack-quake');

const canvas = document.getElementById('towerCanvas');
const ctx = canvas.getContext('2d');

// State Variables
let myPlayerId = null;
let currentRoomData = null;
let selectedTargetId = null;
let isHost = false;

// Event Listeners - Lobby
btnCreate.addEventListener('click', () => {
  const name = nameInput.value.trim();
  if (!name) return alert('Masukkan nama Anda terlebih dahulu!');
  socket.emit('createRoom', name);
});

btnJoin.addEventListener('click', () => {
  const name = nameInput.value.trim();
  const roomCode = roomCodeInput.value.trim();
  if (!name || !roomCode) return alert('Isi Nama dan Kode Room!');
  socket.emit('joinRoom', { name, roomCode });
});

btnReady.addEventListener('click', () => {
  socket.emit('toggleReady');
});

btnStart.addEventListener('click', () => {
  socket.emit('startGame');
});

// Socket Listeners - Lobby
socket.on('roomCreated', ({ roomCode, player }) => {
  myPlayerId = player.id;
  isHost = true;
  displayRoomCode.textContent = roomCode;
  lobbyScreen.classList.add('hidden');
  waitingScreen.classList.remove('hidden');
  btnStart.classList.remove('hidden');
});

socket.on('roomJoined', ({ roomCode, player }) => {
  myPlayerId = player.id;
  isHost = false;
  displayRoomCode.textContent = roomCode;
  lobbyScreen.classList.add('hidden');
  waitingScreen.classList.remove('hidden');
});

socket.on('roomUpdate', (room) => {
  currentRoomData = room;
  playerList.innerHTML = '';
  
  Object.values(room.players).forEach(p => {
    const div = document.createElement('div');
    div.className = 'player-card';
    div.innerHTML = `
      <span>${p.name} ${p.id === room.hostId ? '👑 (Host)' : ''}</span>
      <span class="ready-status ${p.isReady ? 'ready' : ''}">${p.isReady ? 'READY' : 'NOT READY'}</span>
    `;
    playerList.appendChild(div);
  });
});

socket.on('errorMsg', (msg) => {
  alert(msg);
});

// Game Loop & Socket Listeners - Gameplay
socket.on('gameStarted', ({ players, timer }) => {
  waitingScreen.classList.add('hidden');
  gameScreen.classList.remove('hidden');
  gameTimer.textContent = timer;
  renderTowers(players);
});

socket.on('timerUpdate', (time) => {
  gameTimer.textContent = time;
});

socket.on('nextQuestion', (qData) => {
  if (!qData) return;
  qCounter.textContent = `Soal ${qData.qIndex}/${qData.total}`;
  questionText.textContent = qData.question;
  optionsContainer.innerHTML = '';

  qData.options.forEach((opt, idx) => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.textContent = `${String.fromCharCode(65 + idx)}. ${opt}`;
    btn.onclick = () => {
      socket.emit('submitAnswer', { answerIndex: idx });
      disableOptions();
    };
    optionsContainer.appendChild(btn);
  });
});

function disableOptions() {
  const buttons = optionsContainer.querySelectorAll('button');
  buttons.forEach(b => b.disabled = true);
}

socket.on('answerResult', ({ isCorrect, streak, canAttack }) => {
  streakCounter.textContent = `Streak: ${streak} 🔥`;
  
  if (!isCorrect) {
    // Shake animation effect for local screen
    gameScreen.classList.add('shake');
    setTimeout(() => gameScreen.classList.remove('shake'), 500);
  }

  if (canAttack) {
    showAttackPanel();
  } else {
    attackPanel.classList.add('hidden');
  }
});

socket.on('gameStateUpdate', ({ players }) => {
  renderTowers(players);
  updateAttackTargets(players);
});

socket.on('receiveEarthquake', ({ duration }) => {
  gameScreen.classList.add('shake');
  setTimeout(() => {
    gameScreen.classList.remove('shake');
  }, duration * 1000);
});

socket.on('attackNotification', ({ msg }) => {
  const banner = document.getElementById('attack-banner');
  banner.textContent = msg;
  banner.classList.remove('hidden');
  setTimeout(() => banner.classList.add('hidden'), 4000);
});

// Attack Controls
function showAttackPanel() {
  attackPanel.classList.remove('hidden');
  if (currentRoomData) {
    updateAttackTargets(currentRoomData.players);
  }
}

function updateAttackTargets(players) {
  targetSelector.innerHTML = '';
  Object.values(players).forEach(p => {
    if (p.id !== myPlayerId) {
      const btn = document.createElement('button');
      btn.className = `target-btn ${selectedTargetId === p.id ? 'selected' : ''}`;
      btn.textContent = p.name;
      btn.onclick = () => {
        selectedTargetId = p.id;
        updateAttackTargets(players);
      };
      targetSelector.appendChild(btn);
    }
  });
}

btnAttackWind.addEventListener('click', () => {
  if (!selectedTargetId) return alert('Pilih target lawan terlebih dahulu!');
  socket.emit('executeAttack', { targetId: selectedTargetId, attackType: 'whirlwind' });
  attackPanel.classList.add('hidden');
});

btnAttackQuake.addEventListener('click', () => {
  if (!selectedTargetId) return alert('Pilih target lawan terlebih dahulu!');
  socket.emit('executeAttack', { targetId: selectedTargetId, attackType: 'earthquake' });
  attackPanel.classList.add('hidden');
});

// Canvas Tower Rendering
function renderTowers(players) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Background Sky & Clouds
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const playerArray = Object.values(players);
  const count = playerArray.length;
  if (count === 0) return;

  const sectionWidth = canvas.width / count;
  const blockWidth = Math.min(60, sectionWidth - 30);
  const blockHeight = 18;

  playerArray.forEach((p, index) => {
    const centerX = (index * sectionWidth) + (sectionWidth / 2);
    const startY = canvas.height - 40;

    // Draw Ground/Cloud Base
    ctx.fillStyle = '#64748b';
    ctx.beginPath();
    ctx.arc(centerX, startY + 20, blockWidth, Math.PI, 0, false);
    ctx.fill();

    // Draw Blocks
    for (let i = 0; i < p.blocks; i++) {
      const yPos = startY - (i * (blockHeight + 2));

      // Alternate color style per player block
      ctx.fillStyle = p.id === myPlayerId ? '#38bdf8' : '#f59e0b';
      ctx.fillRect(centerX - blockWidth / 2, yPos, blockWidth, blockHeight);

      // Block outline & details
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2;
      ctx.strokeRect(centerX - blockWidth / 2, yPos, blockWidth, blockHeight);
    }

    // Draw Player Name Header
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${p.name} (${p.blocks} B)`, centerX, 25);
  });
}

// Game Over Handler
socket.on('gameOver', ({ leaderboard }) => {
  gameoverModal.classList.remove('hidden');
  const tbody = document.getElementById('leaderboard-body');
  tbody.innerHTML = '';

  leaderboard.forEach((p, rank) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>#${rank + 1}</td>
      <td>${p.name}</td>
      <td>${p.blocks} Blok</td>
      <td>${p.score} Poin</td>
    `;
    tbody.appendChild(tr);
  });
});