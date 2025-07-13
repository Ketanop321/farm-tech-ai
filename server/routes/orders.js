import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import authenticateToken from '../middleware/authmiddleware.js';

export default async (db, JWT_SECRET) => {
  const authMiddleware = authenticateToken(JWT_SECRET);
  const router = express.Router();

  // Create order
  router.post('/', authMiddleware, async (req, res) => {
    try {
      const { items, shippingAddress, paymentMethod } = req.body;
      
      if (!items || items.length === 0) {
        return res.status(400).json({ error: 'Order must contain at least one item' });
      }

      if (!shippingAddress) {
        return res.status(400).json({ error: 'Shipping address is required' });
      }

      // Group items by farmer
      const farmerOrders = {};
      let totalAmount = 0;

      for (const item of items) {
        const product = await db.getProductById(item.productId);
        if (!product) {
          return res.status(404).json({ error: `Product ${item.productId} not found` });
        }

        if (product.stock < item.quantity) {
          return res.status(400).json({ error: `Insufficient stock for ${product.title}` });
        }

        const itemTotal = product.price * item.quantity;
        totalAmount += itemTotal;

        if (!farmerOrders[product.farmerId]) {
          farmerOrders[product.farmerId] = {
            items: [],
            total: 0
          };
        }

        farmerOrders[product.farmerId].items.push({
          ...item,
          price: product.price,
          product
        });
        farmerOrders[product.farmerId].total += itemTotal;
      }

      // Create separate orders for each farmer
      const createdOrders = [];

      for (const [farmerId, orderData] of Object.entries(farmerOrders)) {
        const orderId = uuidv4();
        
        // Create order
        const order = await db.createOrder({
          id: orderId,
          buyerId: req.user.userId,
          farmerId,
          totalAmount: orderData.total,
          shippingAddress,
          paymentMethod: paymentMethod || 'cash_on_delivery'
        });

        // Create order items
        for (const item of orderData.items) {
          const orderItemId = uuidv4();
          await db.createOrderItem({
            id: orderItemId,
            orderId,
            productId: item.productId,
            quantity: item.quantity,
            price: item.price
          });

          // Update product stock
          const newStock = item.product.stock - item.quantity;
          await db.updateProduct(item.productId, { stock: newStock });
        }

        createdOrders.push(order);
      }

      res.status(201).json({
        message: 'Orders created successfully',
        orders: createdOrders
      });
    } catch (error) {
      console.error('Create order error:', error);
      res.status(500).json({ error: 'Failed to create order' });
    }
  });

  // Get user orders
  router.get('/', authMiddleware, async (req, res) => {
    try {
      const orders = await db.getOrdersByUserId(req.user.userId, req.user.role);
      
      // Get order items for each order
      const ordersWithItems = await Promise.all(
        orders.map(async (order) => {
          const items = await db.getOrderItems(order.id);
          return { ...order, items };
        })
      );

      res.json(ordersWithItems);
    } catch (error) {
      console.error('Get orders error:', error);
      res.status(500).json({ error: 'Failed to get orders' });
    }
  });

  // Update order status (farmers and admins only)
  router.patch('/:id/status', authMiddleware, async (req, res) => {
    try {
      const { status } = req.body;
      const orderId = req.params.id;

      if (!status) {
        return res.status(400).json({ error: 'Status is required' });
      }

      if (req.user.role !== 'farmer' && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Only farmers and admins can update order status' });
      }

      const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }

      const result = await db.updateOrderStatus(orderId, status);
      
      if (result === 0) {
        return res.status(404).json({ error: 'Order not found' });
      }
      
      res.json({ message: 'Order status updated successfully' });
    } catch (error) {
      console.error('Update order status error:', error);
      res.status(500).json({ error: 'Failed to update order status' });
    }
  });

  // Get order by ID
  router.get('/:id', authMiddleware, async (req, res) => {
    try {
      const orders = await db.getOrdersByUserId(req.user.userId, req.user.role);
      const order = orders.find(o => o.id === req.params.id);
      
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      const items = await db.getOrderItems(order.id);
      res.json({ ...order, items });
    } catch (error) {
      console.error('Get order error:', error);
      res.status(500).json({ error: 'Failed to get order' });
    }
  });

  return router;
};