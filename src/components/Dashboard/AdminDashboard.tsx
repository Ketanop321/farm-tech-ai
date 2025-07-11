import React, { useState, useEffect } from 'react';
import { Users, ShoppingBag, TrendingUp, AlertCircle, CheckCircle, XCircle, Settings, Eye, UserCheck, UserX } from 'lucide-react';
import { adminAPI } from '../../services/api';

interface AdminDashboardProps {
  onApproveVendor: (vendorId: string) => void;
  onRejectVendor: (vendorId: string) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onApproveVendor,
  onRejectVendor,
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<any>({});
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [statsRes, usersRes, productsRes, ordersRes] = await Promise.all([
        adminAPI.getDashboardStats(),
        adminAPI.getAllUsers(),
        adminAPI.getAllProducts(),
        adminAPI.getAllOrders()
      ]);

      setStats(statsRes.data);
      setUsers(usersRes.data);
      setProducts(productsRes.data);
      setOrders(ordersRes.data);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveFarmer = async (farmerId: string) => {
    try {
      await adminAPI.approveFarmer(farmerId);
      loadDashboardData(); // Refresh data
      onApproveVendor(farmerId);
    } catch (error) {
      console.error('Failed to approve farmer:', error);
      alert('Failed to approve farmer');
    }
  };

  const handleRejectFarmer = async (farmerId: string) => {
    try {
      // API call for rejection would go here
      onRejectVendor(farmerId);
      alert('Farmer rejected successfully');
    } catch (error) {
      console.error('Failed to reject farmer:', error);
      alert('Failed to reject farmer');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    );
  }

  const dashboardStats = [
    {
      title: 'Total Revenue',
      value: `₹${stats.totalRevenue?.toLocaleString() || 0}`,
      change: '+12%',
      positive: true,
      icon: TrendingUp,
    },
    {
      title: 'Active Vendors',
      value: stats.totalFarmers?.toString() || '0',
      change: '+5',
      positive: true,
      icon: Users,
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders?.toString() || '0',
      change: '+18%',
      positive: true,
      icon: ShoppingBag,
    },
    {
      title: 'Pending Approvals',
      value: users.filter((user: any) => user.role === 'farmer' && !user.isVerified).length.toString(),
      change: '+3',
      positive: false,
      icon: AlertCircle,
    },
  ];

  const farmers = users.filter((user: any) => user.role === 'farmer');
  const buyers = users.filter((user: any) => user.role === 'buyer');
  const pendingFarmers = farmers.filter((farmer: any) => !farmer.isVerified);

  const UserModal = ({ user, onClose }: { user: any; onClose: () => void }) => (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full max-w-lg bg-white shadow-xl">
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <h2 className="text-xl font-semibold">User Details</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">×</button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Users className="h-10 w-10 text-gray-500" />
                </div>
                <h3 className="text-lg font-semibold">{user.firstName} {user.lastName}</h3>
                <p className="text-gray-600">{user.email}</p>
                <span className={`inline-block px-2 py-1 rounded-full text-sm ${
                  user.role === 'farmer' ? 'bg-green-100 text-green-800' :
                  user.role === 'buyer' ? 'bg-blue-100 text-blue-800' :
                  'bg-purple-100 text-purple-800'
                }`}>
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Phone</label>
                  <p className="text-gray-900">{user.phone || 'Not provided'}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">Member Since</label>
                  <p className="text-gray-900">{new Date(user.createdAt).toLocaleDateString()}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <p className={`${user.isVerified ? 'text-green-600' : 'text-yellow-600'}`}>
                    {user.isVerified ? 'Verified' : 'Pending Verification'}
                  </p>
                </div>

                {user.role === 'farmer' && (
                  <>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Farm Name</label>
                      <p className="text-gray-900">{user.farmName || 'Not provided'}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-700">Farm Address</label>
                      <p className="text-gray-900">{user.farmAddress || 'Not provided'}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-700">License Number</label>
                      <p className="text-gray-900">{user.licenseNumber || 'Not provided'}</p>
                    </div>
                  </>
                )}
              </div>

              {user.role === 'farmer' && !user.isVerified && (
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      handleApproveFarmer(user.id);
                      onClose();
                    }}
                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center justify-center space-x-2"
                  >
                    <UserCheck className="h-4 w-4" />
                    <span>Approve</span>
                  </button>
                  <button
                    onClick={() => {
                      handleRejectFarmer(user.id);
                      onClose();
                    }}
                    className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center justify-center space-x-2"
                  >
                    <UserX className="h-4 w-4" />
                    <span>Reject</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Manage your marketplace and monitor performance</p>
        </div>
        <button className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200">
          <Settings className="h-4 w-4" />
          <span>Dashboard Settings</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardStats.map((stat, index) => {
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
          {['overview', 'vendors', 'products', 'orders', 'settings'].map((tab) => (
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
              {orders.slice(0, 5).map((order: any) => (
                <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Order #{order.id.slice(-6)}</p>
                    <p className="text-sm text-gray-600">
                      {order.buyerFirstName} {order.buyerLastName}
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
              ))}
            </div>
          </div>
        )}

        {activeTab === 'vendors' && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">Vendor Management</h3>
              <div className="flex space-x-4 text-sm">
                <span className="text-gray-600">Total: {farmers.length}</span>
                <span className="text-green-600">Approved: {farmers.filter((f: any) => f.isVerified).length}</span>
                <span className="text-yellow-600">Pending: {pendingFarmers.length}</span>
              </div>
            </div>
            
            {/* Pending Approvals */}
            {pendingFarmers.length > 0 && (
              <div className="mb-6">
                <h4 className="font-medium text-red-600 mb-3 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Pending Approvals ({pendingFarmers.length})
                </h4>
                <div className="space-y-3">
                  {pendingFarmers.map((farmer: any) => (
                    <div key={farmer.id} className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div>
                        <p className="font-medium">{farmer.firstName} {farmer.lastName}</p>
                        <p className="text-sm text-gray-600">{farmer.email}</p>
                        <p className="text-sm text-gray-500">Farm: {farmer.farmName || 'Not provided'}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setSelectedUser(farmer)}
                          className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                          <Eye className="h-4 w-4" />
                          <span>View</span>
                        </button>
                        <button
                          onClick={() => handleApproveFarmer(farmer.id)}
                          className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4" />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => handleRejectFarmer(farmer.id)}
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

            {/* All Vendors */}
            <div>
              <h4 className="font-medium mb-3">All Vendors</h4>
              <div className="space-y-3">
                {farmers.map((farmer: any) => (
                  <div key={farmer.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{farmer.firstName} {farmer.lastName}</p>
                      <p className="text-sm text-gray-600">{farmer.email}</p>
                      <p className="text-sm text-gray-500">
                        Joined: {new Date(farmer.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-sm ${
                        farmer.isVerified
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {farmer.isVerified ? 'Verified' : 'Pending'}
                      </span>
                      <button
                        onClick={() => setSelectedUser(farmer)}
                        className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        <Eye className="h-4 w-4" />
                        <span>View</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Product Management</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((product: any) => (
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
                  <p className="text-sm text-gray-500">Farmer: {product.farmName}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Order Management</h3>
            <div className="space-y-4">
              {orders.map((order: any) => (
                <div key={order.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">Order #{order.id.slice(-6)}</p>
                      <p className="text-sm text-gray-600">
                        Customer: {order.buyerFirstName} {order.buyerLastName}
                      </p>
                      <p className="text-sm text-gray-600">
                        Farmer: {order.farmName}
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

        {activeTab === 'settings' && (
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Dashboard Settings</h3>
            <div className="space-y-6">
              <div>
                <h4 className="font-medium mb-2">Platform Settings</h4>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" defaultChecked />
                    <span>Auto-approve verified farmers</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" defaultChecked />
                    <span>Send email notifications for new orders</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span>Enable maintenance mode</span>
                  </label>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Commission Settings</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-gray-600">Platform Commission (%)</label>
                    <input type="number" defaultValue="5" className="mt-1 block w-32 px-3 py-2 border border-gray-300 rounded-md" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600">Payment Processing Fee (%)</label>
                    <input type="number" defaultValue="2.5" className="mt-1 block w-32 px-3 py-2 border border-gray-300 rounded-md" />
                  </div>
                </div>
              </div>

              <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                Save Settings
              </button>
            </div>
          </div>
        )}
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <UserModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </div>
  );
};

export default AdminDashboard;