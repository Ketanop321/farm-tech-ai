import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import authenticateToken from '../middleware/authmiddleware.js';


export default (db, JWT_SECRET) => {
  const router = express.Router();
  const authMiddleware = authenticateToken(JWT_SECRET)

  // Register
  router.post('/register', async (req, res) => {
    try {
      const { email, password, firstName, lastName, phone, role, farmName, farmAddress, licenseNumber } = req.body;

      // Check if user already exists
      const existingUser = await db.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const userId = uuidv4();
      const user = await db.createUser({
        id: userId,
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone,
        role
      });

      // If farmer, create farmer profile
      if (role === 'farmer') {
        const farmerId = uuidv4();
        await db.createFarmer({
          id: farmerId,
          userId,
          farmName,
          farmAddress,
          licenseNumber
        });
      }

      // Generate JWT token
      const token = jwt.sign({ userId, email, role }, JWT_SECRET, { expiresIn: '7d' });
      res.status(201).json({
        message: 'User registered successfully',
        token,
        user: { id: userId, email, firstName, lastName, role }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Registration failed' });
    }
  });

  // Login
  router.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await db.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Check password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Generate JWT token
      const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

      // Get farmer info if user is a farmer
      let farmerInfo = null;
      if (user.role === 'farmer') {
        farmerInfo = await db.getFarmerByUserId(user.id);
      }

      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          farmer: farmerInfo
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  });

  

  // Get current user
  router.get('/me', authMiddleware, async (req, res) => {
    try {
      const user = await db.getUserById(req.user.userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      let farmerInfo = null;
      if (user.role === 'farmer') {
        farmerInfo = await db.getFarmerByUserId(user.id);
      }

      res.json({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        farmer: farmerInfo
      });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ error: 'Failed to get user' });
    }
  });

  return router;
};