import { useState, useEffect, createContext, useContext } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const useAuthProvider = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // In a real app, verify token with backend
      try {
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        setUser(userData);
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    // Mock authentication - replace with real API call in production
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Check against registered user data
        const registeredUserData = localStorage.getItem('mockRegisteredUser');
        
        if (registeredUserData) {
          const registeredUser = JSON.parse(registeredUserData);
          
          if (email === registeredUser.email && password === registeredUser.password) {
            const mockUser: User = {
              id: registeredUser.id,
              name: `${registeredUser.firstName} ${registeredUser.lastName}`,
              email: registeredUser.email,
              role: registeredUser.role,
              avatar: `https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop`
            };
            
            const mockToken = 'mock-jwt-token-' + Date.now();
            
            localStorage.setItem('token', mockToken);
            localStorage.setItem('user', JSON.stringify(mockUser));
            setUser(mockUser);
            resolve();
          } else {
            reject(new Error('Invalid email or password. Please check your credentials.'));
          }
        } else {
          // Fallback for demo purposes - simple validation if no registered user
          const mockUser: User = {
            id: '1',
            name: 'John Doe',
            email: email,
            role: 'farmer',
            avatar: `https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop`
          };
          
          if (email && password.length >= 6) {
            const mockToken = 'mock-jwt-token-' + Date.now();
            
            localStorage.setItem('token', mockToken);
            localStorage.setItem('user', JSON.stringify(mockUser));
            setUser(mockUser);
            resolve();
          } else {
            reject(new Error('Invalid email or password. Password must be at least 6 characters.'));
          }
        }
      }, 1000); // Simulate network delay
    });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return {
    user,
    login,
    logout,
    isLoading,
  };
};

export { AuthContext };