
import { supabase } from './supabase';
import type { Space } from '@/types/database.types';

// Get user's space
export const getUserSpace = async (userId: string): Promise<Space | null> => {
  const { data, error } = await supabase
    .from('spaces')
    .select('*')
    .eq('admin_id', userId)
    .maybeSingle();
  
  if (error) throw error;
  return data;
};

// Get space by ID
export const getSpaceById = async (spaceId: string): Promise<Space | null> => {
  const { data, error } = await supabase
    .from('spaces')
    .select('*')
    .eq('id', spaceId)
    .maybeSingle();
  
  if (error) throw error;
  return data;
};

// Create a new space
export const createSpace = async (spaceData: {
  name: string;
  description?: string;
  banner_url?: string;
}): Promise<Space> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('spaces')
    .insert({
      admin_id: user.id,
      ...spaceData
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

// Update space
export const updateSpace = async (spaceId: string, updates: Partial<Space>): Promise<Space> => {
  const { data, error } = await supabase
    .from('spaces')
    .update(updates)
    .eq('id', spaceId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

// Get all published spaces
export const getPublishedSpaces = async (): Promise<Space[]> => {
  const { data, error } = await supabase
    .from('spaces')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
};
