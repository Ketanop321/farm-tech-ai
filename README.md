 # 🌾 FarmMarket - Comprehensive Farmer Marketplace

A full-stack multivendor marketplace platform connecting farmers directly with buyers, featuring real-time chat, order management, and comprehensive admin oversight.

![FarmMarket Banner](https://images.pexels.com/photos/1300972/pexels-photo-1300972.jpeg?auto=compress&cs=tinysrgb&w=1200&h=300&fit=crop)

## 📋 Table of Contents

- [Description](#description)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Contributing](#contributing)
- [Testing](#testing)
- [Versioning](#versioning)
- [License](#license)
- [Authors](#authors)
- [Acknowledgements](#acknowledgements)
- [FAQ](#faq)

## 📖 Description

FarmMarket is a comprehensive multivendor marketplace that bridges the gap between farmers and consumers. The platform enables farmers to showcase their fresh produce, manage inventory, and connect directly with buyers through an intuitive interface. Buyers can browse products, place orders, and communicate with farmers in real-time.

### Key Objectives
- **Direct Farm-to-Consumer Sales**: Eliminate middlemen and increase farmer profits
- **Fresh Produce Access**: Provide consumers with access to fresh, local produce
- **Digital Transformation**: Help farmers embrace digital commerce
- **Community Building**: Foster relationships between farmers and consumers

## ✨ Features

### 🔐 Authentication & User Management
- **Multi-role Authentication**: Farmers, Buyers, and Admins
- **JWT Token-based Security**: Secure authentication system
- **Role-based Access Control**: Different permissions for each user type
- **Profile Management**: Complete user profile customization

### 👨‍🌾 Farmer Features
- **Vendor Dashboard**: Comprehensive analytics and insights
- **Product Management**: Full CRUD operations with image uploads
- **Inventory Tracking**: Real-time stock management
- **Order Management**: Track orders from placement to delivery
- **Revenue Analytics**: Financial insights and reporting
- **Real-time Chat**: Direct communication with buyers
- **KYC Integration**: Farmer verification system

### 🛒 Buyer Features
- **Product Catalog**: Browse with advanced filters and search
- **Shopping Cart**: Seamless cart management
- **Secure Checkout**: Multiple payment options
- **Order Tracking**: Real-time order status updates
- **Review System**: Rate and review products
- **Wishlist**: Save favorite products
- **Chat System**: Direct communication with farmers

### 👑 Admin Features
- **Dashboard Analytics**: Comprehensive platform metrics
- **User Management**: Manage farmers and buyers
- **Vendor Approval**: KYC verification and approval workflow
- **Product Oversight**: Monitor and manage all products
- **Order Management**: Platform-wide order monitoring
- **Revenue Tracking**: Financial analytics and reporting
- **Content Management**: Manage categories and platform content

### 💬 Real-time Features
- **Live Chat**: Socket.IO powered messaging
- **Real-time Notifications**: Instant updates for orders and messages
- **Live Order Tracking**: Real-time order status updates
- **Inventory Updates**: Live stock level updates

### 📱 User Experience
- **Responsive Design**: Mobile-first approach
- **Intuitive Interface**: Clean and user-friendly design
- **Fast Performance**: Optimized for speed
- **Accessibility**: WCAG compliant design

## 🛠 Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icons
- **Axios** - HTTP client
- **Socket.IO Client** - Real-time communication

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **SQLite** - Lightweight database
- **Socket.IO** - Real-time communication
- **JWT** - Authentication tokens
- **Multer** - File upload handling
- **bcryptjs** - Password hashing

### Development Tools
- **Vite** - Fast build tool
- **ESLint** - Code linting
- **TypeScript** - Static type checking
- **Concurrently** - Run multiple commands

## 🚀 Installation

### Prerequisites
- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **Git**

### Step 1: Clone the Repository
```bash
git clone https://github.com/yourusername/farmmarket.git
cd farmmarket
```

### Step 2: Install Dependencies
```bash
# Install all dependencies
npm install
```

### Step 3: Environment Setup
Create a `.env` inside server folder:
```env
# Server Configuration
PORT=3001

# JWT SECRET
JWT_SECRET=your jwt secret key

# SUPABASE CONFIGS
SUPABASE_SERVICE_ROLE_KEY=your supabase service role key
SUPABASE_ANON_KEY=your supabase anon key
SUPABASE_URL=your supabase url
```

Create a `.env` inside src folder:
```env
# SUPABASE CONFIG

VITE_SUPABASE_ANON_KEY=your supabase anon key
VITE_SUPABASE_URL=your supabase url
```

### Step 4: Database Setup
The SQLite database will be automatically created when you start the server for the first time. The application includes:
- Automatic table creation
- Default categories seeding
- Admin user creation

### Step 5: Create Upload Directory
```bash
mkdir uploads
```

## 🎯 Usage

### Development Mode

#### Start Both Frontend and Backend
```bash
npm run dev:full
```
This command starts both the backend server (port 3001) and frontend development server (port 5173) concurrently.

#### Start Backend Only
```bash
npm run server
```

#### Start Frontend Only
```bash
npm run dev
```

### Production Mode

#### Build Frontend
```bash
npm run build
```

#### Start Production Server
```bash
npm start
```

### Default Admin Account
- **Email**: `admin@farmmarket.com`
- **Password**: `admin123`

### Backend geploy on render free plan so it willl be automatic restart so pls wait 

### Testing the Application

1. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001

2. **Login as Admin**
   - Use the default admin credentials
   - Explore the admin dashboard

3. **Register as Farmer**
   - Create a new farmer account
   - Add products to your farm
   - Manage inventory

4. **Register as Buyer**
   - Create a buyer account
   - Browse products
   - Place orders
   - Chat with farmers

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "role": "buyer|farmer",
  "farmName": "Green Acres", // Required for farmers
  "farmAddress": "123 Farm Road", // Required for farmers
  "licenseNumber": "LIC123456" // Optional for farmers
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <jwt_token>
```

### Product Endpoints

#### Get All Products
```http
GET /api/products?category=vegetables&farmerId=123
```

#### Create Product (Farmers Only)
```http
POST /api/products
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data

{
  "title": "Organic Tomatoes",
  "description": "Fresh organic tomatoes",
  "category": "vegetables",
  "price": 120,
  "stock": 50,
  "unit": "kg",
  "images": [file1, file2]
}
```

#### Update Product
```http
PUT /api/products/:id
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data
```

### Order Endpoints

#### Create Order
```http
POST /api/orders
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "items": [
    {
      "productId": "product_id",
      "quantity": 2
    }
  ],
  "shippingAddress": {
    "fullName": "John Doe",
    "phoneNumber": "+1234567890",
    "addressLine1": "123 Main St",
    "city": "City",
    "state": "State",
    "postalCode": "12345",
    "country": "Country"
  },
  "paymentMethod": "credit_card"
}
```

#### Get User Orders
```http
GET /api/orders
Authorization: Bearer <jwt_token>
```

#### Update Order Status (Farmers/Admin Only)
```http
PATCH /api/orders/:id/status
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "status": "confirmed|processing|shipped|delivered|cancelled"
}
```

### Chat Endpoints

#### Create Chat
```http
POST /api/chat/create
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "farmerId": "farmer_id"
}
```

#### Get Messages
```http
GET /api/chat/:chatId/messages
Authorization: Bearer <jwt_token>
```

#### Send Message
```http
POST /api/chat/:chatId/messages
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "content": "Hello, I'm interested in your products",
  "type": "text"
}
```

### Admin Endpoints

#### Get Dashboard Stats
```http
GET /api/admin/dashboard
Authorization: Bearer <jwt_token>
```

#### Get All Users
```http
GET /api/admin/users
Authorization: Bearer <jwt_token>
```

#### Approve Farmer
```http
PATCH /api/admin/farmers/:id/approve
Authorization: Bearer <jwt_token>
```

## 🗄 Database Schema

### Users Table
```sql
CREATE TABLE users (
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
);
```

### Farmers Table
```sql
CREATE TABLE farmers (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  farmName TEXT NOT NULL,
  farmAddress TEXT NOT NULL,
  licenseNumber TEXT,
  kycDocuments TEXT,
  isApproved BOOLEAN DEFAULT 0,
  accountBalance REAL DEFAULT 0,
  FOREIGN KEY (userId) REFERENCES users (id)
);
```

### Products Table
```sql
CREATE TABLE products (
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
);
```

### Orders Table
```sql
CREATE TABLE orders (
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
);
```

## 🤝 Contributing

We welcome contributions to FarmMarket! Please follow these guidelines:

### Getting Started
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Commit your changes: `git commit -m 'Add amazing feature'`
5. Push to the branch: `git push origin feature/amazing-feature`
6. Open a Pull Request

### Code Style
- Use TypeScript for type safety
- Follow ESLint configuration
- Use meaningful commit messages
- Add comments for complex logic
- Write tests for new features

### Pull Request Process
1. Update the README.md with details of changes if applicable
2. Update the version numbers following [SemVer](http://semver.org/)
3. The PR will be merged once you have the sign-off of two other developers

### Development Guidelines
- **Code Quality**: Maintain high code quality with proper error handling
- **Documentation**: Document all new features and API endpoints
- **Testing**: Write unit tests for new functionality
- **Performance**: Optimize for performance and scalability
- **Security**: Follow security best practices

## 🧪 Testing

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Structure
```
tests/
├── unit/
│   ├── auth.test.js
│   ├── products.test.js
│   └── orders.test.js
├── integration/
│   ├── api.test.js
│   └── database.test.js
└── e2e/
    ├── user-flow.test.js
    └── admin-flow.test.js
```

### Testing Guidelines
- Write unit tests for all utility functions
- Create integration tests for API endpoints
- Add end-to-end tests for critical user flows
- Maintain test coverage above 80%

## 📈 Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/yourusername/farmmarket/tags).

### Version History
- **v1.0.0** - Initial release with core marketplace features
- **v1.1.0** - Added real-time chat functionality
- **v1.2.0** - Enhanced admin dashboard and analytics
- **v1.3.0** - Mobile responsiveness improvements

### Release Process
1. Update version in `package.json`
2. Update CHANGELOG.md
3. Create a git tag: `git tag -a v1.0.0 -m "Release version 1.0.0"`
4. Push tags: `git push origin --tags`

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### MIT License Summary
- ✅ Commercial use
- ✅ Modification
- ✅ Distribution
- ✅ Private use
- ❌ Liability
- ❌ Warranty

## 👥 Authors

### Core Team
- **Your Name** - *Initial work* - [YourGitHub](https://github.com/yourusername)
- **Contributor Name** - *Feature development* - [ContributorGitHub](https://github.com/contributor)

### Contributors
See the list of [contributors](https://github.com/yourusername/farmmarket/contributors) who participated in this project.

### Contact
- **Email**: contact@farmmarket.com
- **Website**: https://farmmarket.com
- **LinkedIn**: [FarmMarket](https://linkedin.com/company/farmmarket)
- **Twitter**: [@FarmMarket](https://twitter.com/farmmarket)

## 🙏 Acknowledgements

### Inspiration
- **Local Farmers**: For inspiring the need for direct-to-consumer platforms
- **Open Source Community**: For providing excellent tools and libraries
- **Design Inspiration**: Material-UI and Tailwind CSS communities

### Technologies
- [React](https://reactjs.org/) - Frontend framework
- [Node.js](https://nodejs.org/) - Backend runtime
- [Express.js](https://expressjs.com/) - Web framework
- [Socket.IO](https://socket.io/) - Real-time communication
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [SQLite](https://sqlite.org/) - Database

### Resources
- [Pexels](https://pexels.com) - Stock photos
- [Lucide](https://lucide.dev/) - Icons
- [Unsplash](https://unsplash.com) - Additional imagery

### Special Thanks
- **Beta Testers**: Community members who helped test the platform
- **Farmers**: Who provided valuable feedback during development
- **Mentors**: Technical advisors who guided the project

## ❓ FAQ

### General Questions

**Q: What is FarmMarket?**
A: FarmMarket is a comprehensive multivendor marketplace that connects farmers directly with consumers, eliminating middlemen and providing fresh produce access.

**Q: Who can use FarmMarket?**
A: The platform serves three user types:
- **Farmers**: Sell their produce directly to consumers
- **Buyers**: Purchase fresh produce from local farmers
- **Admins**: Manage the platform and oversee operations

**Q: Is FarmMarket free to use?**
A: Registration and basic usage are free. Transaction fees may apply for payment processing.

### Technical Questions

**Q: What technologies does FarmMarket use?**
A: FarmMarket is built with React, Node.js, Express, SQLite, and Socket.IO for real-time features.

**Q: How secure is the platform?**
A: We use JWT authentication, password hashing with bcrypt, and follow security best practices.

**Q: Can I integrate payment gateways?**
A: Yes, the platform is designed to integrate with Stripe, Razorpay, and other payment providers.

**Q: Is the platform mobile-friendly?**
A: Yes, FarmMarket is built with a mobile-first approach and is fully responsive.

### Development Questions

**Q: How do I contribute to the project?**
A: Please read our [Contributing](#contributing) section for detailed guidelines.

**Q: How do I report bugs?**
A: Create an issue on our [GitHub repository](https://github.com/yourusername/farmmarket/issues) with detailed information.

**Q: Can I customize the platform for my needs?**
A: Yes, the platform is open-source and can be customized. Please follow the MIT license terms.

**Q: How do I deploy FarmMarket?**
A: The platform can be deployed on any Node.js hosting service. See our deployment guide for details.

### Business Questions

**Q: Can I use FarmMarket for commercial purposes?**
A: Yes, the MIT license allows commercial use.

**Q: How do payments work?**
A: Payments are processed through integrated payment gateways with automatic farmer payouts.

**Q: What support is available?**
A: Community support is available through GitHub issues. Commercial support can be arranged separately.

**Q: Can I white-label the platform?**
A: Yes, you can customize and rebrand the platform according to your needs.

---

## 🚀 Quick Start Commands

```bash
# Clone and setup
git clone https://github.com/yourusername/farmmarket.git
cd farmmarket
npm install

# Start development
npm run dev:full

# Access the application
# Frontend: http://localhost:5173
# Backend: http://localhost:3001
# Admin: admin@farmmarket.com / admin123
```

---

**Made with ❤️ for farmers and fresh food lovers**

For more information, visit our [documentation](https://docs.farmmarket.com) or contact us at [support@farmmarket.com](mailto:support@farmmarket.com).
