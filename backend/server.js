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
const FPT_API_KEY = process.env.FPT_API_KEY;
const FPT_TTS_URL = 'https://api.fpt.ai/hmi/tts/v5';
const FPT_VOICE = 'minhquang';

// Check if API key is set
if (!FPT_API_KEY) {
  console.error('ERROR: FPT_API_KEY environment variable is not set!');
  console.error('Please set it on Render.com: Dashboard → Environment → Add Variable');
  process.exit(1);
}

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
    },
    {
      "id": 3,
      "color": "red",
      "grid": [
        [1, 0, 20, 0, 40, 50, 0, 70, 0],
        [0, 12, 0, 31, 0, 52, 60, 0, 81],
        [3, 0, 24, 33, 44, 0, 0, 0, 83],
        [0, 15, 0, 0, 46, 55, 62, 73, 0],
        [5, 17, 26, 36, 0, 0, 65, 0, 0],
        [0, 0, 28, 0, 48, 57, 0, 76, 88],
        [7, 19, 0, 38, 0, 0, 67, 78, 0],
        [0, 0, 29, 39, 49, 59, 0, 0, 89],
        [9, 11, 0, 0, 0, 0, 69, 79, 90]
      ]
    },
    {
      "id": 4,
      "color": "red",
      "grid": [
        [0, 10, 0, 30, 0, 51, 61, 0, 80],
        [2, 0, 21, 0, 41, 0, 0, 71, 82],
        [0, 13, 22, 0, 42, 53, 63, 0, 0],
        [4, 0, 23, 32, 0, 0, 0, 72, 84],
        [0, 14, 0, 34, 43, 54, 0, 74, 0],
        [6, 16, 25, 35, 0, 0, 64, 0, 0],
        [0, 18, 0, 0, 45, 56, 66, 0, 85],
        [8, 0, 27, 37, 0, 58, 0, 75, 0],
        [0, 0, 0, 0, 47, 0, 68, 77, 86]
      ]
    },
    {
      "id": 5,
      "color": "blue",
      "grid": [
        [8, 0, 0, 31, 44, 0, 62, 0, 85],
        [0, 14, 25, 0, 0, 53, 0, 77, 81],
        [3, 0, 29, 36, 40, 50, 0, 0, 0],
        [0, 11, 0, 39, 47, 0, 68, 72, 0],
        [5, 18, 22, 0, 0, 56, 60, 0, 0],
        [0, 0, 27, 34, 49, 0, 0, 75, 88],
        [9, 13, 0, 0, 42, 59, 64, 0, 0],
        [0, 16, 0, 38, 0, 0, 66, 70, 83],
        [2, 0, 20, 0, 0, 51, 0, 79, 90]
      ]
    },
    {
      "id": 6,
      "color": "blue",
      "grid": [
        [0, 10, 21, 0, 41, 52, 0, 71, 0],
        [1, 0, 0, 30, 43, 0, 61, 0, 80],
        [0, 12, 23, 0, 0, 54, 63, 73, 0],
        [4, 0, 24, 32, 45, 0, 0, 0, 82],
        [0, 15, 0, 33, 0, 55, 65, 74, 0],
        [6, 17, 26, 0, 46, 57, 0, 0, 0],
        [0, 0, 28, 35, 0, 0, 67, 76, 84],
        [7, 19, 0, 0, 48, 58, 0, 0, 86],
        [0, 0, 0, 37, 0, 0, 69, 78, 89]
      ]
    },
    {
      "id": 7,
      "color": "maroon",
      "grid": [
        [0, 15, 0, 31, 44, 52, 0, 70, 0],
        [4, 0, 23, 0, 48, 0, 61, 0, 85],
        [0, 11, 26, 35, 0, 56, 0, 78, 0],
        [9, 18, 0, 39, 41, 0, 64, 0, 0],
        [0, 0, 20, 0, 43, 50, 67, 72, 0],
        [2, 14, 29, 32, 0, 0, 0, 0, 89],
        [0, 0, 25, 37, 47, 58, 0, 75, 0],
        [7, 10, 0, 0, 0, 54, 66, 0, 81],
        [5, 0, 21, 0, 0, 0, 69, 73, 83]
      ]
    },
    {
      "id": 8,
      "color": "maroon",
      "grid": [
        [1, 0, 22, 30, 0, 0, 60, 0, 80],
        [0, 12, 0, 33, 40, 51, 0, 71, 0],
        [3, 0, 24, 0, 42, 0, 62, 74, 82],
        [0, 13, 27, 34, 0, 53, 63, 0, 0],
        [6, 16, 0, 0, 45, 0, 0, 76, 84],
        [0, 0, 28, 36, 46, 55, 65, 0, 0],
        [8, 17, 0, 0, 49, 0, 68, 77, 0],
        [0, 19, 0, 38, 0, 57, 0, 79, 86],
        [0, 0, 0, 0, 0, 59, 0, 87, 90]
      ]
    },
    {
      "id": 9,
      "color": "grey",
      "grid": [
        [3, 0, 20, 0, 41, 55, 60, 0, 0],
        [0, 12, 24, 30, 0, 58, 0, 71, 0],
        [6, 15, 0, 33, 45, 0, 0, 0, 82],
        [0, 0, 27, 36, 0, 51, 64, 73, 0],
        [8, 17, 0, 0, 48, 54, 0, 76, 0],
        [0, 19, 29, 39, 49, 0, 0, 0, 85],
        [2, 0, 21, 0, 0, 57, 66, 0, 87],
        [0, 0, 0, 31, 43, 0, 68, 78, 89],
        [5, 11, 23, 0, 0, 0, 69, 79, 0]
      ]
    },
    {
      "id": 10,
      "color": "grey",
      "grid": [
        [0, 10, 0, 32, 40, 0, 0, 70, 80],
        [1, 0, 22, 0, 42, 50, 61, 0, 0],
        [0, 13, 25, 34, 0, 0, 62, 72, 81],
        [4, 14, 0, 0, 44, 52, 63, 0, 0],
        [0, 0, 26, 35, 0, 0, 65, 74, 83],
        [7, 16, 0, 0, 46, 53, 0, 75, 84],
        [0, 18, 28, 37, 0, 56, 0, 0, 86],
        [9, 0, 0, 38, 47, 0, 67, 77, 0],
        [0, 0, 0, 0, 0, 59, 0, 88, 90]
      ]
    },
    {
      "id": 11,
      "color": "pink",
      "grid": [
        [2, 0, 20, 31, 0, 50, 0, 71, 0],
        [0, 14, 0, 33, 42, 0, 61, 0, 81],
        [5, 17, 24, 0, 45, 54, 0, 0, 0],
        [0, 0, 27, 36, 0, 56, 63, 74, 0],
        [8, 11, 0, 38, 47, 0, 0, 0, 84],
        [0, 19, 29, 0, 49, 0, 65, 77, 0],
        [1, 0, 22, 0, 0, 58, 67, 0, 87],
        [0, 15, 0, 34, 41, 52, 0, 79, 0],
        [6, 0, 25, 0, 0, 0, 69, 72, 90]
      ]
    },
    {
      "id": 12,
      "color": "pink",
      "grid": [
        [0, 10, 21, 0, 40, 0, 60, 0, 80],
        [3, 0, 23, 30, 0, 51, 0, 70, 82],
        [0, 12, 0, 32, 43, 0, 62, 73, 0],
        [4, 13, 26, 0, 44, 53, 0, 0, 83],
        [0, 16, 0, 35, 0, 55, 64, 75, 0],
        [7, 0, 28, 37, 46, 57, 0, 0, 85],
        [0, 18, 0, 39, 48, 0, 66, 76, 0],
        [9, 0, 0, 0, 0, 59, 68, 78, 86],
        [0, 0, 0, 0, 0, 0, 0, 88, 89]
      ]
    },
    {
      "id": 13,
      "color": "orange",
      "grid": [
        [2, 11, 0, 32, 0, 50, 61, 0, 0],
        [0, 15, 23, 0, 41, 54, 0, 72, 0],
        [5, 0, 26, 35, 43, 0, 64, 0, 0],
        [0, 17, 0, 38, 0, 56, 0, 75, 81],
        [8, 0, 29, 0, 46, 0, 67, 78, 0],
        [0, 12, 0, 31, 48, 59, 0, 0, 83],
        [3, 19, 21, 0, 0, 0, 60, 0, 86],
        [0, 0, 24, 34, 40, 52, 0, 70, 0],
        [6, 0, 0, 0, 0, 0, 69, 79, 89]
      ]
    },
    {
      "id": 14,
      "color": "orange",
      "grid": [
        [1, 0, 20, 0, 42, 51, 0, 71, 80],
        [0, 10, 0, 30, 0, 0, 62, 73, 82],
        [4, 13, 22, 0, 44, 53, 63, 0, 0],
        [0, 0, 25, 33, 45, 55, 65, 0, 0],
        [7, 14, 0, 36, 0, 0, 0, 74, 84],
        [0, 16, 27, 37, 0, 57, 66, 0, 85],
        [9, 18, 0, 39, 47, 0, 0, 76, 0],
        [0, 0, 28, 0, 49, 58, 68, 77, 0],
        [0, 0, 0, 0, 0, 0, 0, 87, 90]
      ]
    },
    {
      "id": 15,
      "color": "purple",
      "grid": [
        [0, 12, 21, 0, 44, 0, 60, 71, 0],
        [4, 0, 24, 33, 0, 52, 0, 0, 81],
        [7, 15, 0, 36, 47, 0, 63, 0, 0],
        [0, 18, 27, 0, 40, 55, 0, 75, 0],
        [2, 0, 0, 31, 0, 58, 65, 0, 84],
        [0, 11, 29, 39, 49, 0, 0, 78, 0],
        [6, 14, 0, 0, 42, 50, 67, 0, 0],
        [0, 0, 22, 34, 0, 54, 0, 73, 87],
        [9, 0, 0, 0, 45, 0, 69, 79, 89]
      ]
    },
    {
      "id": 16,
      "color": "purple",
      "grid": [
        [1, 10, 0, 30, 0, 51, 0, 0, 80],
        [0, 13, 20, 0, 41, 0, 61, 70, 82],
        [3, 0, 23, 32, 43, 53, 0, 0, 0],
        [5, 16, 25, 0, 0, 0, 62, 72, 83],
        [0, 0, 26, 35, 46, 56, 64, 0, 0],
        [8, 17, 0, 37, 48, 57, 0, 74, 0],
        [0, 19, 28, 38, 0, 0, 66, 76, 85],
        [0, 0, 0, 0, 0, 59, 68, 77, 86],
        [0, 0, 0, 0, 0, 0, 0, 88, 90]
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

// Helper: Call FPT.AI TTS to generate audio with retry logic
async function generateTTSAudio(text, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`FPT.AI attempt ${attempt}/${retries} for: "${text}"`);
      
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
        console.error(`FPT.AI TTS HTTP error: ${response.status}`);
        if (attempt === retries) return null;
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s before retry
        continue;
      }
      
      const data = await response.json();
      
      if (data.error === 0 && data.async) {
        console.log(`✅ FPT.AI success on attempt ${attempt}: ${data.async}`);
        return data.async;
      } else {
        console.error(`FPT.AI TTS error: ${data.message || 'Unknown error'}`);
        if (attempt === retries) return null;
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error(`FPT.AI attempt ${attempt} failed:`, error.message);
      if (attempt === retries) return null;
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s before retry
    }
  }
  return null;
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
