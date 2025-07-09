const express = require('express');
const { v4: uuidv4 } = require('uuid');

module.exports = (db, JWT_SECRET) => {
  const { authenticateToken } = require('./auth')(db, JWT_SECRET);
  const router = express.Router();

  // Create or get chat between buyer and farmer
  router.post('/create', authenticateToken, async (req, res) => {
    try {
      const { farmerId } = req.body;
      const buyerId = req.user.userId;

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
  router.get('/:chatId/messages', authenticateToken, async (req, res) => {
    try {
      const { chatId } = req.params;
      const messages = await db.getMessages(chatId);
      res.json(messages);
    } catch (error) {
      console.error('Get messages error:', error);
      res.status(500).json({ error: 'Failed to get messages' });
    }
  });

  // Send message
  router.post('/:chatId/messages', authenticateToken, async (req, res) => {
    try {
      const { chatId } = req.params;
      const { content, type = 'text' } = req.body;
      const senderId = req.user.userId;

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

  return router;
};