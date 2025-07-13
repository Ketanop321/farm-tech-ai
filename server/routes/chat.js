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

      // Check if chat already exists
      let chat = await db.getChatByUsers(buyerId, farmerId);
      
      if (!chat) {
        // Create new chat
        const chatId = uuidv4();
        chat = await db.createChat({
          id: chatId,
          buyerId,
          farmerId
        });
      }

      res.json(chat);
    } catch (error) {
      console.error('Create chat error:', error);
      res.status(500).json({ error: 'Failed to create chat' });
    }
  });

  // Get messages for a chat
  router.get('/:chatId/messages', authMiddleware, async (req, res) => {
    try {
      const { chatId } = req.params;
      
      if (!chatId) {
        return res.status(400).json({ error: 'Chat ID is required' });
      }

      const messages = await db.getMessages(chatId);
      res.json(messages);
    } catch (error) {
      console.error('Get messages error:', error);
      res.status(500).json({ error: 'Failed to get messages' });
    }
  });

  // Send message
  router.post('/:chatId/messages', authMiddleware, async (req, res) => {
    try {
      const { chatId } = req.params;
      const { content, type = 'text' } = req.body;
      const senderId = req.user.userId;

      if (!chatId || !content) {
        return res.status(400).json({ error: 'Chat ID and content are required' });
      }

      const messageId = uuidv4();
      const message = await db.createMessage({
        id: messageId,
        chatId,
        senderId,
        content,
        type
      });

      res.status(201).json(message);
    } catch (error) {
      console.error('Send message error:', error);
      res.status(500).json({ error: 'Failed to send message' });
    }
  });

  // Get user's chats
  router.get('/user-chats', authMiddleware, async (req, res) => {
    try {
      const userId = req.user.userId;
      const userRole = req.user.role;

      // This would need to be implemented in the database
      // For now, return empty array
      res.json([]);
    } catch (error) {
      console.error('Get user chats error:', error);
      res.status(500).json({ error: 'Failed to get user chats' });
    }
  });

  return router;
};