import { supabase } from './supabase';

// Authentication functions
export const signInWithEmail = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    return { data, error };
  } catch (error) {
    console.error('Error signing in with email:', error);
    throw error;
  }
};

export const signUpWithEmail = async (email: string, password: string, fullName: string) => {
  try {
    // Register the user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) throw error;

    // If registration successful, create a profile for the user
    if (data?.user) {
      await createUserProfile(data.user.id, {
        full_name: fullName,
        email: email,
      });
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error signing up with email:', error);
    throw error;
  }
};

export const signInWithGoogle = async () => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
    
    return { data, error };
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

// User profile functions
export const getUserProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    return { data, error };
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
};

export const createUserProfile = async (userId: string, profileData: any) => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .insert([
        {
          id: userId,
          full_name: profileData.full_name,
          email: profileData.email,
          role: 'user', // Default role
        },
      ])
      .select()
      .single();
    
    return { data, error };
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
};

// Admin-related functions
export const checkUserRole = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    
    return data?.role || 'user';
  } catch (error) {
    console.error('Error checking user role:', error);
    return 'user'; // Default to user role on error
  }
};

export const checkAndSetupFirstUser = async (userId: string) => {
  try {
    // Check if there are any users in the user_profiles table
    const { count, error } = await supabase
      .from('user_profiles')
      .select('*', { count: 'exact', head: true });
    
    if (error) throw error;
    
    // If this is the first user (count === 1), make them a super-admin
    if (count === 1) {
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ role: 'super-admin' })
        .eq('id', userId);
      
      if (updateError) throw updateError;
      
      return true; // This is the first user
    }
    
    return false; // Not the first user
  } catch (error) {
    console.error('Error checking/setting up first user:', error);
    return false;
  }
};

export const checkAdminRequestStatus = async (userId: string) => {
  return getMyAdminRequestStatus(userId);
};

export const createAdminRequest = async (userId: string) => {
  return submitAdminRequest(userId);
};

// Updated getAdminRequests function that fetches requests and user profiles separately
export const getAdminRequests = async () => {
  try {
    console.log('Fetching admin requests...');
    
    // Get all admin requests
    const { data: requests, error } = await supabase
      .from('admin_requests')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching admin requests:', error);
      throw new Error(`Failed to load admin requests: ${error.message}`);
    }
    
    if (!requests || requests.length === 0) {
      console.log('No admin requests found');
      return [];
    }
    
    console.log(`Found ${requests.length} admin requests`);
    
    // Extract user IDs from requests
    const userIds = requests.map(request => request.user_id);
    
    // Fetch user profiles for those users
    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('id, full_name, email, profile_image_url')
      .in('id', userIds);
    
    if (profilesError) {
      console.error('Error fetching user profiles:', profilesError);
      throw new Error(`Failed to load user profiles: ${profilesError.message}`);
    }
    
    // Create a map of user IDs to profiles for easy lookup
    const profileMap: Record<string, any> = {};
    profiles?.forEach(profile => {
      profileMap[profile.id] = profile;
    });
    
    // Combine the requests with their user profiles
    const formattedRequests = requests.map(request => {
      const userProfile = profileMap[request.user_id] || {
        full_name: 'Unknown User',
        email: 'unknown@example.com',
        profile_image_url: null
      };
      
      return {
        ...request,
        user_profiles: userProfile
      };
    });
    
    console.log('Admin requests processed successfully:', formattedRequests);
    
    return formattedRequests;
  } catch (error) {
    console.error('Error in getAdminRequests:', error);
    throw error;
  }
};

// Updated updateAdminRequestStatus function that handles the user profile separately
export const updateAdminRequestStatus = async (requestId: string, status: 'approved' | 'rejected') => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    console.log(`Processing admin request ${requestId} with status ${status}...`);
    
    const { data, error } = await supabase.rpc('process_admin_request', {
      request_id: requestId,
      new_status: status,
      admin_id: user.id
    });

    if (error) {
      console.error('Error processing admin request:', error);
      throw error;
    }

    console.log('Admin request processed successfully:', data);
    return data;
  } catch (error) {
    console.error('Error in updateAdminRequestStatus:', error);
    throw error;
  }
};

export const submitAdminRequest = async (userId: string) => {
  try {
    // Check if there's already a pending request
    const { data: existingRequests, error: checkError } = await supabase
      .from('admin_requests')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'pending');
    
    if (checkError) throw checkError;
    
    // If a pending request already exists, don't submit another one
    if (existingRequests && existingRequests.length > 0) {
      return { 
        message: 'You already have a pending admin request', 
        request: existingRequests[0] 
      };
    }
    
    // Submit a new request
    const { data, error } = await supabase
      .from('admin_requests')
      .insert({
        user_id: userId,
        status: 'pending'
      })
      .select('*')
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error submitting admin request:', error);
    throw error;
  }
};

export const getMyAdminRequestStatus = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('admin_requests')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (error) {
      // If no rows were returned, there's no admin request
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }
    
    return data?.status || null;
  } catch (error) {
    console.error('Error checking admin request status:', error);
    return null;
  }
};
