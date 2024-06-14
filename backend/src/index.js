const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { handleMessage } = require('./controllers/chatbotController');
const config = require('./config');
const mongoose = require('mongoose');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

app.use(express.json());
app.use(cors());

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.emit('message', 'Hello, how can I help?');

  socket.on('message', async (message) => {
    console.log('Received message:', message);
    const response = await handleMessage(message, socket.id);
    socket.emit('message', response);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

mongoose.connect(config.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

server.listen(config.PORT, () => {
  console.log(`Server running on port ${config.PORT}`);
});
