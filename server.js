const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

app.use(express.static('public'));

// Bank Soal Nuruddin Al-Raniri
const QUESTIONS = [
  { id: 1, question: "Nuruddin Bin Ali Al-Raniri berasal dari sebuah wilayah di India yang bernama...", options: ["Malabar", "Gujarat", "Bengal", "Kashmir", "Punjab"], answer: 1 },
  { id: 2, question: "Al-Raniri tiba di Aceh pada masa pemerintahan Sultan...", options: ["Sultan Iskandar Muda", "Sultan Iskandar Thani", "Sultan Ali Mughayat Syah", "Sultan Alauddin Riayat Syah", "Sultan Iskandar Johan"], answer: 1 },
  { id: 3, question: "Tahun kedatangan Nuruddin Al-Raniri ke Aceh adalah sekitar tahun...", options: ["1590 M", "1607 M", "1637 M", "1658 M", "1670 M"], answer: 2 },
  { id: 4, question: "Tokoh sufi dan sastrawan nusantara pendahulu yang ajaran wihdatul wujudnya dikritik keras oleh Al-Raniri adalah...", options: ["Hamzah Fansuri dan Syamsuddin al-Sumatrani", "Syaikh Yusuf al-Makasari", "Nuruddin Ar-Raniri sendiri", "Syekh Abdul Rauf al-Singkili", "Syekh Arsyad al-Banjari"], answer: 0 },
  { id: 5, question: "Aliran tasawuf yang dianut dan dibela oleh Nuruddin Al-Raniri adalah tasawuf yang berlandaskan pada...", options: ["Wihdatul Wujud", "Panteisme ekstrem", "Syariat Islam yang ortodoks (Sunni)", "Isyraqiyah murni", "Hululiyyah"], answer: 2 },
  { id: 6, question: "Karya monumentalnya yang memuat sejarah Kesultanan Aceh serta silsilah raja-raja Melayu berjudul...", options: ["Bustan al-Salatin", "Sabil al-Muhtadin", "Tuhfat al-Nafis", "Mirat al-Tullab", "Siyarus Salikin"], answer: 0 },
  { id: 7, question: "Di dalam struktur pemerintahan Kesultanan Aceh pada masa itu, jabatan penting apa yang pernah dijabat oleh Al-Raniri?", options: ["Perdana Menteri dan Panglima Perang", "Mufti Besar (Syaikh al-Islam) dan penasihat sultan", "Bendahara kerajaan", "Duta besar untuk Kesultanan Utsmaniyah", "Hakim agung perdagangan"], answer: 1 },
  { id: 8, question: "Kitab karya Al-Raniri yang membahas tentang akidah Ahlussunnah wal Jamaah dan kritikan terhadap ajaran sesat adalah...", options: ["Hidayat al-Habib", "Bustan al-Salatin", "Asrar al-Insan", "Raudhat al-Salatin", "Sharh al-Hikam"], answer: 3 },
  { id: 9, question: "Kitab Bustan al-Salatin (Taman para Raja-Raja) terdiri dari berapa bab atau fasal utama?", options: ["3 Bab", "5 Bab", "7 Bab", "10 Bab", "12 Bab"], answer: 2 },
  { id: 10, question: "Salah satu alasan utama Al-Raniri menentang pemikiran Hamzah Fansuri dan Syamsuddin al-Sumatrani adalah kekhawatirannya bahwa pemikiran tersebut dapat menyebabkan...", options: ["Kemunduran ekonomi kerajaan", "Perpecahan militer", "Kebingungan umat awam dalam memahami hubungan antara makhluk dan Khaliq", "Masuknya pengaruh bangsa Portugis", "Hilangnya tradisi lokal Aceh"], answer: 2 },
  { id: 11, question: "Selain sebagai ulama sufi dan sejarawan, Al-Raniri juga dikenal sebagai seorang...", options: ["Arsitek istana Aceh", "Sastrawan bahasa Melayu yang prolifik", "Pelaut handal Samudera Hindia", "Ahli astronomi modern barat", "Panglima angkatan laut Aceh"], answer: 1 },
  { id: 12, question: "Dalam bidang fikih, mazhab apa yang dipegang teguh dan diajarkan oleh Nuruddin Al-Raniri?", options: ["Mazhab Hanafi", "Mazhab Maliki", "Mazhab Syafi'i", "Mazhab Hanbali", "Mazhab Ja'fari"], answer: 2 },
  { id: 13, question: "Mengapa Al-Raniri akhirnya memutuskan untuk meninggalkan Aceh kembali ke tanah kelahirannya (Ranir, Gujarat) pada tahun 1643 M?", options: ["Karena diusir oleh Sultan Iskandar Muda", "Karena situasi politik dan perdebatan sengit dengan pengikut aliran wujudiyah (seperti Saif al-Rijal)", "Karena diangkat menjadi Raja di Gujarat", "Karena ingin menyebarkan Islam ke pulau Jawa", "Karena sakit keras"], answer: 1 },
  { id: 14, question: "Kitab fikih karya Al-Raniri yang menjadi rujukan penting dalam bidang hukum Islam di Nusantara adalah...", options: ["Shirath al-Mustaqim", "Dar al-Faraid", "Bustan al-Salatin Bab IV", "Fath al-Mubin", "Mirat al-Tullab"], answer: 1 },
  { id: 15, question: "Kitab Akhbar al-Akhirat karya Al-Raniri membahas tentang hal-hal yang berkaitan dengan...", options: ["Hukum perdata Islam", "Tata cara pemerintahan yang baik", "Kehidupan sesudah mati (akhirat)", "Ilmu falak dan perbintangan", "Tata bahasa Arab-Melayu"], answer: 2 },
  { id: 16, question: "Pengaruh ajaran Al-Raniri di Aceh berhasil mengembalikan orientasi keagamaan masyarakat kepada paham teologi...", options: ["Mu'tazilah", "Asy'ariyah dan Maturidiyah (Ahlussunnah wal Jamaah)", "Syiah Rafidilah", "Jabariyah ekstrem", "Khawarij"], answer: 1 },
  { id: 17, question: "Tokoh ulama besar penerus di Aceh yang kemudian meredakan ketegangan intelektual pasca-era Al-Raniri dan bersikap lebih moderat adalah...", options: ["Syekh Nuruddin Al-Raniri sendiri", "Syekh Hamzah Fansuri", "Syekh Abdul Rauf al-Singkili", "Syekh Yusuf Al-Makasari", "Syaikh Arsyad al-Banjari"], answer: 2 },
  { id: 18, question: "Di bawah ini yang bukan merupakan karya dari Nuruddin Al-Raniri adalah...", options: ["Bustan al-Salatin", "Sabil al-Muhtadin", "Assirath al-Mustaqim", "Hidayat al-Habib", "Nur al-Dhalim"], answer: 1 },
  { id: 19, question: "Bahasa utama yang digunakan oleh Nuruddin Al-Raniri dalam menulis sebagian besar kitab-kitabnya untuk masyarakat Nusantara adalah...", options: ["Bahasa Arab", "Bahasa Persia", "Bahasa Melayu (beraksara Arab/Jawi)", "Bahasa Gujarat", "Bahasa Aceh kuno"], answer: 2 },
  { id: 20, question: "Nuruddin Al-Raniri wafat pada tahun...", options: ["1595 M", "1630 M", "1658 M", "1700 M", "1725 M"], answer: 2 }
];

const rooms = {};

function generateRoomCode() {
  let code;
  do {
    code = Math.floor(100000 + Math.random() * 900000).toString();
  } while (rooms[code]);
  return code;
}

function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

io.on('connection', (socket) => {
  let currentRoom = null;

  socket.on('createRoom', (name) => {
    const roomCode = generateRoomCode();
    currentRoom = roomCode;
    socket.join(roomCode);

    rooms[roomCode] = {
      code: roomCode,
      hostId: socket.id,
      gameStarted: false,
      timer: 180,
      intervalId: null,
      questions: shuffleArray(QUESTIONS),
      players: {
        [socket.id]: {
          id: socket.id,
          name: name || "Host",
          isReady: false,
          blocks: 0,
          score: 0,
          streak: 0,
          canAttack: false,
          currentQuestionIdx: 0
        }
      }
    };

    socket.emit('roomCreated', { roomCode, player: rooms[roomCode].players[socket.id] });
    io.to(roomCode).emit('roomUpdate', rooms[roomCode]);
  });

  socket.on('joinRoom', ({ name, roomCode }) => {
    const room = rooms[roomCode];
    if (!room) {
      return socket.emit('errorMsg', 'Kode Room tidak ditemukan!');
    }
    if (Object.keys(room.players).length >= 4) {
      return socket.emit('errorMsg', 'Room sudah penuh (Maksimal 4 Pemain)!');
    }
    if (room.gameStarted) {
      return socket.emit('errorMsg', 'Permainan di room ini sudah berlangsung!');
    }

    currentRoom = roomCode;
    socket.join(roomCode);

    room.players[socket.id] = {
      id: socket.id,
      name: name || `Pemain ${Object.keys(room.players).length + 1}`,
      isReady: false,
      blocks: 0,
      score: 0,
      streak: 0,
      canAttack: false,
      currentQuestionIdx: 0
    };

    socket.emit('roomJoined', { roomCode, player: room.players[socket.id] });
    io.to(roomCode).emit('roomUpdate', room);
  });

  socket.on('toggleReady', () => {
    if (!currentRoom || !rooms[currentRoom]) return;
    const room = rooms[currentRoom];
    if (room.players[socket.id]) {
      room.players[socket.id].isReady = !room.players[socket.id].isReady;
      io.to(currentRoom).emit('roomUpdate', room);
    }
  });

  socket.on('startGame', () => {
    if (!currentRoom || !rooms[currentRoom]) return;
    const room = rooms[currentRoom];
    if (room.hostId !== socket.id) return;

    room.gameStarted = true;
    io.to(currentRoom).emit('gameStarted', {
      players: room.players,
      timer: room.timer
    });

    // Send initial question to all players
    Object.keys(room.players).forEach(pId => {
      io.to(pId).emit('nextQuestion', getSanitizedQuestion(room, pId));
    });

    // Start Timer
    room.intervalId = setInterval(() => {
      room.timer--;
      io.to(currentRoom).emit('timerUpdate', room.timer);

      if (room.timer <= 0) {
        endGame(currentRoom);
      }
    }, 1000);
  });

  socket.on('submitAnswer', ({ answerIndex }) => {
    if (!currentRoom || !rooms[currentRoom]) return;
    const room = rooms[currentRoom];
    const player = room.players[socket.id];
    if (!player || !room.gameStarted) return;

    const qIdx = player.currentQuestionIdx;
    const currentQ = room.questions[qIdx];
    if (!currentQ) return;

    const isCorrect = currentQ.answer === answerIndex;

    if (isCorrect) {
      player.blocks += 1;
      player.score += 100 + (player.streak * 20);
      player.streak += 1;
      if (player.streak >= 3) {
        player.canAttack = true;
      }
    } else {
      player.streak = 0;
    }

    player.currentQuestionIdx += 1;

    // Send answer result back to socket owner
    socket.emit('answerResult', {
      isCorrect,
      blocks: player.blocks,
      score: player.score,
      streak: player.streak,
      canAttack: player.canAttack
    });

    // Broadcast updated state to all room players
    io.to(currentRoom).emit('gameStateUpdate', { players: room.players });

    // Check if player exhausted questions or next question
    if (player.currentQuestionIdx < room.questions.length) {
      socket.emit('nextQuestion', getSanitizedQuestion(room, socket.id));
    } else {
      socket.emit('noMoreQuestions');
    }
  });

  socket.on('executeAttack', ({ targetId, attackType }) => {
    if (!currentRoom || !rooms[currentRoom]) return;
    const room = rooms[currentRoom];
    const attacker = room.players[socket.id];
    const target = room.players[targetId];

    if (!attacker || !target || !attacker.canAttack) return;

    attacker.canAttack = false;
    attacker.streak = 0;

    if (attackType === 'whirlwind') {
      target.blocks = Math.max(0, target.blocks - 1);
      io.to(currentRoom).emit('attackNotification', {
        attackerName: attacker.name,
        targetName: target.name,
        type: 'whirlwind',
        msg: `${attacker.name} meluncurkan Angin Puyuh! Menara ${target.name} berkurang 1 blok.`
      });
    } else if (attackType === 'earthquake') {
      io.to(targetId).emit('receiveEarthquake', { duration: 5 });
      io.to(currentRoom).emit('attackNotification', {
        attackerName: attacker.name,
        targetName: target.name,
        type: 'earthquake',
        msg: `${attacker.name} memicu Gempa Bumi pada ${target.name}!`
      });
    }

    io.to(currentRoom).emit('gameStateUpdate', { players: room.players });
  });

  socket.on('disconnect', () => {
    if (!currentRoom || !rooms[currentRoom]) return;
    const room = rooms[currentRoom];
    delete room.players[socket.id];

    if (Object.keys(room.players).length === 0) {
      if (room.intervalId) clearInterval(room.intervalId);
      delete rooms[currentRoom];
    } else {
      if (room.hostId === socket.id) {
        room.hostId = Object.keys(room.players)[0];
      }
      io.to(currentRoom).emit('roomUpdate', room);
    }
  });
});

function getSanitizedQuestion(room, playerId) {
  const player = room.players[playerId];
  const q = room.questions[player.currentQuestionIdx];
  if (!q) return null;
  return {
    qIndex: player.currentQuestionIdx + 1,
    total: room.questions.length,
    question: q.question,
    options: q.options
  };
}

function endGame(roomCode) {
  const room = rooms[roomCode];
  if (!room) return;

  if (room.intervalId) clearInterval(room.intervalId);
  room.gameStarted = false;

  const leaderboard = Object.values(room.players).sort((a, b) => {
    if (b.blocks === a.blocks) {
      return b.score - a.score;
    }
    return b.blocks - a.blocks;
  });

  io.to(roomCode).emit('gameOver', { leaderboard });
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server Sky High Quiz berjalan di port ${PORT}`);
});