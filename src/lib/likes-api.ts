
import { supabase } from './supabase';

export interface Like {
  id: string;
  content_id: string;
  content_type: 'post' | 'product' | 'blog' | 'template';
  user_id: string;
  created_at: string;
}

// Check if user has liked content
export const hasUserLiked = async (contentId: string, contentType: string): Promise<boolean> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data, error } = await supabase
    .from('likes')
    .select('id')
    .eq('content_id', contentId)
    .eq('content_type', contentType)
    .eq('user_id', user.id)
    .single();
  
  if (error && error.code !== 'PGRST116') throw error;
  return !!data;
};

// Get like count for content
export const getLikeCount = async (contentId: string, contentType: string): Promise<number> => {
  const { count, error } = await supabase
    .from('likes')
    .select('*', { count: 'exact', head: true })
    .eq('content_id', contentId)
    .eq('content_type', contentType);
  
  if (error) throw error;
  return count || 0;
};

// Toggle like (like/unlike)
export const toggleLike = async (contentId: string, contentType: string): Promise<boolean> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  // Check if already liked
  const { data: existingLike, error: checkError } = await supabase
    .from('likes')
    .select('id')
    .eq('content_id', contentId)
    .eq('content_type', contentType)
    .eq('user_id', user.id)
    .single();
  
  if (checkError && checkError.code !== 'PGRST116') throw checkError;

  if (existingLike) {
    // Unlike
    const { error } = await supabase
      .from('likes')
      .delete()
      .eq('id', existingLike.id);
    
    if (error) throw error;
    return false;
  } else {
    // Like
    const { error } = await supabase
      .from('likes')
      .insert({
        content_id: contentId,
        content_type: contentType,
        user_id: user.id
      });
    
    if (error) throw error;
    return true;
  }
};
