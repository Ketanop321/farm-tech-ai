import React, { useState, useEffect } from 'react';
import Header from './components/Layout/Header';
import Navigation from './components/Layout/Navigation';
import ProductList from './components/Product/ProductList';
import AddProductForm from './components/Product/AddProductForm';
import Cart from './components/Cart/Cart';
import FarmerDashboard from './components/Dashboard/FarmerDashboard';
import AdminDashboard from './components/Dashboard/AdminDashboard';
import ChatWindow from './components/Chat/ChatWindow';
import AuthProvider from './components/Auth/AuthProvider';
import LoginForm from './components/Auth/LoginForm';
import RegisterForm from './components/Auth/RegisterForm';
import { useAuth } from './hooks/useAuth';
import { productsAPI, ordersAPI } from './services/api';
import { CartItem } from './types';

const AppContent: React.FC = () => {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState('home');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [showAuth, setShowAuth] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [chatFarmerId, setChatFarmerId] = useState<string | null>(null);
  const [chatFarmerName, setChatFarmerName] = useState<string>('');

  useEffect(() => {
    if (user) {
      loadProducts();
      loadOrders();
    }
  }, [user]);

  const loadProducts = async () => {
    try {
      const response = await productsAPI.getAll();
      setProducts(response.data);
    } catch (error) {
      console.error('Failed to load products:', error);
    }
  };

  const loadOrders = async () => {
    try {
      const response = await ordersAPI.getAll();
      setOrders(response.data);
    } catch (error) {
      console.error('Failed to load orders:', error);
    }
  };

  const handleAddToCart = (productId: string) => {
    const product = products.find((p: any) => p.id === productId);
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

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;

    try {
      const orderData = {
        items: cartItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity
        })),
        shippingAddress: {
          fullName: `${user?.firstName} ${user?.lastName}`,
          phoneNumber: user?.phone || '',
          addressLine1: '123 Main St',
          city: 'City',
          state: 'State',
          postalCode: '12345',
          country: 'India'
        },
        paymentMethod: 'credit_card'
      };

      await ordersAPI.create(orderData);
      setCartItems([]);
      setIsCartOpen(false);
      loadOrders();
      alert('Order placed successfully!');
    } catch (error) {
      console.error('Checkout failed:', error);
      alert('Failed to place order. Please try again.');
    }
  };

  const handleChatWithFarmer = (farmerId: string, farmerName: string) => {
    setChatFarmerId(farmerId);
    setChatFarmerName(farmerName);
    setCurrentPage('chat');
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
                <button 
                  onClick={() => setCurrentPage('products')}
                  className="bg-white text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                >
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
              products={products}
              onAddToCart={handleAddToCart}
              onProductClick={(id) => console.log('Product clicked:', id)}
              onChatWithFarmer={handleChatWithFarmer}
            />
          </div>
        );

      case 'dashboard':
        if (user.role === 'farmer') {
          return (
            <FarmerDashboard
              farmer={user.farmer}
              products={products.filter((p: any) => p.farmerId === user.farmer?.id)}
              orders={orders}
              onAddProduct={() => setIsAddProductOpen(true)}
              onEditProduct={(product) => {
                setSelectedProduct(product);
                setIsAddProductOpen(true);
              }}
            />
          );
        }
        break;

      case 'admin-dashboard':
        if (user.role === 'admin') {
          return (
            <AdminDashboard
              onApproveVendor={(id) => console.log('Approve vendor:', id)}
              onRejectVendor={(id) => console.log('Reject vendor:', id)}
            />
          );
        }
        break;

      case 'chat':
        if (chatFarmerId) {
          return (
            <div className="max-w-4xl mx-auto">
              <ChatWindow
                farmerId={chatFarmerId}
                farmerName={chatFarmerName}
                onClose={() => {
                  setChatFarmerId(null);
                  setChatFarmerName('');
                  setCurrentPage('home');
                }}
              />
            </div>
          );
        }
        return (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-4">Messages</h2>
            <p className="text-gray-600">Select a farmer to start chatting.</p>
          </div>
        );

      case 'orders':
        return (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-4">
              {user.role === 'farmer' ? 'Your Orders' : 'Order History'}
            </h2>
            <div className="space-y-4">
              {orders.map((order: any) => (
                <div key={order.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">Order #{order.id.slice(-6)}</p>
                      <p className="text-sm text-gray-600">{order.items?.length || 0} items</p>
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
              {orders.length === 0 && (
                <p className="text-gray-500 text-center py-8">No orders found.</p>
              )}
            </div>
          </div>
        );

      case 'my-products':
        if (user.role === 'farmer') {
          return (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">My Products</h2>
                <button
                  onClick={() => setIsAddProductOpen(true)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Add Product
                </button>
              </div>
              <ProductList
                products={products.filter((p: any) => p.farmerId === user.farmer?.id)}
                onAddToCart={handleAddToCart}
                onProductClick={(id) => {
                  const product = products.find((p: any) => p.id === id);
                  setSelectedProduct(product);
                  setIsAddProductOpen(true);
                }}
                onChatWithFarmer={handleChatWithFarmer}
                showEditOptions={true}
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
        onCheckout={handleCheckout}
      />

      <AddProductForm
        isOpen={isAddProductOpen}
        onClose={() => {
          setIsAddProductOpen(false);
          setSelectedProduct(null);
        }}
        onProductAdded={() => {
          loadProducts();
          setIsAddProductOpen(false);
          setSelectedProduct(null);
        }}
        product={selectedProduct}
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