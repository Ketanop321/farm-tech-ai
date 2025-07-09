import React, { useState, useEffect } from 'react';
import { TrendingUp, Package, ShoppingBag, MessageCircle, DollarSign, Plus } from 'lucide-react';
import { ordersAPI } from '../../services/api';

interface FarmerDashboardProps {
  farmer: any;
  products: any[];
  orders: any[];
  onAddProduct: () => void;
  onEditProduct: (product: any) => void;
}

const FarmerDashboard: React.FC<FarmerDashboardProps> = ({ 
  farmer, 
  products, 
  orders, 
  onAddProduct,
  onEditProduct
}) => {
  const [activeTab, setActiveTab] = useState('overview');

  const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const activeProducts = products.filter(p => p.isActive);
  const thisMonthOrders = orders.filter(order => {
    const orderDate = new Date(order.createdAt);
    const now = new Date();
    return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
  });

  const stats = [
    {
      title: 'Total Revenue',
      value: `₹${totalRevenue.toLocaleString()}`,
      change: '+12%',
      positive: true,
      icon: DollarSign,
    },
    {
      title: 'Active Products',
      value: activeProducts.length.toString(),
      change: '+3',
      positive: true,
      icon: Package,
    },
    {
      title: 'Orders This Month',
      value: thisMonthOrders.length.toString(),
      change: '+18%',
      positive: true,
      icon: ShoppingBag,
    },
    {
      title: 'Unread Messages',
      value: '7',
      change: '+2',
      positive: false,
      icon: MessageCircle,
    },
  ];

  const recentOrders = orders.slice(0, 5);

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      await ordersAPI.updateStatus(orderId, status);
      // Refresh orders would be handled by parent component
      window.location.reload(); // Simple refresh for now
    } catch (error) {
      console.error('Failed to update order status:', error);
      alert('Failed to update order status');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back, {farmer?.farmName || 'Farmer'}</h1>
          <p className="text-gray-600">Here's what's happening with your farm today</p>
        </div>
        <button
          onClick={onAddProduct}
          className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Add Product</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Icon className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <span className={`text-sm ${stat.positive ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.change}
                </span>
                <span className="text-sm text-gray-500 ml-2">from last month</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {['overview', 'products', 'orders'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow-sm border">
        {activeTab === 'overview' && (
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
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
              ))}
              {recentOrders.length === 0 && (
                <p className="text-gray-500 text-center py-8">No recent orders</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Your Products</h3>
              <button
                onClick={onAddProduct}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Add Product
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((product) => (
                <div key={product.id} className="border rounded-lg p-4">
                  <img
                    src={product.images && product.images.length > 0 
                      ? `http://localhost:3001${product.images[0]}`
                      : 'https://images.pexels.com/photos/1300972/pexels-photo-1300972.jpeg?auto=compress&cs=tinysrgb&w=300'
                    }
                    alt={product.title}
                    className="w-full h-32 object-cover rounded-md mb-3"
                  />
                  <h4 className="font-medium">{product.title}</h4>
                  <p className="text-sm text-gray-600">₹{product.price} per {product.unit}</p>
                  <p className="text-sm text-gray-500">Stock: {product.stock}</p>
                  <button
                    onClick={() => onEditProduct(product)}
                    className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Edit Product
                  </button>
                </div>
              ))}
              {products.length === 0 && (
                <div className="col-span-full text-center py-8">
                  <p className="text-gray-500">No products yet. Add your first product!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Orders</h3>
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">Order #{order.id.slice(-6)}</p>
                      <p className="text-sm text-gray-600">{order.items?.length || 0} items</p>
                      <p className="text-sm text-gray-500">
                        Customer: {order.buyerFirstName} {order.buyerLastName}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">₹{order.totalAmount}</p>
                      <select
                        value={order.status}
                        onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                        className={`text-sm px-2 py-1 rounded-full border-0 ${
                          order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                          order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
              {orders.length === 0 && (
                <p className="text-gray-500 text-center py-8">No orders yet</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FarmerDashboard;