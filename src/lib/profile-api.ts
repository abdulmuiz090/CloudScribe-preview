import { supabase } from '@/integrations/supabase/client';
import { UserProfile, Testimonial } from '@/types/database.types';

export const getUserByUsername = async (username: string): Promise<UserProfile | null> => {
  console.log('Looking for user with username:', username);
  
  // First try to find by username
  let { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('username', username)
    .maybeSingle();
  
  // If not found by username, try to find by email prefix (for backwards compatibility)
  if (!data && !error) {
    console.log('Not found by username, trying email prefix...');
    const { data: emailData, error: emailError } = await supabase
      .from('user_profiles')
      .select('*')
      .ilike('email', `${username}@%`)
      .maybeSingle();
    
    if (emailError) {
      console.error('Error fetching user by email:', emailError);
      return null;
    }
    
    data = emailData;
  } else if (error) {
    console.error('Error fetching user by username:', error);
    return null;
  }
  
  if (!data) {
    console.log('No user found for username:', username);
    return null;
  }
  
  console.log('Found user:', data);
  return data as UserProfile;
};

export const updateUserProfile = async (userId: string, updates: Partial<UserProfile>) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)
    .select()
    .single();
  
  if (error) throw error;
  return data as UserProfile;
};

export const uploadProfileImage = async (userId: string, file: File) => {
  const fileExt = file.name.split('.').pop();
  const filePath = `${userId}/avatar/${Math.random().toString(36).substring(2)}.${fileExt}`;
  
  const { data, error } = await supabase
    .storage
    .from('profile_images')
    .upload(filePath, file);
  
  if (error) throw error;
  
  const { data: { publicUrl } } = supabase
    .storage
    .from('profile_images')
    .getPublicUrl(filePath);
  
  return publicUrl;
};

export const uploadBannerImage = async (userId: string, file: File) => {
  const fileExt = file.name.split('.').pop();
  const filePath = `${userId}/banner/${Math.random().toString(36).substring(2)}.${fileExt}`;
  
  const { data, error } = await supabase
    .storage
    .from('profile_images')
    .upload(filePath, file);
  
  if (error) throw error;
  
  const { data: { publicUrl } } = supabase
    .storage
    .from('profile_images')
    .getPublicUrl(filePath);
  
  return publicUrl;
};

export const getTestimonials = async (profileId: string) => {
  const { data, error } = await supabase
    .from('testimonials')
    .select('*')
    .eq('profile_id', profileId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data as Testimonial[];
};

export const createTestimonial = async (testimonial: Omit<Testimonial, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('testimonials')
    .insert(testimonial)
    .select()
    .single();
  
  if (error) throw error;
  return data as Testimonial;
};
