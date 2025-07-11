import express from 'express';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import authenticateToken from '../middleware/authmiddleware.js'

// ES module equivalents for __dirname and __filename
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

export default (db, JWT_SECRET) => {
  const authMiddleware = authenticateToken(JWT_SECRET);
  const router = express.Router();

  // Get all products
  router.get('/', async (req, res) => {
    try {
      const { category, farmerId } = req.query;
      const products = await db.getProducts({ category, farmerId });
      res.json(products);
    } catch (error) {
      console.error('Get products error:', error);
      res.status(500).json({ error: 'Failed to get products' });
    }
  });

  // Get product by ID
  router.get('/:id', async (req, res) => {
    try {
      const product = await db.getProductById(req.params.id);
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
      res.json(product);
    } catch (error) {
      console.error('Get product error:', error);
      res.status(500).json({ error: 'Failed to get product' });
    }
  });

  // Create product (farmers only)
  router.post('/', authMiddleware, upload.array('images', 5), async (req, res) => {
    try {
      if (req.user.role !== 'farmer') {
        return res.status(403).json({ error: 'Only farmers can create products' });
      }

      const { title, description, category, price, stock, unit } = req.body;
      
      // Get farmer info
      const farmer = await db.getFarmerByUserId(req.user.userId);
      if (!farmer) {
        return res.status(404).json({ error: 'Farmer profile not found' });
      }

      // Process uploaded images
      const images = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];

      const productId = uuidv4();
      const product = await db.createProduct({
        id: productId,
        farmerId: farmer.id,
        title,
        description,
        category,
        price: parseFloat(price),
        stock: parseInt(stock),
        images,
        unit
      });

      res.status(201).json(product);
    } catch (error) {
      console.error('Create product error:', error);
      res.status(500).json({ error: 'Failed to create product' });
    }
  });

  // Update product (farmers only)
  router.put('/:id', authMiddleware, upload.array('images', 5), async (req, res) => {
    try {
      if (req.user.role !== 'farmer') {
        return res.status(403).json({ error: 'Only farmers can update products' });
      }

      const product = await db.getProductById(req.params.id);
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

      // Get farmer info
      const farmer = await db.getFarmerByUserId(req.user.userId);
      if (!farmer || product.farmerId !== farmer.id) {
        return res.status(403).json({ error: 'You can only update your own products' });
      }

      const updates = {};
      const { title, description, category, price, stock, unit } = req.body;

      if (title) updates.title = title;
      if (description) updates.description = description;
      if (category) updates.category = category;
      if (price) updates.price = parseFloat(price);
      if (stock) updates.stock = parseInt(stock);
      if (unit) updates.unit = unit;

      // Process new images if uploaded
      if (req.files && req.files.length > 0) {
        updates.images = JSON.stringify(req.files.map(file => `/uploads/${file.filename}`));
      }

      await db.updateProduct(req.params.id, updates);
      
      const updatedProduct = await db.getProductById(req.params.id);
      res.json(updatedProduct);
    } catch (error) {
      console.error('Update product error:', error);
      res.status(500).json({ error: 'Failed to update product' });
    }
  });

  // Get categories
  router.get('/categories/all', async (req, res) => {
    try {
      const categories = await db.getCategories();
      res.json(categories);
    } catch (error) {
      console.error('Get categories error:', error);
      res.status(500).json({ error: 'Failed to get categories' });
    }
  });

  return router;
};