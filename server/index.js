import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// ES module equivalents for __dirname and __filename
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

import Database from './database.js';
// import authRoutes from './routes/auth.js';
// import productRoutes from './routes/products.js';

import authRoutes from './routes/auth.js';
import productsRoutes from './routes/products.js';

import orderRoutes from './routes/orders.js';
import chatRoutes from './routes/chat.js';
import adminRoutes from './routes/admin.js';

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Initialize database
const db = new Database();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Create uploads directory if it doesn't exist
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Socket.IO for real-time chat
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-chat', (chatId) => {
    socket.join(chatId);
  });

  socket.on('send-message', async (data) => {
    try {
      const message = await db.createMessage(data);
      io.to(data.chatId).emit('new-message', message);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const authRouter = authRoutes(db, process.env.JWT_SECRET);
const productsRouter = productsRoutes(db, process.env.JWT_SECRET); // ✅ await here
const orderRouter = await orderRoutes(db, JWT_SECRET);
const chatRouter = await chatRoutes(db, JWT_SECRET);
const adminRouter = await adminRoutes(db, JWT_SECRET);

app.use('/api/auth', authRouter);
app.use('/api/products', productsRouter); // ✅ now safe
app.use('/api/orders', orderRouter);
app.use('/api/chat', chatRouter);
app.use('/api/admin', adminRouter);

// Routes
// app.use('/api/auth', authRoutes(db, JWT_SECRET))
// app.use('/api/products', productRoutes(db, JWT_SECRET));
// app.use('/api/orders', orderRoutes(db, JWT_SECRET));
// app.use('/api/chat', chatRoutes(db, JWT_SECRET));
// app.use('/api/admin', adminRoutes(db, JWT_SECRET));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});