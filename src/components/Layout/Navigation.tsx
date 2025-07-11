import React from 'react';
import { Home, ShoppingBag, MessageCircle, Settings, BarChart3, Users, Heart, Package } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface NavigationProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentPage, onPageChange }) => {
  const { user } = useAuth();

  const getNavItems = () => {
    const baseItems = [
      { id: 'home', label: 'Home', icon: Home },
      { id: 'products', label: 'Products', icon: ShoppingBag },
    ];

    if (user?.role === 'farmer') {
      return [
        ...baseItems,
        { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
        { id: 'my-products', label: 'My Products', icon: ShoppingBag },
        { id: 'orders', label: 'Orders', icon: Package },
        { id: 'chat', label: 'Messages', icon: MessageCircle },
        { id: 'settings', label: 'Settings', icon: Settings },
      ];
    }

    if (user?.role === 'admin') {
      return [
        { id: 'admin-dashboard', label: 'Dashboard', icon: BarChart3 },
        { id: 'manage-vendors', label: 'Vendors', icon: Users },
        { id: 'manage-products', label: 'Products', icon: ShoppingBag },
        { id: 'manage-orders', label: 'Orders', icon: Package },
        { id: 'settings', label: 'Settings', icon: Settings },
      ];
    }

    return [
      ...baseItems,
      { id: 'favorites', label: 'Favorites', icon: Heart },
      { id: 'orders', label: 'My Orders', icon: Package },
      { id: 'chat', label: 'Messages', icon: MessageCircle },
      { id: 'settings', label: 'Settings', icon: Settings },
    ];
  };

  const navItems = getNavItems();

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-8 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onPageChange(item.id)}
                className={`flex items-center space-x-2 py-4 px-2 border-b-2 transition-colors whitespace-nowrap ${
                  currentPage === item.id
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;