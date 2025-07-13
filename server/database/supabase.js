import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create Supabase client with service role key for server operations
const supabase = createClient(supabaseUrl, supabaseServiceKey);

class SupabaseDatabase {
  constructor() {
    this.supabase = supabase;
    this.init();
  }

  async init() {
    // Initialize default admin user if not exists
    await this.insertAdminUser();
  }

  async insertAdminUser() {
    try {
      const { data: existingAdmin } = await this.supabase
        .from('users')
        .select('id')
        .eq('email', 'admin@farmmarket.com')
        .single();

      if (!existingAdmin) {
        const hashedPassword = await bcrypt.hash('admin123', 10);

        const { error } = await this.supabase
          .from('users')
          .insert({
            email: 'admin@farmmarket.com',
            password: hashedPassword,
            firstName: 'Admin',
            lastName: 'User',
            role: 'admin',
            is_verified: true
          });

        if (error) {
          console.error('Error creating admin user:', error);
        } else {
          console.log('Admin user created successfully');
        }
      }
    } catch (error) {
      console.error('Error checking/creating admin user:', error);
    }
  }

  // User methods
  async createUser(userData) {
    const { data, error } = await this.supabase
      .from('users')
      .insert({
        email: userData.email,
        password: userData.password,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
        role: userData.role
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getUserByEmail(email) {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async getUserById(id) {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  // Farmer methods
  async createFarmer(farmerData) {
    const { data, error } = await this.supabase
      .from('farmers')
      .insert({
        user_id: farmerData.userId,
        farm_name: farmerData.farmName,
        farm_address: farmerData.farmAddress,
        license_number: farmerData.licenseNumber
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getFarmerByUserId(userId) {
    const { data, error } = await this.supabase
      .from('farmers')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async approveFarmer(farmerId) {
    const { error } = await this.supabase
      .from('farmers')
      .update({ is_approved: true })
      .eq('id', farmerId);

    if (error) throw error;
    return true;
  }

  // Product methods
  async createProduct(productData) {
    const { data, error } = await this.supabase
      .from('products')
      .insert({
        farmer_id: productData.farmerId,
        title: productData.title,
        description: productData.description,
        category: productData.category,
        price: productData.price,
        stock: productData.stock,
        images: productData.images,
        unit: productData.unit
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getProducts(filters = {}) {
    let query = this.supabase
      .from('products')
      .select(`
        *,
        farmers!inner(
          id,
          farm_name,
          users!inner(
            firstName,
            lastName
          )
        )
      `)
      .eq('is_active', true);

    if (filters.category) {
      query = query.eq('category', filters.category);
    }

    if (filters.farmerId) {
      query = query.eq('farmer_id', filters.farmerId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;

    // Transform data to match expected format
    return data.map(product => ({
      ...product,
      farmerId: product.farmer_id,
      farmName: product.farmers.farm_name,
      firstName: product.farmers.users.firstName,
      lastName: product.farmers.users.lastName
    }));
  }

  async getProductById(id) {
    const { data, error } = await this.supabase
      .from('products')
      .select(`
        *,
        farmers!inner(
          id,
          farm_name,
          users!inner(
            firstName,
            lastName
          )
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    return {
      ...data,
      farmerId: data.farmer_id,
      farmName: data.farmers.farm_name,
      firstName: data.farmers.users.firstName,
      lastName: data.farmers.users.lastName
    };
  }

  async updateProduct(id, updates) {
    const { data, error } = await this.supabase
      .from('products')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Order methods
  async createOrder(orderData) {
    const { data, error } = await this.supabase
      .from('orders')
      .insert({
        buyer_id: orderData.buyerId,
        farmer_id: orderData.farmerId,
        total_amount: orderData.totalAmount,
        shipping_address: orderData.shippingAddress,
        payment_method: orderData.paymentMethod
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async createOrderItem(itemData) {
    const { data, error } = await this.supabase
      .from('order_items')
      .insert({
        order_id: itemData.orderId,
        product_id: itemData.productId,
        quantity: itemData.quantity,
        price: itemData.price
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getOrdersByUserId(userId, role) {
    let query;

    if (role === 'farmer') {
      query = this.supabase
        .from('orders')
        .select(`
          *,
          users!orders_buyer_id_fkey(firstName, lastName)
        `)
        .eq('farmer_id', userId);
    } else {
      query = this.supabase
        .from('orders')
        .select(`
          *,
          farmers!orders_farmer_id_fkey(farm_name)
        `)
        .eq('buyer_id', userId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(order => ({
      ...order,
      buyerFirstName: order.users?.firstName,
      buyerLastName: order.users?.lastName,
      farmName: order.farmers?.farm_name
    }));
  }

  async getOrderItems(orderId) {
    const { data, error } = await this.supabase
      .from('order_items')
      .select(`
        *,
        products(title, images)
      `)
      .eq('order_id', orderId);

    if (error) throw error;
    return data;
  }

  async updateOrderStatus(orderId, status) {
    const { error } = await this.supabase
      .from('orders')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId);

    if (error) throw error;
    return true;
  }

  // Chat methods
  async createChat(chatData) {
    const { data, error } = await this.supabase
      .from('chats')
      .insert({
        buyer_id: chatData.buyerId,
        farmer_id: chatData.farmerId
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getChatByUsers(buyerId, farmerId) {
    const { data, error } = await this.supabase
      .from('chats')
      .select('*')
      .eq('buyer_id', buyerId)
      .eq('farmer_id', farmerId)
      .limit(1)
      .maybeSingle();  // ✅ safer than `.single()`

    if (error) {
      console.error('❌ Error in getChatByUsers:', error);
      throw error;
    }

    return data;
  }


  async createMessage(messageData) {
    console.log('🛠️ Creating message with data:', messageData);

    // 1. Get chat participants
    const { data: chat, error: chatError } = await this.supabase
      .from('chats')
      .select('buyer_id, farmer_id')
      .eq('id', messageData.chatId)
      .single();

    if (chatError) {
      console.error('❌ Error fetching chat participants:', chatError);
      throw chatError;
    }

    console.log('👥 Chat participants:', chat);

    // 2. Determine receiver_id properly
    let receiver_id;

    if (messageData.senderId === chat.buyer_id) {
      // Sender is buyer → resolve farmer's user_id
      const { data: farmer, error: farmerError } = await this.supabase
        .from('farmers')
        .select('user_id')
        .eq('id', chat.farmer_id)
        .single();

      if (farmerError) {
        console.error('❌ Failed to fetch farmer user_id:', farmerError);
        throw farmerError;
      }

      receiver_id = farmer.user_id;
    } else {
      // Sender is farmer → receiver is buyer
      receiver_id = chat.buyer_id;
    }

    console.log('🎯 Resolved receiver_id:', receiver_id);

    // 3. Insert message
    const { data: message, error: messageError } = await this.supabase
      .from('messages')
      .insert({
        chat_id: messageData.chatId,
        sender_id: messageData.senderId,
        receiver_id,
        content: messageData.content,
        type: messageData.type || 'text',
        is_read: false
      })
      .select()
      .single();

    if (messageError) {
      console.error('❌ Error inserting message:', messageError);
      throw messageError;
    }

    console.log('✅ Message inserted:', message);

    // 4. Update chat timestamp
    const { error: updateError } = await this.supabase
      .from('chats')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', messageData.chatId);

    if (updateError) {
      console.warn('⚠️ Failed to update chat updated_at:', updateError);
    } else {
      console.log('📅 Chat updated_at refreshed');
    }

    return message;
  }


  async getMessages(chatId) {
    console.log("📥 Fetching messages for chat ID:", chatId);

    const { data, error } = await this.supabase
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error("❌ Error fetching messages:", error);
      throw error;
    }

    console.log(`📦 ${data.length} messages fetched`);
    return data;
  }



async getChatsByUser(userId) {
  console.log('📥 Fetching chats for user ID:', userId);

  const { data, error } = await this.supabase
    .from('chats')
    .select(`
      *,
      messages (
        id,
        content,
        sender_id,
        receiver_id,
        is_read,
        created_at
      ),
      farmers (
        farm_name,
        user_id,
        users (
          firstName,
          lastName,
          avatar
        )
      )
    `)
    .or(`buyer_id.eq.${userId},farmer_id.eq.${userId}`)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('❌ Error fetching chats:', error);
    throw error;
  }

  console.log(`💬 ${data.length} chats fetched`);

  const mappedChats = data.map(chat => {
    const messages = chat.messages || [];
    const lastMsg = messages[messages.length - 1];

    const unreadCount = messages.filter(
      m => m.receiver_id === userId && !m.is_read
    ).length;

    const farmerUser = chat.farmers?.users;

    const farmerName = farmerUser
      ? `${farmerUser.firstName} ${farmerUser.lastName}`
      : chat.farmers?.farm_name || 'Farmer';

    const avatar = farmerUser?.avatar || null;

    return {
      id: chat.id,
      farmerId: chat.farmer_id,
      farmerName,
      avatar,
      lastMessage: lastMsg?.content || '',
      lastMessageTime: lastMsg?.created_at || chat.updated_at,
      unreadCount
    };
  });

  return mappedChats;
}


  async getAllUsers() {
    const { data, error } = await this.supabase
      .from('users')
      .select('*');

    if (error) throw error;
    return data;
  }


  async getChatById(chatId) {
    const { data, error } = await this.supabase
      .from('chats')
      .select('*')
      .eq('id', chatId)
      .single();

    if (error) {
      console.error('❌ Error in getChatById:', error);
      throw error;
    }

    return data;
  }




  // Admin methods
  async getAllUsers() {
    const { data, error } = await this.supabase
      .from('users')
      .select(`
        *,
        farmers(*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(user => ({
      ...user,
      farmName: user.farmers?.[0]?.farm_name,
      farmAddress: user.farmers?.[0]?.farm_address,
      licenseNumber: user.farmers?.[0]?.license_number,
      isVerified: user.farmers?.[0]?.is_approved || user.is_verified
    }));
  }

  async getAllOrders() {
    const { data, error } = await this.supabase
      .from('orders')
      .select(`
        *,
        users!orders_buyer_id_fkey(firstName, lastName),
        farmers!orders_farmer_id_fkey(farm_name)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(order => ({
      ...order,
      buyerFirstName: order.users.firstName,
      buyerLastName: order.users.lastName,
      farmName: order.farmers.farm_name
    }));
  }

  async getCategories() {
    const { data, error } = await this.supabase
      .from('categories')
      .select('*')
      .eq('is_active', true);

    if (error) throw error;
    return data;
  }
}

export default SupabaseDatabase;