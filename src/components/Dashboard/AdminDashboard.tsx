import React, { useState } from 'react';
import { Users, ShoppingBag, TrendingUp, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { User, Product, Order } from '../../types';

interface AdminDashboardProps {
  users: User[];
  products: Product[];
  orders: Order[];
  onApproveVendor: (vendorId: string) => void;
  onRejectVendor: (vendorId: string) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({
  users,
  products,
  orders,
  onApproveVendor,
  onRejectVendor,
}) => {
  const [activeTab, setActiveTab] = useState('overview');

  const farmers = users.filter(user => user.role === 'farmer');
  const buyers = users.filter(user => user.role === 'buyer');
  const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const pendingVendors = farmers.filter(farmer => !(farmer as any).isVerified);

  const stats = [
    {
      title: 'Total Revenue',
      value: `₹${totalRevenue.toLocaleString()}`,
      change: '+12%',
      positive: true,
      icon: TrendingUp,
    },
    {
      title: 'Active Vendors',
      value: farmers.length.toString(),
      change: '+5',
      positive: true,
      icon: Users,
    },
    {
      title: 'Total Orders',
      value: orders.length.toString(),
      change: '+18%',
      positive: true,
      icon: ShoppingBag,
    },
    {
      title: 'Pending Approvals',
      value: pendingVendors.length.toString(),
      change: '+3',
      positive: false,
      icon: AlertCircle,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600">Manage your marketplace and monitor performance</p>
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
                <div className="p-3 bg-blue-100 rounded-full">
                  <Icon className="h-6 w-6 text-blue-600" />
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
          {['overview', 'vendors', 'products', 'orders'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600'
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
              {orders.slice(0, 5).map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Order #{order.id.slice(-6)}</p>
                    <p className="text-sm text-gray-600">
                      {order.buyer?.firstName} {order.buyer?.lastName}
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
            </div>
          </div>
        )}

        {activeTab === 'vendors' && (
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Vendor Management</h3>
            
            {pendingVendors.length > 0 && (
              <div className="mb-6">
                <h4 className="font-medium mb-3">Pending Approvals</h4>
                <div className="space-y-3">
                  {pendingVendors.map((vendor) => (
                    <div key={vendor.id} className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                      <div>
                        <p className="font-medium">{(vendor as any).farmName}</p>
                        <p className="text-sm text-gray-600">{vendor.email}</p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => onApproveVendor(vendor.id)}
                          className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4" />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => onRejectVendor(vendor.id)}
                          className="flex items-center space-x-1 px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700"
                        >
                          <XCircle className="h-4 w-4" />
                          <span>Reject</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-4">
              <h4 className="font-medium">All Vendors</h4>
              {farmers.map((farmer) => (
                <div key={farmer.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{(farmer as any).farmName}</p>
                    <p className="text-sm text-gray-600">{farmer.email}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-sm ${
                    (farmer as any).isVerified
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {(farmer as any).isVerified ? 'Verified' : 'Pending'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Product Management</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((product) => (
                <div key={product.id} className="border rounded-lg p-4">
                  <img
                    src={product.images[0] || 'https://images.pexels.com/photos/1300972/pexels-photo-1300972.jpeg?auto=compress&cs=tinysrgb&w=300'}
                    alt={product.title}
                    className="w-full h-32 object-cover rounded-md mb-3"
                  />
                  <h4 className="font-medium">{product.title}</h4>
                  <p className="text-sm text-gray-600">₹{product.price} per {product.unit}</p>
                  <p className="text-sm text-gray-500">Stock: {product.stock}</p>
                  <p className="text-sm text-gray-500">Farmer: {product.farmer?.farmName}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Order Management</h3>
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">Order #{order.id.slice(-6)}</p>
                      <p className="text-sm text-gray-600">
                        Customer: {order.buyer?.firstName} {order.buyer?.lastName}
                      </p>
                      <p className="text-sm text-gray-600">
                        Farmer: {order.farmer?.farmName}
                      </p>
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
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;