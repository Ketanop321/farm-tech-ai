export interface User {
  id: string;
  email: string;
  role: 'farmer' | 'buyer' | 'admin';
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Farmer extends User {
  role: 'farmer';
  farmName: string;
  farmAddress: string;
  licenseNumber?: string;
  kycDocuments?: string[];
  isVerified: boolean;
  accountBalance: number;
}

export interface Product {
  id: string;
  farmerId: string;
  title: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  images: string[];
  unit: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  farmer?: Farmer;
}

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  product: Product;
}

export interface Order {
  id: string;
  buyerId: string;
  farmerId: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: Address;
  paymentStatus: 'pending' | 'completed' | 'failed';
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
  buyer?: User;
  farmer?: Farmer;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
  product: Product;
}

export interface Address {
  id: string;
  userId: string;
  fullName: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export interface Chat {
  id: string;
  buyerId: string;
  farmerId: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  type: 'text' | 'image';
  timestamp: string;
  isRead: boolean;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  image?: string;
  isActive: boolean;
}

export interface Review {
  id: string;
  orderId: string;
  buyerId: string;
  farmerId: string;
  productId: string;
  rating: number;
  comment: string;
  createdAt: string;
}