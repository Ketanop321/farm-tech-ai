import React, { useState } from 'react';
import Header from './components/Layout/Header';
import Navigation from './components/Layout/Navigation';
import ProductList from './components/Product/ProductList';
import Cart from './components/Cart/Cart';
import FarmerDashboard from './components/Dashboard/FarmerDashboard';
import AdminDashboard from './components/Dashboard/AdminDashboard';
import ChatWindow from './components/Chat/ChatWindow';
import AuthProvider from './components/Auth/AuthProvider';
import LoginForm from './components/Auth/LoginForm';
import RegisterForm from './components/Auth/RegisterForm';
import { useAuth } from './hooks/useAuth';
import { CartItem } from './types';
import { mockProducts, mockUsers, mockFarmers, mockOrders, mockChatMessages } from './data/mockData';

const AppContent: React.FC = () => {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState('home');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [showAuth, setShowAuth] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  const handleAddToCart = (productId: string) => {
    const product = mockProducts.find(p => p.id === productId);
    if (!product) return;

    const existingItem = cartItems.find(item => item.productId === productId);
    if (existingItem) {
      setCartItems(cartItems.map(item => 
        item.productId === productId 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      const newItem: CartItem = {
        id: Date.now().toString(),
        productId,
        quantity: 1,
        product,
      };
      setCartItems([...cartItems, newItem]);
    }
  };

  const handleUpdateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      setCartItems(cartItems.filter(item => item.id !== itemId));
    } else {
      setCartItems(cartItems.map(item => 
        item.id === itemId ? { ...item, quantity } : item
      ));
    }
  };

  const handleRemoveItem = (itemId: string) => {
    setCartItems(cartItems.filter(item => item.id !== itemId));
  };

  const handleSendMessage = (content: string, type: 'text' | 'image') => {
    console.log('Sending message:', { content, type });
    // In a real app, this would send the message via WebSocket
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        {isLogin ? (
          <LoginForm onToggleForm={() => setIsLogin(false)} />
        ) : (
          <RegisterForm onToggleForm={() => setIsLogin(true)} />
        )}
      </div>
    );
  }

  const renderContent = () => {
    switch (currentPage) {
      case 'home':
      case 'products':
        return (
          <div className="space-y-8">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-green-600 to-green-800 text-white rounded-lg p-8">
              <div className="max-w-2xl">
                <h1 className="text-4xl font-bold mb-4">
                  Fresh from Farm to Your Table
                </h1>
                <p className="text-xl mb-6">
                  Discover the finest organic produce directly from local farmers. 
                  Fresh, healthy, and delivered to your doorstep.
                </p>
                <button className="bg-white text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                  Shop Now
                </button>
              </div>
            </div>

            {/* Categories */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['Vegetables', 'Fruits', 'Grains', 'Dairy'].map((category) => (
                <div key={category} className="bg-white rounded-lg p-6 text-center hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🥕</span>
                  </div>
                  <h3 className="font-semibold">{category}</h3>
                </div>
              ))}
            </div>

            {/* Products */}
            <ProductList
              products={mockProducts}
              onAddToCart={handleAddToCart}
              onProductClick={(id) => console.log('Product clicked:', id)}
            />
          </div>
        );

      case 'dashboard':
        if (user.role === 'farmer') {
          return (
            <FarmerDashboard
              farmer={mockFarmers[0]}
              products={mockProducts}
              orders={mockOrders}
              onAddProduct={() => console.log('Add product')}
            />
          );
        }
        break;

      case 'admin-dashboard':
        if (user.role === 'admin') {
          return (
            <AdminDashboard
              users={mockUsers}
              products={mockProducts}
              orders={mockOrders}
              onApproveVendor={(id) => console.log('Approve vendor:', id)}
              onRejectVendor={(id) => console.log('Reject vendor:', id)}
            />
          );
        }
        break;

      case 'chat':
        return (
          <div className="h-96">
            <ChatWindow
              messages={mockChatMessages}
              onSendMessage={handleSendMessage}
              currentUserId={user.id}
              otherUserName="Green Acres Farm"
            />
          </div>
        );

      case 'orders':
        return (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-4">
              {user.role === 'farmer' ? 'Your Orders' : 'Order History'}
            </h2>
            <div className="space-y-4">
              {mockOrders.map((order) => (
                <div key={order.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">Order #{order.id.slice(-6)}</p>
                      <p className="text-sm text-gray-600">{order.items.length} items</p>
                      <p className="text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">₹{order.totalAmount}</p>
                      <span className={`text-sm px-2 py-1 rounded-full ${
                        order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'my-products':
        if (user.role === 'farmer') {
          return (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold mb-4">My Products</h2>
              <ProductList
                products={mockProducts}
                onAddToCart={handleAddToCart}
                onProductClick={(id) => console.log('Edit product:', id)}
              />
            </div>
          );
        }
        break;

      default:
        return (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-4">{currentPage}</h2>
            <p className="text-gray-600">This page is under construction.</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        onCartClick={() => setIsCartOpen(true)}
        cartItemCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
      />
      
      <Navigation
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </main>

      <Cart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onCheckout={() => {
          console.log('Checkout with items:', cartItems);
          setIsCartOpen(false);
        }}
      />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;