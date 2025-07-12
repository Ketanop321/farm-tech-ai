import sqlite3 from 'sqlite3';
import bcrypt from 'bcryptjs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const { verbose } = sqlite3;
const db = verbose();

class Database {
  constructor() {
    this.db = new db.Database('marketplace.db');
    this.init();
  }

  init() {
    // Users table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        firstName TEXT NOT NULL,
        lastName TEXT NOT NULL,
        phone TEXT,
        role TEXT NOT NULL CHECK(role IN ('farmer', 'buyer', 'admin')),
        avatar TEXT,
        isVerified BOOLEAN DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Farmers table (extends users)
    this.db.run(`
      CREATE TABLE IF NOT EXISTS farmers (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        farmName TEXT NOT NULL,
        farmAddress TEXT NOT NULL,
        licenseNumber TEXT,
        kycDocuments TEXT,
        isApproved BOOLEAN DEFAULT 0,
        accountBalance REAL DEFAULT 0,
        FOREIGN KEY (userId) REFERENCES users (id)
      )
    `);

    // Categories table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        image TEXT,
        isActive BOOLEAN DEFAULT 1,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Products table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        farmerId TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        category TEXT NOT NULL,
        price REAL NOT NULL,
        stock INTEGER NOT NULL,
        images TEXT,
        unit TEXT NOT NULL,
        isActive BOOLEAN DEFAULT 1,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (farmerId) REFERENCES farmers (id)
      )
    `);

    // Orders table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        buyerId TEXT NOT NULL,
        farmerId TEXT NOT NULL,
        totalAmount REAL NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        shippingAddress TEXT NOT NULL,
        paymentStatus TEXT NOT NULL DEFAULT 'pending',
        paymentMethod TEXT,
        paymentId TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (buyerId) REFERENCES users (id),
        FOREIGN KEY (farmerId) REFERENCES farmers (id)
      )
    `);

    // Order items table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS order_items (
        id TEXT PRIMARY KEY,
        orderId TEXT NOT NULL,
        productId TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        price REAL NOT NULL,
        FOREIGN KEY (orderId) REFERENCES orders (id),
        FOREIGN KEY (productId) REFERENCES products (id)
      )
    `);

    // Chats table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS chats (
        id TEXT PRIMARY KEY,
        buyerId TEXT NOT NULL,
        farmerId TEXT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (buyerId) REFERENCES users (id),
        FOREIGN KEY (farmerId) REFERENCES farmers (id)
      )
    `);

    // Messages table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        chatId TEXT NOT NULL,
        senderId TEXT NOT NULL,
        content TEXT NOT NULL,
        type TEXT NOT NULL DEFAULT 'text',
        isRead BOOLEAN DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (chatId) REFERENCES chats (id),
        FOREIGN KEY (senderId) REFERENCES users (id)
      )
    `);

    // Reviews table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS reviews (
        id TEXT PRIMARY KEY,
        orderId TEXT NOT NULL,
        buyerId TEXT NOT NULL,
        farmerId TEXT NOT NULL,
        productId TEXT NOT NULL,
        rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
        comment TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (orderId) REFERENCES orders (id),
        FOREIGN KEY (buyerId) REFERENCES users (id),
        FOREIGN KEY (farmerId) REFERENCES farmers (id),
        FOREIGN KEY (productId) REFERENCES products (id)
      )
    `);

    // Insert default categories
    this.insertDefaultCategories();
    
    // Insert admin user
    this.insertAdminUser();
  }

  insertDefaultCategories() {
    const categories = [
      { id: '1', name: 'Vegetables', description: 'Fresh seasonal vegetables' },
      { id: '2', name: 'Fruits', description: 'Juicy fresh fruits' },
      { id: '3', name: 'Grains', description: 'Organic grains and cereals' },
      { id: '4', name: 'Dairy', description: 'Fresh dairy products' },
      { id: '5', name: 'Herbs', description: 'Fresh herbs and spices' }
    ];

    categories.forEach(category => {
      this.db.run(
        'INSERT OR IGNORE INTO categories (id, name, description) VALUES (?, ?, ?)',
        [category.id, category.name, category.description]
      );
    });
  }

  async insertAdminUser() {
    const adminExists = await this.getUserByEmail('admin@farmmarket.com');
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const adminId = uuidv4();
      
      this.db.run(
        'INSERT INTO users (id, email, password, firstName, lastName, role, isVerified) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [adminId, 'admin@farmmarket.com', hashedPassword, 'Admin', 'User', 'admin', 1]
      );
    }
  }

  // User methods
  createUser(userData) {
    return new Promise((resolve, reject) => {
      const { id, email, password, firstName, lastName, phone, role } = userData;
      this.db.run(
        'INSERT INTO users (id, email, password, firstName, lastName, phone, role) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [id, email, password, firstName, lastName, phone, role],
        function(err) {
          if (err) reject(err);
          else resolve({ id, email, firstName, lastName, phone, role });
        }
      );
    });
  }

  getUserByEmail(email) {
    return new Promise((resolve, reject) => {
      this.db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  getUserById(id) {
    return new Promise((resolve, reject) => {
      this.db.get('SELECT * FROM users WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  // Farmer methods
  createFarmer(farmerData) {
    return new Promise((resolve, reject) => {
      const { id, userId, farmName, farmAddress, licenseNumber } = farmerData;
      this.db.run(
        'INSERT INTO farmers (id, userId, farmName, farmAddress, licenseNumber) VALUES (?, ?, ?, ?, ?)',
        [id, userId, farmName, farmAddress, licenseNumber],
        function(err) {
          if (err) reject(err);
          else resolve({ id, userId, farmName, farmAddress, licenseNumber });
        }
      );
    });
  }

  getFarmerByUserId(userId) {
    return new Promise((resolve, reject) => {
      this.db.get('SELECT * FROM farmers WHERE userId = ?', [userId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  // Product methods
  createProduct(productData) {
    return new Promise((resolve, reject) => {
      const { id, farmerId, title, description, category, price, stock, images, unit } = productData;
      this.db.run(
        'INSERT INTO products (id, farmerId, title, description, category, price, stock, images, unit) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [id, farmerId, title, description, category, price, stock, JSON.stringify(images), unit],
        function(err) {
          if (err) reject(err);
          else resolve({ id, farmerId, title, description, category, price, stock, images, unit });
        }
      );
    });
  }

  getProducts(filters = {}) {
    return new Promise((resolve, reject) => {
      let query = `
        SELECT p.*, f.farmName, f.id as farmerId, u.firstName, u.lastName 
        FROM products p 
        JOIN farmers f ON p.farmerId = f.id 
        JOIN users u ON f.userId = u.id 
        WHERE p.isActive = 1
      `;
      const params = [];

      if (filters.category) {
        query += ' AND p.category = ?';
        params.push(filters.category);
      }

      if (filters.farmerId) {
        query += ' AND p.farmerId = ?';
        params.push(filters.farmerId);
      }

      query += ' ORDER BY p.createdAt DESC';

      this.db.all(query, params, (err, rows) => {
        if (err) reject(err);
        else {
          const products = rows.map(row => ({
            ...row,
            farmerId: row.farmerId,
            images: JSON.parse(row.images || '[]')
          }));
          resolve(products);
        }
      });
    });
  }

  getProductById(id) {
    return new Promise((resolve, reject) => {
      this.db.get(
        `SELECT p.*, f.farmName, f.id as farmerId, u.firstName, u.lastName 
         FROM products p 
         JOIN farmers f ON p.farmerId = f.id 
         JOIN users u ON f.userId = u.id 
         WHERE p.id = ?`,
        [id],
        (err, row) => {
          if (err) reject(err);
          else {
            if (row) {
              row.images = JSON.parse(row.images || '[]');
              row.farmerId = row.farmerId;
            }
            resolve(row);
          }
        }
      );
    });
  }

  updateProduct(id, updates) {
    return new Promise((resolve, reject) => {
      const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
      const values = Object.values(updates);
      values.push(id);

      this.db.run(
        `UPDATE products SET ${fields}, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`,
        values,
        function(err) {
          if (err) reject(err);
          else resolve(this.changes);
        }
      );
    });
  }

  // Order methods
  createOrder(orderData) {
    return new Promise((resolve, reject) => {
      const { id, buyerId, farmerId, totalAmount, shippingAddress, paymentMethod } = orderData;
      this.db.run(
        'INSERT INTO orders (id, buyerId, farmerId, totalAmount, shippingAddress, paymentMethod) VALUES (?, ?, ?, ?, ?, ?)',
        [id, buyerId, farmerId, totalAmount, JSON.stringify(shippingAddress), paymentMethod],
        function(err) {
          if (err) reject(err);
          else resolve({ id, buyerId, farmerId, totalAmount, shippingAddress, paymentMethod });
        }
      );
    });
  }

  createOrderItem(itemData) {
    return new Promise((resolve, reject) => {
      const { id, orderId, productId, quantity, price } = itemData;
      this.db.run(
        'INSERT INTO order_items (id, orderId, productId, quantity, price) VALUES (?, ?, ?, ?, ?)',
        [id, orderId, productId, quantity, price],
        function(err) {
          if (err) reject(err);
          else resolve({ id, orderId, productId, quantity, price });
        }
      );
    });
  }

  getOrdersByUserId(userId, role) {
    return new Promise((resolve, reject) => {
      let query;
      if (role === 'farmer') {
        query = `
          SELECT o.*, u.firstName as buyerFirstName, u.lastName as buyerLastName
          FROM orders o
          JOIN users u ON o.buyerId = u.id
          JOIN farmers f ON o.farmerId = f.id
          WHERE f.userId = ?
          ORDER BY o.createdAt DESC
        `;
      } else {
        query = `
          SELECT o.*, f.farmName
          FROM orders o
          JOIN farmers f ON o.farmerId = f.id
          WHERE o.buyerId = ?
          ORDER BY o.createdAt DESC
        `;
      }

      this.db.all(query, [userId], (err, rows) => {
        if (err) reject(err);
        else {
          const orders = rows.map(row => ({
            ...row,
            shippingAddress: JSON.parse(row.shippingAddress)
          }));
          resolve(orders);
        }
      });
    });
  }

  getOrderItems(orderId) {
    return new Promise((resolve, reject) => {
      this.db.all(
        `SELECT oi.*, p.title, p.images 
         FROM order_items oi 
         JOIN products p ON oi.productId = p.id 
         WHERE oi.orderId = ?`,
        [orderId],
        (err, rows) => {
          if (err) reject(err);
          else {
            const items = rows.map(row => ({
              ...row,
              images: JSON.parse(row.images || '[]')
            }));
            resolve(items);
          }
        }
      );
    });
  }

  updateOrderStatus(orderId, status) {
    return new Promise((resolve, reject) => {
      this.db.run(
        'UPDATE orders SET status = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
        [status, orderId],
        function(err) {
          if (err) reject(err);
          else resolve(this.changes);
        }
      );
    });
  }

  // Chat methods
  createChat(chatData) {
    return new Promise((resolve, reject) => {
      const { id, buyerId, farmerId } = chatData;
      this.db.run(
        'INSERT INTO chats (id, buyerId, farmerId) VALUES (?, ?, ?)',
        [id, buyerId, farmerId],
        function(err) {
          if (err) reject(err);
          else resolve({ id, buyerId, farmerId });
        }
      );
    });
  }

  getChatByUsers(buyerId, farmerId) {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM chats WHERE buyerId = ? AND farmerId = ?',
        [buyerId, farmerId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
  }

  createMessage(messageData) {
    return new Promise((resolve, reject) => {
      const { id, chatId, senderId, content, type } = messageData;
      this.db.run(
        'INSERT INTO messages (id, chatId, senderId, content, type) VALUES (?, ?, ?, ?, ?)',
        [id, chatId, senderId, content, type],
        function(err) {
          if (err) reject(err);
          else resolve({ id, chatId, senderId, content, type, createdAt: new Date().toISOString() });
        }
      );
    });
  }

  getMessages(chatId) {
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT * FROM messages WHERE chatId = ? ORDER BY createdAt ASC',
        [chatId],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  }

  // Admin methods
  getAllUsers() {
    return new Promise((resolve, reject) => {
      this.db.all('SELECT * FROM users ORDER BY createdAt DESC', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  getAllOrders() {
    return new Promise((resolve, reject) => {
      this.db.all(
        `SELECT o.*, u.firstName as buyerFirstName, u.lastName as buyerLastName, f.farmName
         FROM orders o
         JOIN users u ON o.buyerId = u.id
         JOIN farmers f ON o.farmerId = f.id
         ORDER BY o.createdAt DESC`,
        (err, rows) => {
          if (err) reject(err);
          else {
            const orders = rows.map(row => ({
              ...row,
              shippingAddress: JSON.parse(row.shippingAddress)
            }));
            resolve(orders);
          }
        }
      );
    });
  }

  approveFarmer(farmerId) {
    return new Promise((resolve, reject) => {
      this.db.run(
        'UPDATE farmers SET isApproved = 1 WHERE id = ?',
        [farmerId],
        function(err) {
          if (err) reject(err);
          else resolve(this.changes);
        }
      );
    });
  }

  getCategories() {
    return new Promise((resolve, reject) => {
      this.db.all('SELECT * FROM categories WHERE isActive = 1', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }
}

export default Database;