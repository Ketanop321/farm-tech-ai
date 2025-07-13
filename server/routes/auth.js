import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import authenticateToken from '../middleware/authmiddleware.js';

export default (db, JWT_SECRET) => {
  const router = express.Router();
  const authMiddleware = authenticateToken(JWT_SECRET);

  // Register
  router.post('/register', async (req, res) => {
    try {
      const { email, password, firstName, lastName, phone, role, farmName, farmAddress, licenseNumber } = req.body;

      // Validate required fields
      if (!email || !password || !firstName || !lastName || !role) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      if (!['farmer', 'buyer'].includes(role)) {
        return res.status(400).json({ error: 'Invalid role' });
      }

      // Check if user already exists
      const existingUser = await db.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: 'User already exists with this email' });
      }

      // Validate farmer-specific fields
      if (role === 'farmer' && (!farmName || !farmAddress)) {
        return res.status(400).json({ error: 'Farm name and address are required for farmers' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

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
      let farmerInfo = null;
      if (role === 'farmer') {
        const farmerId = uuidv4();
        farmerInfo = await db.createFarmer({
          id: farmerId,
          userId,
          farmName,
          farmAddress,
          licenseNumber
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId, email, role }, 
        JWT_SECRET, 
        { expiresIn: '7d' }
      );

      res.status(201).json({
        message: 'User registered successfully',
        token,
        user: { 
          id: userId, 
          email, 
          firstName, 
          lastName, 
          role,
          farmer: farmerInfo
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Registration failed. Please try again.' });
    }
  });

  // Login
  router.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body;

      // Validate input
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      // Find user
      const user = await db.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Check password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Get farmer info if user is a farmer
      let farmerInfo = null;
      if (user.role === 'farmer') {
        farmerInfo = await db.getFarmerByUserId(user.id);
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role }, 
        JWT_SECRET, 
        { expiresIn: '7d' }
      );

      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          phone: user.phone,
          farmer: farmerInfo
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed. Please try again.' });
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
        phone: user.phone,
        farmer: farmerInfo
      });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ error: 'Failed to get user information' });
    }
  });

  // Logout (client-side token removal)
  router.post('/logout', authMiddleware, (req, res) => {
    res.json({ message: 'Logout successful' });
  });

  return router;
};