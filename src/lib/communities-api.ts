
import { supabase } from './supabase';
import type { Community, CommunityMember } from '@/types/database.types';

// Get all published communities
export const getPublishedCommunities = async (): Promise<Community[]> => {
  const { data, error } = await supabase
    .from('communities')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
};

// Get community by ID
export const getCommunityById = async (communityId: string): Promise<Community | null> => {
  const { data, error } = await supabase
    .from('communities')
    .select('*')
    .eq('id', communityId)
    .maybeSingle();
  
  if (error) throw error;
  return data;
};

// Get communities by admin
export const getCommunitiesByAdmin = async (adminId: string): Promise<Community[]> => {
  const { data, error } = await supabase
    .from('communities')
    .select('*')
    .eq('admin_id', adminId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
};

// Create a new community
export const createCommunity = async (communityData: {
  name: string;
  description?: string;
  topic?: string;
  tags?: string[];
  banner_url?: string;
}): Promise<Community> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('communities')
    .insert({
      admin_id: user.id,
      ...communityData
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

// Update community
export const updateCommunity = async (communityId: string, updates: Partial<Community>): Promise<Community> => {
  const { data, error } = await supabase
    .from('communities')
    .update(updates)
    .eq('id', communityId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

// Join community
export const joinCommunity = async (communityId: string): Promise<CommunityMember> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('community_members')
    .insert({
      community_id: communityId,
      user_id: user.id
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

// Leave community
export const leaveCommunity = async (communityId: string): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { error } = await supabase
    .from('community_members')
    .delete()
    .eq('community_id', communityId)
    .eq('user_id', user.id);
  
  if (error) throw error;
};

// Check if user is member of community
export const isUserMemberOfCommunity = async (communityId: string, userId: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from('community_members')
    .select('id')
    .eq('community_id', communityId)
    .eq('user_id', userId)
    .maybeSingle();
  
  if (error) throw error;
  return !!data;
};

// Get community members
export const getCommunityMembers = async (communityId: string): Promise<CommunityMember[]> => {
  const { data, error } = await supabase
    .from('community_members')
    .select('*')
    .eq('community_id', communityId)
    .order('joined_at', { ascending: false });
  
  if (error) throw error;
  return data;
};
