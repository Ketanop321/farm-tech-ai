import express from 'express';
import authenticateToken from '../middleware/authmiddleware.js';

export default async (db, JWT_SECRET) => {
  const authMiddleware = authenticateToken(JWT_SECRET);
  const router = express.Router();

  // Middleware to check admin role
  const requireAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  };

  // Get dashboard stats
  router.get('/dashboard', authMiddleware, requireAdmin, async (req, res) => {
    try {
      const users = await db.getAllUsers();
      const orders = await db.getAllOrders();
      const products = await db.getProducts();

      const stats = {
        totalUsers: users.length,
        totalFarmers: users.filter(u => u.role === 'farmer').length,
        totalBuyers: users.filter(u => u.role === 'buyer').length,
        totalOrders: orders.length,
        totalProducts: products.length,
        totalRevenue: orders.reduce((sum, order) => sum + order.totalAmount, 0),
        pendingOrders: orders.filter(o => o.status === 'pending').length,
        deliveredOrders: orders.filter(o => o.status === 'delivered').length
      };

      res.json(stats);
    } catch (error) {
      console.error('Get dashboard stats error:', error);
      res.status(500).json({ error: 'Failed to get dashboard stats' });
    }
  });

  // Get all users
  router.get('/users', authMiddleware, requireAdmin, async (req, res) => {
    try {
      const users = await db.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({ error: 'Failed to get users' });
    }
  });

  // Get all orders
  router.get('/orders', authMiddleware, requireAdmin, async (req, res) => {
    try {
      const orders = await db.getAllOrders();
      
      // Get order items for each order
      const ordersWithItems = await Promise.all(
        orders.map(async (order) => {
          const items = await db.getOrderItems(order.id);
          return { ...order, items };
        })
      );

      res.json(ordersWithItems);
    } catch (error) {
      console.error('Get admin orders error:', error);
      res.status(500).json({ error: 'Failed to get orders' });
    }
  });

  // Approve farmer
  router.patch('/farmers/:id/approve', authMiddleware, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      await db.approveFarmer(id);
      res.json({ message: 'Farmer approved successfully' });
    } catch (error) {
      console.error('Approve farmer error:', error);
      res.status(500).json({ error: 'Failed to approve farmer' });
    }
  });

  // Get all products
  router.get('/products', authMiddleware, requireAdmin, async (req, res) => {
    try {
      const products = await db.getProducts();
      res.json(products);
    } catch (error) {
      console.error('Get admin products error:', error);
      res.status(500).json({ error: 'Failed to get products' });
    }
  });

  return router;
};