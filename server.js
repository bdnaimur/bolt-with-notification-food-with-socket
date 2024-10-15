import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

app.use(express.static(join(__dirname, 'dist')));

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('new chat', (chatId) => {
    console.log('New chat created:', chatId);
    socket.join(chatId);
    io.to(chatId).emit('new chat', chatId);
  });

  socket.on('chat message', (msg) => {
    console.log('Message received:', msg);
    io.to(msg.chatId).emit(`chat message ${msg.chatId}`, msg);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});