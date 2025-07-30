import { supabase } from '@/integrations/supabase/client';
import { UserProfile, Blog, Video, Template, Product, Feedback } from '@/types/database.types';

// Template Categories
export const getTemplateCategories = async () => {
  const { data, error } = await supabase
    .from('template_categories')
    .select('*')
    .order('name');
  
  if (error) throw error;
  return data;
};

// Product Categories
export const getProductCategories = async () => {
  const { data, error } = await supabase
    .from('product_categories')
    .select('*')
    .order('name');
  
  if (error) throw error;
  return data;
};

// Admin Statistics
export const getAdminStats = async () => {
  const { data, error } = await supabase.rpc('get_admin_stats');
  if (error) throw error;
  return data;
};

// User Management (Super-admin only)
export const getUsers = async (): Promise<UserProfile[]> => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  
  return data.map(user => ({
    ...user,
    social_links: user.social_links as UserProfile['social_links']
  })) as UserProfile[];
};

export const updateUserRole = async (userId: string, role: 'admin' | 'user') => {
  const { data, error } = await supabase
    .from('user_profiles')
    .update({ role })
    .eq('id', userId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const deleteUser = async (userId: string) => {
  const { error } = await supabase
    .from('user_profiles')
    .delete()
    .eq('id', userId);
  
  if (error) throw error;
};

// Blog Management
export const getBlogs = async (): Promise<Blog[]> => {
  const { data, error } = await supabase
    .from('blogs')
    .select(`
      *,
      author:user_profiles(full_name, email)
    `)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
};

// Admin-specific blog queries (user's own content)
export const getMyBlogs = async (): Promise<Blog[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('blogs')
    .select(`
      *,
      author:user_profiles(full_name, email)
    `)
    .eq('author_id', user.id)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
};

export const createBlog = async (blog: Omit<Blog, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('blogs')
    .insert(blog)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const updateBlog = async (id: string, updates: Partial<Blog>) => {
  const { data, error } = await supabase
    .from('blogs')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const deleteBlog = async (id: string) => {
  const { error } = await supabase
    .from('blogs')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

// Video Management
export const getVideos = async (): Promise<Video[]> => {
  const { data, error } = await supabase
    .from('videos')
    .select(`
      *,
      author:user_profiles(full_name, email)
    `)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
};

// Admin-specific video queries (user's own content)
export const getMyVideos = async (): Promise<Video[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('videos')
    .select(`
      *,
      author:user_profiles(full_name, email)
    `)
    .eq('author_id', user.id)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
};

export const createVideo = async (video: Omit<Video, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('videos')
    .insert(video)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const updateVideo = async (id: string, updates: Partial<Video>) => {
  const { data, error } = await supabase
    .from('videos')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const deleteVideo = async (id: string) => {
  const { error } = await supabase
    .from('videos')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

// Template Management
export const getTemplates = async (): Promise<Template[]> => {
  const { data, error } = await supabase
    .from('templates')
    .select(`
      *,
      author:user_profiles(full_name, email)
    `)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
};

// Admin-specific template queries (user's own content)
export const getMyTemplates = async (): Promise<Template[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('templates')
    .select(`
      *,
      author:user_profiles(full_name, email)
    `)
    .eq('author_id', user.id)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
};

export const createTemplate = async (templateData: {
  name: string;
  description: string;
  author_id: string;
  category_id?: string;
  file_url?: string;
  preview_image_url?: string;
  watermarked_preview_url?: string;
  is_free?: boolean;
  price?: number;
  discount_price?: number;
  discount_percentage?: number;
  discount_end_date?: string;
  currency?: string;
  supports_international?: boolean;
  published?: boolean;
  tags?: string[];
  license_type?: string;
  demo_url?: string | null;
  instructions_url?: string | null;
  file_size?: number;
  file_type?: string;
  max_file_size_mb?: number;
  post_purchase_questions?: Array<{question: string; type: 'text' | 'textarea' | 'select' | 'rating'; required: boolean; options?: string[]}>;
  cta_buttons?: Array<{text: string; url: string; style: 'primary' | 'secondary' | 'outline'}>;
}) => {
  const { data, error } = await supabase
    .from('templates')
    .insert(templateData)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const updateTemplate = async (id: string, updates: Partial<Template>) => {
  const { data, error } = await supabase
    .from('templates')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const deleteTemplate = async (id: string) => {
  const { error } = await supabase
    .from('templates')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

// Product Management
export const getProducts = async (): Promise<Product[]> => {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      seller:user_profiles(full_name, email),
      category:product_categories(name)
    `)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
};

// Admin-specific product queries (user's own content)
export const getMyProducts = async (): Promise<Product[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      seller:user_profiles(full_name, email),
      category:product_categories(name)
    `)
    .eq('seller_id', user.id)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
};

export const createProduct = async (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('products')
    .insert(product)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const updateProduct = async (id: string, updates: Partial<Product>) => {
  const { data, error } = await supabase
    .from('products')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const deleteProduct = async (id: string) => {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};


// Feedback Management
export const getFeedback = async (): Promise<Feedback[]> => {
  const { data, error } = await supabase
    .from('feedback')
    .select(`
      *,
      user:user_profiles(full_name, email)
    `)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
};

export const updateFeedbackStatus = async (id: string, status: string) => {
  const { data, error } = await supabase
    .from('feedback')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};
