import React, { useState, useRef, useEffect } from 'react';
import { ShoppingCart, Search, User, Menu, Leaf, LogOut, Settings, Heart } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface HeaderProps {
  onCartClick: () => void;
  cartItemCount: number;
  onPageChange: (page: string) => void;
}

const Header: React.FC<HeaderProps> = ({ onCartClick, cartItemCount, onPageChange }) => {
  const { user, logout } = useAuth();
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setIsProfileDropdownOpen(false);
  };

  const handleProfileClick = () => {
    onPageChange('profile');
    setIsProfileDropdownOpen(false);
  };

  const handleSettingsClick = () => {
    onPageChange('settings');
    setIsProfileDropdownOpen(false);
  };

  const handleFavoritesClick = () => {
    onPageChange('favorites');
    setIsProfileDropdownOpen(false);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={() => onPageChange('home')}>
              <Leaf className="h-8 w-8 text-green-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">FarmMarket</span>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-lg mx-8">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search fresh produce..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-full leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Favorites */}
            {user && user.role === 'buyer' && (
              <button
                onClick={handleFavoritesClick}
                className="p-2 text-gray-600 hover:text-green-600 transition-colors"
              >
                <Heart className="h-6 w-6" />
              </button>
            )}

            {/* Cart */}
            {user && user.role === 'buyer' && (
              <button
                onClick={onCartClick}
                className="relative p-2 text-gray-600 hover:text-green-600 transition-colors"
              >
                <ShoppingCart className="h-6 w-6" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </button>
            )}

            {/* User Menu */}
            <div className="relative" ref={dropdownRef}>
              <button 
                className="flex items-center space-x-1 text-gray-600 hover:text-green-600 transition-colors"
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                onMouseEnter={() => setIsProfileDropdownOpen(true)}
              >
                <User className="h-6 w-6" />
                <span className="text-sm font-medium">
                  {user ? `${user.firstName} ${user.lastName}` : 'Sign In'}
                </span>
              </button>

              {/* Dropdown Menu */}
              {isProfileDropdownOpen && user && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border">
                  <div className="px-4 py-2 text-sm text-gray-700 border-b">
                    <p className="font-medium">{user.firstName} {user.lastName}</p>
                    <p className="text-gray-500">{user.email}</p>
                    <p className="text-xs text-green-600 capitalize">{user.role}</p>
                  </div>
                  
                  <button
                    onClick={handleProfileClick}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Profile
                  </button>
                  
                  <button
                    onClick={handleSettingsClick}
                    className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </button>
                  
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button className="md:hidden p-2 text-gray-600 hover:text-green-600">
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;