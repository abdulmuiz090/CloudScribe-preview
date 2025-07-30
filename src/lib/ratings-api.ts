
import { supabase } from './supabase';

export interface Rating {
  id: string;
  content_id: string;
  content_type: 'post' | 'product' | 'blog' | 'template';
  user_id: string;
  rating: number;
  comment?: string;
  created_at: string;
  updated_at: string;
  user_profiles?: {
    full_name: string;
    profile_image_url?: string;
  };
}

// Get ratings for content
export const getRatings = async (contentId: string, contentType: string): Promise<Rating[]> => {
  const { data, error } = await supabase
    .from('ratings')
    .select('*')
    .eq('content_id', contentId)
    .eq('content_type', contentType)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  
  // Map the data to include user profile information
  const ratingsWithProfiles = await Promise.all(
    (data || []).map(async (rating) => {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('full_name, profile_image_url')
        .eq('id', rating.user_id)
        .single();
      
      return {
        ...rating,
        content_type: rating.content_type as 'post' | 'product' | 'blog' | 'template',
        user_profiles: profile || undefined
      };
    })
  );
  
  return ratingsWithProfiles;
};

// Get average rating for content
export const getAverageRating = async (contentId: string, contentType: string): Promise<{ average: number; count: number }> => {
  const { data, error } = await supabase
    .from('ratings')
    .select('rating')
    .eq('content_id', contentId)
    .eq('content_type', contentType);
  
  if (error) throw error;
  
  if (!data || data.length === 0) {
    return { average: 0, count: 0 };
  }
  
  const sum = data.reduce((acc, rating) => acc + rating.rating, 0);
  const average = sum / data.length;
  
  return { average: Math.round(average * 10) / 10, count: data.length };
};

// Create or update a rating
export const upsertRating = async (
  contentId: string,
  contentType: string,
  rating: number,
  comment?: string
): Promise<Rating> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('ratings')
    .upsert({
      content_id: contentId,
      content_type: contentType,
      user_id: user.id,
      rating,
      comment,
      updated_at: new Date().toISOString()
    })
    .select()
    .single();
  
  if (error) throw error;
  
  // Get user profile for the rating
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

// Delete a rating
export const deleteRating = async (ratingId: string): Promise<void> => {
  const { error } = await supabase
    .from('ratings')
    .delete()
    .eq('id', ratingId);
  
  if (error) throw error;
};

// Get user's rating for content
export const getUserRating = async (contentId: string, contentType: string): Promise<Rating | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('ratings')
    .select('*')
    .eq('content_id', contentId)
    .eq('content_type', contentType)
    .eq('user_id', user.id)
    .single();
  
  if (error && error.code !== 'PGRST116') throw error;
  
  if (!data) return null;
  
  return {
    ...data,
    content_type: data.content_type as 'post' | 'product' | 'blog' | 'template'
  };
};
