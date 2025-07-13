import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import authenticateToken from '../middleware/authmiddleware.js';

export default async (db, JWT_SECRET) => {
  const authMiddleware = authenticateToken(JWT_SECRET);
  const router = express.Router();

  // Create or get chat between buyer and farmer
  router.post('/create', authMiddleware, async (req, res) => {
    try {
      const { farmerId } = req.body;
      const buyerId = req.user.userId;

      if (!farmerId) {
        return res.status(400).json({ error: 'Farmer ID is required' });
      }

      let chat = await db.getChatByUsers(buyerId, farmerId);

      if (!chat) {
        chat = await db.createChat({
          buyerId,
          farmerId
        });
      }

      res.json(chat);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create chat' });
    }
  });

  // Get messages from a specific chat
  router.get('/:chatId/messages', async (req, res) => {
    const { chatId } = req.params;

    try {
      const messages = await db.getChatsByUser(chatId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch messages' });
    }
  });

  // Send message in chat
  router.post('/:chatId/messages', authMiddleware, async (req, res) => {
    try {
      const { chatId } = req.params;
      const { content, type = 'text' } = req.body;
      const senderId = req.user.userId;

      const chat = await db.getChatById(chatId);

      if (!chat || (chat.buyer_id !== senderId && chat.farmer_id !== senderId)) {
        return res.status(403).json({ error: 'You are not a participant in this chat' });
      }

      const message = await db.createMessage({
        chatId,
        senderId,
        content,
        type
      });

      res.status(201).json(message);
    } catch (error) {
      res.status(500).json({ error: 'Failed to send message' });
    }
  });

  // Get chats for specific user
  router.get('/user/:userId', async (req, res) => {
    const userId = req.params.userId;
    const chats = await db.getChatsByUser(userId);
    res.json(chats.rows);
  });

  // Get chats for authenticated user
  router.get('/my', authMiddleware, async (req, res) => {
    try {
      const userId = req.user.userId;
      const chats = await db.getChatsByUser(userId);
      res.json(chats);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch user chats' });
    }
  });

  return router;
};
