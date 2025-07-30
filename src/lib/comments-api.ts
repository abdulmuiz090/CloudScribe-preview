
import { supabase } from './supabase';

export interface Comment {
  id: string;
  content_id: string;
  content_type: 'post' | 'product' | 'blog' | 'template';
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  user_profiles?: {
    full_name: string;
    profile_image_url?: string;
  };
}

// Get comments for content
export const getComments = async (contentId: string, contentType: string): Promise<Comment[]> => {
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('content_id', contentId)
    .eq('content_type', contentType)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  
  // Map the data to include user profile information
  const commentsWithProfiles = await Promise.all(
    (data || []).map(async (comment) => {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('full_name, profile_image_url')
        .eq('id', comment.user_id)
        .single();
      
      return {
        ...comment,
        content_type: comment.content_type as 'post' | 'product' | 'blog' | 'template',
        user_profiles: profile || undefined
      };
    })
  );
  
  return commentsWithProfiles;
};

// Create a comment
export const createComment = async (
  contentId: string, 
  contentType: string, 
  content: string
): Promise<Comment> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('comments')
    .insert({
      content_id: contentId,
      content_type: contentType,
      user_id: user.id,
      content
    })
    .select()
    .single();
  
  if (error) throw error;
  
  // Get user profile for the created comment
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('full_name, profile_image_url')
    .eq('id', data.user_id)
    .single();
  
  return {
    ...data,
    content_type: data.content_type as 'post' | 'product' | 'blog' | 'template',
    user_profiles: profile || undefined
  };
};

// Update a comment
export const updateComment = async (commentId: string, content: string): Promise<Comment> => {
  const { data, error } = await supabase
    .from('comments')
    .update({ content, updated_at: new Date().toISOString() })
    .eq('id', commentId)
    .select()
    .single();
  
  if (error) throw error;
  
  // Get user profile for the updated comment
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('full_name, profile_image_url')
    .eq('id', data.user_id)
    .single();
  
  return {
    ...data,
    content_type: data.content_type as 'post' | 'product' | 'blog' | 'template',
    user_profiles: profile || undefined
  };
};

// Delete a comment
export const deleteComment = async (commentId: string): Promise<void> => {
  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', commentId);
  
  if (error) throw error;
};
