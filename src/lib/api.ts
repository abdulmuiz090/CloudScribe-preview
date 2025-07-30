/**
 * API Library
 * Purpose: Centralized API functions for all platform operations
 * Features: User management, products, wallet, chat, notifications
 * Documentation: Each function includes purpose and usage examples
 */
import { supabase } from '@/integrations/supabase/client';

// Re-export existing API modules
export * from './admin-api';
export * from './auth';
export * from './profile-api';
export * from './follow-api';
export * from './posts-api';
export * from './spaces-api';
export * from './communities-api';
export * from './comments-api';
export * from './ratings-api';  
export * from './likes-api';

/**
 * User Role Management
 * Purpose: Check user permissions and roles
 */
export const checkUserRole = async (userId: string) => {
  const { data, error } = await supabase.rpc('get_user_role', { user_id: userId });
  if (error) throw error;
  return data;
};

/**
 * Product Management Functions
 * Purpose: Handle product CRUD operations with proper permissions
 */
export const getUserProducts = async (userId: string) => {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      category:product_categories(name)
    `)
    .eq('seller_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
};

export const getPublishedProducts = async () => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
};

export const getPublishedBlogs = async () => {
  const { data, error } = await supabase
    .from('blogs')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
};

export const getPublishedTemplates = async () => {
  const { data, error } = await supabase
    .from('templates')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
};

/**
 * User Profile Functions
 * Purpose: Manage user profiles and public data
 */
export const getUserById = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) throw error;
  
  return {
    ...data,
    social_links: data.social_links as any
  };
};

export const updateUserRole = async (userId: string, role: 'user' | 'admin' | 'super-admin') => {
  try {
    console.log(`Updating user ${userId} role to ${role}...`);
    
    const { data, error } = await supabase
      .from('user_profiles')
      .update({ 
        role: role,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating user role:', error);
      throw error;
    }

    console.log('User role updated successfully:', data);
    return data;
  } catch (error) {
    console.error('Error in updateUserRole:', error);
    throw error;
  }
};

export const demoteUserToRegular = async (userId: string) => {
  return updateUserRole(userId, 'user');
};

/**
 * Wallet Management Functions
 * Purpose: Handle wallet operations, payouts, and transactions
 * Integration: Paystack for Nigerian bank transfers
 */
export const getWalletBalance = async () => {
  const { data, error } = await supabase.functions.invoke('get-wallet-balance');
  if (error) throw error;
  return data;
};

export const getTransactionHistory = async (limit = 50, offset = 0, type?: string) => {
  const params = new URLSearchParams({
    limit: limit.toString(),
    offset: offset.toString()
  });
  
  if (type) params.append('type', type);
  
  const { data, error } = await supabase.functions.invoke('get-transactions', {
    body: { limit, offset, type }
  });
  
  if (error) throw error;
  return data;
};

export const requestPayout = async (amount: number, bankDetails: any) => {
  const { data, error } = await supabase.functions.invoke('request-payout', {
    body: { amount, bank_details: bankDetails }
  });
  
  if (error) throw error;
  return data;
};

/**
 * Chat System Functions
 * Purpose: Real-time messaging system with room management
 */
export const getChatRooms = async () => {
  const { data, error } = await supabase
    .from('chat_rooms')
    .select(`
      *,
      chat_room_members(count)
    `)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const joinChatRoom = async (roomId: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  // Check if already a member
  const { data: existingMember } = await supabase
    .from('chat_room_members')
    .select('id')
    .eq('room_id', roomId)
    .eq('user_id', user.id)
    .single();

  if (!existingMember) {
    const { error } = await supabase
      .from('chat_room_members')
      .insert({
        room_id: roomId,
        user_id: user.id,
        role: 'member'
      });

    if (error) throw error;
  }
};

export const getChatMessages = async (roomId: string, limit = 50) => {
  const { data, error } = await supabase
    .from('chat_messages')
    .select(`
      *,
      user_profiles!user_id(full_name, profile_image_url)
    `)
    .eq('room_id', roomId)
    .order('created_at', { ascending: true })
    .limit(limit);

  if (error) throw error;
  return data;
};

export const sendChatMessage = async (roomId: string, content: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { error } = await supabase
    .from('chat_messages')
    .insert({
      room_id: roomId,
      user_id: user.id,
      content: content.trim(),
      message_type: 'text'
    });

  if (error) throw error;
};

/**
 * Notification System Functions
 * Purpose: Handle user notifications with real-time updates
 */
export const getUserNotifications = async (limit = 10) => {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
};

export const markNotificationAsRead = async (notificationId: string) => {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', notificationId);

  if (error) throw error;
};

/**
 * Payment and Checkout Functions
 * Purpose: Handle product purchases with platform fee (10%)
 */
export const createCheckout = async (productId: string, quantity = 1) => {
  const { data, error } = await supabase.functions.invoke('create-checkout', {
    body: { product_id: productId, quantity }
  });

  if (error) throw error;
  return data;
};

/**
 * Real-time Subscription Helpers
 * Purpose: Set up real-time listeners for various data types
 */
export const subscribeToChatMessages = (roomId: string, callback: (message: any) => void) => {
  return supabase
    .channel(`chat-messages-${roomId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `room_id=eq.${roomId}`
      },
      callback
    )
    .subscribe();
};

export const subscribeToWalletTransactions = (userId: string, callback: (transaction: any) => void) => {
  return supabase
    .channel('wallet-transactions')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'wallet_transactions',
        filter: `user_id=eq.${userId}`
      },
      callback
    )
    .subscribe();
};

export const subscribeToNotifications = (userId: string, callback: (notification: any) => void) => {
  return supabase
    .channel('user-notifications')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`
      },
      callback
    )
    .subscribe();
};

/**
 * Platform Statistics Functions
 * Purpose: Get platform-wide metrics and analytics
 */
export const getPlatformStats = async () => {
  const { data, error } = await supabase.rpc('get_admin_stats');
  if (error) throw error;
  return data;
};
