import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface LoginFormProps {
  onToggleForm: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onToggleForm }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, error } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      return;
    }

    try {
      await login(email, password);
    } catch (error) {
      // Error is handled by useAuth hook
      console.error('Login failed:', error);
    }
  };

  const fillDemoCredentials = (type: 'admin' | 'farmer' | 'buyer') => {
    switch (type) {
      case 'admin':
        setEmail('admin@farmmarket.com');
        setPassword('admin123');
        break;
      case 'farmer':
        setEmail('farmer3@example.com');
        setPassword('Pass789!');
        break;
      case 'buyer':
        setEmail('buyer3@example.com');
        setPassword('market789!');
        break;
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
        <p className="text-gray-600">Sign in to your account</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded flex items-center">
          <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter your email"
              disabled={isLoading}
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter your password"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              disabled={isLoading}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !email || !password}
          className="w-full bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Signing In...' : 'Sign In'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Don't have an account?{' '}
          <button
            onClick={onToggleForm}
            className="text-green-600 hover:text-green-700 font-medium"
            disabled={isLoading}
          >
            Sign up
          </button>
        </p>
        
        <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm">
          <p className="font-medium text-blue-800 mb-2">Demo Credentials:</p>
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => fillDemoCredentials('admin')}
              className="block w-full text-left text-blue-700 hover:text-blue-900 hover:bg-blue-100 px-2 py-1 rounded"
              disabled={isLoading}
            >
              Admin: admin@farmmarket.com / admin123
            </button>
            <button
              type="button"
              onClick={() => fillDemoCredentials('farmer')}
              className="block w-full text-left text-blue-700 hover:text-blue-900 hover:bg-blue-100 px-2 py-1 rounded"
              disabled={isLoading}
            >
              Farmer: farmer3@example.com / Pass789!
            </button>
            <button
              type="button"
              onClick={() => fillDemoCredentials('buyer')}
              className="block w-full text-left text-blue-700 hover:text-blue-900 hover:bg-blue-100 px-2 py-1 rounded"
              disabled={isLoading}
            >
              Buyer: buyer3@example.com / market789!
            </button>
          </div>
          <p className="text-blue-700 mt-2">Click any credential to auto-fill, or register as farmer/buyer</p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;