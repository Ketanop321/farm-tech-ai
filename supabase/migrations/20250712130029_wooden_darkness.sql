/*
  # Initial Schema Setup for FarmMarket

  1. New Tables
    - `users` - User accounts (farmers, buyers, admins)
    - `farmers` - Extended farmer profiles
    - `categories` - Product categories
    - `products` - Farm products
    - `orders` - Customer orders
    - `order_items` - Individual items in orders
    - `chats` - Chat conversations between buyers and farmers
    - `messages` - Individual chat messages
    - `reviews` - Product and farmer reviews

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Secure data access based on user roles
*/

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password text NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  phone text,
  role text NOT NULL CHECK(role IN ('farmer', 'buyer', 'admin')),
  avatar text,
  is_verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Farmers table (extends users)
CREATE TABLE IF NOT EXISTS farmers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  farm_name text NOT NULL,
  farm_address text NOT NULL,
  license_number text,
  kyc_documents text,
  is_approved boolean DEFAULT false,
  account_balance numeric DEFAULT 0
);

ALTER TABLE farmers ENABLE ROW LEVEL SECURITY;

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id uuid NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  category text NOT NULL,
  price numeric NOT NULL,
  stock integer NOT NULL,
  images jsonb,
  unit text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  farmer_id uuid NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
  total_amount numeric NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  shipping_address jsonb NOT NULL,
  payment_status text NOT NULL DEFAULT 'pending',
  payment_method text,
  payment_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity integer NOT NULL,
  price numeric NOT NULL
);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Chats table
CREATE TABLE IF NOT EXISTS chats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  farmer_id uuid NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE chats ENABLE ROW LEVEL SECURITY;

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id uuid NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content text NOT NULL,
  type text NOT NULL DEFAULT 'text',
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  buyer_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  farmer_id uuid NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK(rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users policies
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Farmers policies
CREATE POLICY "Farmers can read own data"
  ON farmers
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Farmers can update own data"
  ON farmers
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Anyone can read approved farmers"
  ON farmers
  FOR SELECT
  TO authenticated
  USING (is_approved = true);

-- Categories policies
CREATE POLICY "Anyone can read categories"
  ON categories
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Products policies
CREATE POLICY "Anyone can read active products"
  ON products
  FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Farmers can manage own products"
  ON products
  FOR ALL
  TO authenticated
  USING (farmer_id IN (SELECT id FROM farmers WHERE user_id = auth.uid()));

-- Orders policies
CREATE POLICY "Users can read own orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (buyer_id = auth.uid() OR farmer_id IN (SELECT id FROM farmers WHERE user_id = auth.uid()));

CREATE POLICY "Buyers can create orders"
  ON orders
  FOR INSERT
  TO authenticated
  WITH CHECK (buyer_id = auth.uid());

CREATE POLICY "Farmers can update order status"
  ON orders
  FOR UPDATE
  TO authenticated
  USING (farmer_id IN (SELECT id FROM farmers WHERE user_id = auth.uid()));

-- Order items policies
CREATE POLICY "Users can read order items for their orders"
  ON order_items
  FOR SELECT
  TO authenticated
  USING (order_id IN (
    SELECT id FROM orders 
    WHERE buyer_id = auth.uid() 
    OR farmer_id IN (SELECT id FROM farmers WHERE user_id = auth.uid())
  ));

-- Chats policies
CREATE POLICY "Users can read own chats"
  ON chats
  FOR SELECT
  TO authenticated
  USING (buyer_id = auth.uid() OR farmer_id IN (SELECT id FROM farmers WHERE user_id = auth.uid()));

CREATE POLICY "Buyers can create chats"
  ON chats
  FOR INSERT
  TO authenticated
  WITH CHECK (buyer_id = auth.uid());

-- Messages policies
CREATE POLICY "Users can read messages in their chats"
  ON messages
  FOR SELECT
  TO authenticated
  USING (chat_id IN (
    SELECT id FROM chats 
    WHERE buyer_id = auth.uid() 
    OR farmer_id IN (SELECT id FROM farmers WHERE user_id = auth.uid())
  ));

CREATE POLICY "Users can send messages in their chats"
  ON messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = auth.uid() AND
    chat_id IN (
      SELECT id FROM chats 
      WHERE buyer_id = auth.uid() 
      OR farmer_id IN (SELECT id FROM farmers WHERE user_id = auth.uid())
    )
  );

-- Reviews policies
CREATE POLICY "Anyone can read reviews"
  ON reviews
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Buyers can create reviews for their orders"
  ON reviews
  FOR INSERT
  TO authenticated
  WITH CHECK (buyer_id = auth.uid());

-- Insert default categories
INSERT INTO categories (name, description) VALUES
  ('Vegetables', 'Fresh seasonal vegetables'),
  ('Fruits', 'Juicy fresh fruits'),
  ('Grains', 'Organic grains and cereals'),
  ('Dairy', 'Fresh dairy products'),
  ('Herbs', 'Fresh herbs and spices')
ON CONFLICT DO NOTHING;