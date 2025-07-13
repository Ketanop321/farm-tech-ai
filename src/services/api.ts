import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Handle auth errors and responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      // Clear invalid token
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Only redirect if not already on login page
      if (window.location.pathname !== '/') {
        window.location.href = '/';
      }
    }
    
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData: any) => {
    console.log('Registering user:', userData);
    return api.post('/auth/register', userData);
  },
  login: (credentials: { email: string; password: string }) => {
    console.log('Logging in user:', credentials.email);
    return api.post('/auth/login', credentials);
  },
  getCurrentUser: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
};

// Products API
export const productsAPI = {
  getAll: (filters?: { category?: string; farmerId?: string }) => 
    api.get('/products', { params: filters }),
  getById: (id: string) => api.get(`/products/${id}`),
  create: (productData: FormData) => api.post('/products', productData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  update: (id: string, productData: FormData) => api.put(`/products/${id}`, productData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getCategories: () => api.get('/products/categories/all'),
};

// Orders API
export const ordersAPI = {
  create: (orderData: any) => {
    console.log('Creating order:', orderData);
    return api.post('/orders', orderData);
  },
  getAll: () => api.get('/orders'),
  getById: (id: string) => api.get(`/orders/${id}`),
  updateStatus: (id: string, status: string) => {
    console.log('Updating order status:', id, status);
    return api.patch(`/orders/${id}/status`, { status });
  },
};

// Chat API
export const chatAPI = {
  createChat: (farmerId: string) => {
    console.log('Creating chat with farmer:', farmerId);
    return api.post('/chat/create', { farmerId });
  },
  getMessages: (chatId: string) => api.get(`/chat/${chatId}/messages`),
  sendMessage: (chatId: string, content: string, type: string = 'text') => 
    api.post(`/chat/${chatId}/messages`, { content, type }),
  getUserChats: () => api.get('/chat/user-chats'),
};

// Admin API
export const adminAPI = {
  getDashboardStats: () => api.get('/admin/dashboard'),
  getAllUsers: () => api.get('/admin/users'),
  getAllOrders: () => api.get('/admin/orders'),
  getAllProducts: () => api.get('/admin/products'),
  approveFarmer: (farmerId: string) => api.patch(`/admin/farmers/${farmerId}/approve`),
};

export default api;