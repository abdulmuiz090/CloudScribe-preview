
import { supabase } from '@/lib/supabase';

export async function followUser(followingId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('followers')
    .insert({
      follower_id: user.id,
      following_id: followingId,
    });

  if (error) throw error;
  return data;
}

export async function unfollowUser(followingId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('followers')
    .delete()
    .eq('follower_id', user.id)
    .eq('following_id', followingId);

  if (error) throw error;
}

export async function isFollowing(followingId: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data, error } = await supabase
    .from('followers')
    .select('id')
    .eq('follower_id', user.id)
    .eq('following_id', followingId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return !!data;
}

export async function getUserFollowers(userId: string) {
  const { data, error } = await supabase
    .from('followers')
    .select(`
      id,
      follower_id,
      created_at,
      follower:user_profiles!followers_follower_id_fkey(
        id,
        full_name,
        profile_image_url,
        role
      )
    `)
    .eq('following_id', userId);

  if (error) throw error;
  return data;
}

export async function getUserFollowing(userId: string) {
  const { data, error } = await supabase
    .from('followers')
    .select(`
      id,
      following_id,
      created_at,
      following:user_profiles!followers_following_id_fkey(
        id,
        full_name,
        profile_image_url,
        role
      )
    `)
    .eq('follower_id', userId);

  if (error) throw error;
  return data;
}

export async function getAdminUsers() {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .in('role', ['admin', 'super-admin'])
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

// Aliases for backward compatibility
export const getFollowers = getUserFollowers;
export const getFollowing = getUserFollowing;
