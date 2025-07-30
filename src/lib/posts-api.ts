import { supabase } from './supabase';
import type { Post } from '@/types/database.types';

// Get posts by admin
export const getPostsByAdmin = async (adminId: string): Promise<Post[]> => {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('admin_id', adminId)
    .eq('published', true)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data as Post[];
};

// Get all public posts
export const getPublicPosts = async (): Promise<Post[]> => {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('visibility', 'public')
    .eq('published', true)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data as Post[];
};

// Get all published posts (for search)
export const getPublishedPosts = async (): Promise<Post[]> => {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data as Post[];
};

// Create a new post
export const createPost = async (postData: {
  content_type: Post['content_type'];
  title?: string;
  content_data: Post['content_data'];
  is_paid?: boolean;
  price?: number;
  visibility?: Post['visibility'];
}): Promise<Post> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('posts')
    .insert({
      admin_id: user.id,
      ...postData
    })
    .select()
    .single();
  
  if (error) throw error;
  return data as Post;
};

// Update post
export const updatePost = async (postId: string, updates: Partial<Post>): Promise<Post> => {
  const { data, error } = await supabase
    .from('posts')
    .update(updates)
    .eq('id', postId)
    .select()
    .single();
  
  if (error) throw error;
  return data as Post;
};

// Delete post
export const deletePost = async (postId: string): Promise<void> => {
  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', postId);
  
  if (error) throw error;
};
