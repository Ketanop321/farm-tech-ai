import axios from 'axios';
import { supabase } from '../lib/supabase';

const API_BASE_URL = 'http://localhost:3001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData: any) => api.post('/auth/register', userData),
  login: (credentials: { email: string; password: string }) => api.post('/auth/login', credentials),
  getCurrentUser: () => api.get('/auth/me'),
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
  create: (orderData: any) => api.post('/orders', orderData),
  getAll: () => api.get('/orders'),
  getById: (id: string) => api.get(`/orders/${id}`),
  updateStatus: (id: string, status: string) => {
    console.log('Updating order status:', id, status);
    return api.patch(`/orders/${id}/status`, { status });
  },
};

// Chat API
export const chatAPI = {
  createChat: (farmerId: string) => api.post('/chat/create', { farmerId }),
  getMessages: (chatId: string) => api.get(`/chat/${chatId}/messages`),
  sendMessage: (chatId: string, content: string, type: string = 'text') => 
    api.post(`/chat/${chatId}/messages`, { content, type }),
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