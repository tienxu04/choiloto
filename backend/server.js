const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());
app.use(express.json());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// FPT.AI TTS Configuration
const FPT_API_KEY = process.env.FPT_API_KEY || 'lbYHcaepiyxj0hUfQ5ZB9jNysTgOyhMQ';
const FPT_TTS_URL = 'https://api.fpt.ai/hmi/tts/v5';
const FPT_VOICE = 'minhquang';

// Game data
const tickets = {
  "tickets": [
    {
      "id": 1,
      "color": "yellow",
      "grid": [
        [0, 14, 28, 0, 0, 50, 0, 75, 90],
        [0, 19, 0, 31, 49, 0, 68, 0, 81],
        [5, 0, 20, 0, 47, 0, 0, 77, 84],
        [0, 12, 0, 38, 0, 55, 69, 0, 89],
        [1, 0, 0, 36, 41, 0, 66, 71, 0],
        [0, 18, 26, 0, 0, 57, 0, 70, 88],
        [8, 0, 25, 33, 0, 52, 62, 0, 0],
        [9, 0, 0, 35, 46, 0, 60, 73, 0],
        [0, 10, 27, 0, 48, 59, 0, 0, 86]
      ]
    },
    {
      "id": 2,
      "color": "yellow",
      "grid": [
        [0, 15, 24, 0, 44, 0, 64, 79, 0],
        [4, 0, 29, 30, 0, 51, 0, 76, 0],
        [0, 17, 0, 32, 0, 53, 63, 0, 80],
        [7, 0, 23, 0, 0, 56, 61, 0, 85],
        [0, 11, 0, 34, 42, 0, 0, 72, 87],
        [3, 13, 0, 0, 45, 54, 0, 74, 0],
        [0, 16, 21, 0, 43, 58, 0, 78, 0],
        [6, 0, 0, 37, 40, 0, 65, 0, 82],
        [2, 0, 22, 39, 0, 0, 67, 0, 83]
      ]
    }
  ]
};

// Game state
let gameState = {
  started: false,
  dealerTicketId: null,
  playerTicketId: null,
  calledNumbers: [],
  availableNumbers: Array.from({ length: 90 }, (_, i) => i + 1),
  currentNumber: null,
  dealerMarked: {},
  playerMarked: {},
  phraseIndex: 0,
  winner: null
};

const phrases = [
  "Con số gì đây",
  "Số gì đây số gì đây", 
  "Con số tiếp theo là"
];

// Helper: Convert number to Vietnamese speech
function numberToVietnamese(num) {
  if (num >= 1 && num <= 9) {
    const ones = ['một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
    return `Số ${ones[num - 1]}`;
  }
  
  const ones = ['', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
  const tens = ['', 'mười', 'hai mươi', 'ba mươi', 'bốn mươi', 'năm mươi', 'sáu mươi', 'bảy mươi', 'tám mươi', 'chín mươi'];
  
  const ten = Math.floor(num / 10);
  const one = num % 10;
  
  let result = 'Số ';
  
  if (ten === 1) {
    result += 'mười';
    if (one === 5) result += ' lăm';
    else if (one > 0) result += ' ' + ones[one];
  } else {
    result += tens[ten];
    if (one === 1 && ten > 1) result += ' mốt';
    else if (one === 5 && ten > 1) result += ' lăm';
    else if (one > 0) result += ' ' + ones[one];
  }
  
  return result;
}

// Helper: Check if a row has 5 marked numbers
function checkRowWin(grid, markedNumbers) {
  for (let row of grid) {
    const rowNumbers = row.filter(n => n > 0);
    if (rowNumbers.length === 5) {
      const allMarked = rowNumbers.every(n => markedNumbers[n]);
      if (allMarked) return true;
    }
  }
  return false;
}

// Helper: Auto-mark dealer's ticket
function autoMarkDealer(number) {
  const dealerTicket = tickets.tickets.find(t => t.id === gameState.dealerTicketId);
  if (!dealerTicket) return;
  
  for (let row of dealerTicket.grid) {
    if (row.includes(number)) {
      gameState.dealerMarked[number] = true;
      break;
    }
  }
}

// Helper: Call FPT.AI TTS to generate audio
async function generateTTSAudio(text) {
  try {
    const response = await fetch(FPT_TTS_URL, {
      method: 'POST',
      headers: {
        'api-key': FPT_API_KEY,
        'speed': '',
        'voice': FPT_VOICE
      },
      body: text
    });
    
    if (!response.ok) {
      console.error('FPT.AI TTS error:', response.status);
      return null;
    }
    
    const audioBuffer = await response.buffer();
    const base64Audio = audioBuffer.toString('base64');
    return `data:audio/mp3;base64,${base64Audio}`;
  } catch (error) {
    console.error('FPT.AI TTS error:', error);
    return null;
  }
}

// Socket.io connection
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  // Send current game state
  socket.emit('gameState', gameState);
  
  // Start game
  socket.on('startGame', (playerTicketId) => {
    // Reset game
    gameState = {
      started: true,
      playerTicketId: playerTicketId,
      dealerTicketId: playerTicketId === 1 ? 2 : 1, // Pick the other ticket
      calledNumbers: [],
      availableNumbers: Array.from({ length: 90 }, (_, i) => i + 1),
      currentNumber: null,
      dealerMarked: {},
      playerMarked: {},
      phraseIndex: 0,
      winner: null
    };
    
    io.emit('gameState', gameState);
    io.emit('gameStarted', {
      playerTicketId: gameState.playerTicketId,
      dealerTicketId: gameState.dealerTicketId
    });
  });
  
  // Call next number
  socket.on('callNext', async () => {
    if (!gameState.started || gameState.winner) return;
    
    if (gameState.availableNumbers.length === 0) {
      io.emit('gameOver', { message: 'Hết số rồi!' });
      return;
    }
    
    // Get random number
    const randomIndex = Math.floor(Math.random() * gameState.availableNumbers.length);
    const number = gameState.availableNumbers[randomIndex];
    
    // Remove from available
    gameState.availableNumbers.splice(randomIndex, 1);
    gameState.calledNumbers.push(number);
    gameState.currentNumber = number;
    
    // Get phrase (take turn)
    const phrase = phrases[gameState.phraseIndex];
    gameState.phraseIndex = (gameState.phraseIndex + 1) % 3;
    
    // Generate audio for phrase
    const phraseAudio = await generateTTSAudio(phrase);
    
    // Generate audio for number
    const vietnameseNumber = numberToVietnamese(number);
    const numberAudio = await generateTTSAudio(vietnameseNumber);
    
    // Auto-mark dealer
    autoMarkDealer(number);
    
    // Emit number call FIRST so UI updates
    io.emit('numberCalled', {
      phrase: phrase,
      phraseAudio: phraseAudio,
      number: number,
      vietnamese: vietnameseNumber,
      numberAudio: numberAudio,
      calledNumbers: gameState.calledNumbers,
      dealerMarked: gameState.dealerMarked
    });
    
    io.emit('gameState', gameState);
    
    // Check dealer win AFTER a short delay to let UI update
    setTimeout(() => {
      const dealerTicket = tickets.tickets.find(t => t.id === gameState.dealerTicketId);
      if (checkRowWin(dealerTicket.grid, gameState.dealerMarked)) {
        gameState.winner = 'dealer';
        io.emit('gameWon', { winner: 'dealer', message: 'Nhà cái thắng!' });
      }
    }, 1500); // 1.5s delay to let UI render the marked number
  });
  
  // Player marks number
  socket.on('markNumber', (number) => {
    if (!gameState.started || gameState.winner) return;
    
    gameState.playerMarked[number] = true;
    
    // Emit marked first so UI updates
    io.emit('playerMarked', { number, playerMarked: gameState.playerMarked });
    
    // Check player win AFTER a short delay to let UI update
    setTimeout(() => {
      const playerTicket = tickets.tickets.find(t => t.id === gameState.playerTicketId);
      if (checkRowWin(playerTicket.grid, gameState.playerMarked)) {
        gameState.winner = 'player';
        io.emit('gameWon', { winner: 'player', message: 'Người chơi thắng!' });
      }
    }, 800); // 0.8s delay
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// REST API endpoints
app.get('/api/tickets', (req, res) => {
  res.json(tickets);
});

app.get('/api/game-state', (req, res) => {
  res.json(gameState);
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
