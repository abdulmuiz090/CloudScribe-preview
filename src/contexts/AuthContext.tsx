
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { UserProfile } from '@/types/database.types';

type UserRole = 'super-admin' | 'admin' | 'user';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userProfile: UserProfile | null;
  userRole: UserRole;
  isLoading: boolean;
  adminRequestStatus: string | null;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  requestAdminAccess: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userRole, setUserRole] = useState<UserRole>('user');
  const [isLoading, setIsLoading] = useState(true);
  const [adminRequestStatus, setAdminRequestStatus] = useState<string | null>(null);
  const { toast } = useToast();

  const getUserRole = async (userId: string): Promise<UserRole> => {
    try {
      console.log('Fetching user role for:', userId);
      const { data, error } = await supabase.rpc('get_user_role', { user_id: userId });
      if (error) {
        console.error('Error fetching user role:', error);
        return 'user';
      }
      console.log('User role fetched:', data);
      return data || 'user';
    } catch (error) {
      console.error('Error in getUserRole:', error);
      return 'user';
    }
  };

  const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
      console.log('Fetching user profile for:', userId);
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        if (error.code === 'PGRST116') {
          console.log('No profile found, will be created by trigger');
          return null;
        }
        return null;
      }
      
      console.log('User profile fetched:', data);
      return data as UserProfile;
    } catch (error) {
      console.error('Error in getUserProfile:', error);
      return null;
    }
  };

  const getAdminRequestStatus = async (userId: string): Promise<string | null> => {
    try {
      const { data, error } = await supabase
        .from('admin_requests')
        .select('status')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching admin request status:', error);
        return null;
      }

      return data?.status || null;
    } catch (error) {
      console.error('Error in getAdminRequestStatus:', error);
      return null;
    }
  };

  const requestAdminAccess = async () => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { error } = await supabase
        .from('admin_requests')
        .insert({
          user_id: user.id,
          status: 'pending'
        });

      if (error) throw error;

      setAdminRequestStatus('pending');
      toast({
        title: 'Admin Request Submitted',
        description: 'Your request has been submitted for review.',
      });
    } catch (error) {
      console.error('Error requesting admin access:', error);
      throw error;
    }
  };

  const refreshUser = async () => {
    if (!user) return;
    
    try {
      console.log('Refreshing user data for:', user.id);
      const [role, profile, adminStatus] = await Promise.all([
        getUserRole(user.id),
        getUserProfile(user.id),
        getAdminRequestStatus(user.id)
      ]);
      
      setUserRole(role);
      setUserProfile(profile);
      setAdminRequestStatus(adminStatus);
      
      console.log('User data refreshed:', { role, hasProfile: !!profile, adminStatus });
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  };

  useEffect(() => {
    let isMounted = true;
    
    const initializeAuth = async () => {
      try {
        console.log('🚀 Initializing auth...');
        
        // Get initial session
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Error getting initial session:', error);
          if (isMounted) {
            setIsLoading(false);
          }
          return;
        }

        console.log('📊 Initial session status:', initialSession ? 'Found' : 'None');

        if (isMounted) {
          setSession(initialSession);
          setUser(initialSession?.user ?? null);
        }

        if (initialSession?.user && isMounted) {
          console.log('👤 Fetching user data for:', initialSession.user.id);
          try {
            const [role, profile, adminStatus] = await Promise.all([
              getUserRole(initialSession.user.id),
              getUserProfile(initialSession.user.id),
              getAdminRequestStatus(initialSession.user.id)
            ]);
            
            console.log('✅ User data loaded:', { 
              role, 
              hasProfile: !!profile, 
              adminStatus,
              profileId: profile?.id 
            });
            
            if (isMounted) {
              setUserRole(role);
              setUserProfile(profile);
              setAdminRequestStatus(adminStatus);
            }
          } catch (error) {
            console.error('❌ Error fetching user data:', error);
          }
        }

        if (isMounted) {
          console.log('✅ Auth initialization complete');
          setIsLoading(false);
        }
      } catch (error) {
        console.error('❌ Error initializing auth:', error);
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    // Initialize auth
    initializeAuth();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('🔄 Auth state changed:', event, { hasUser: !!session?.user });
        
        if (!isMounted) return;
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Defer the user data fetching to avoid blocking the auth state change
          setTimeout(async () => {
            if (!isMounted) return;
            
            try {
              const [role, profile, adminStatus] = await Promise.all([
                getUserRole(session.user.id),
                getUserProfile(session.user.id),
                getAdminRequestStatus(session.user.id)
              ]);
              
              console.log('🔄 Updated user data:', { role, hasProfile: !!profile, adminStatus });
              
              if (isMounted) {
                setUserRole(role);
                setUserProfile(profile);
                setAdminRequestStatus(adminStatus);
              }
            } catch (error) {
              console.error('❌ Error fetching user data on auth change:', error);
            }
          }, 100);
        } else {
          if (isMounted) {
            console.log('🔄 User signed out, clearing state');
            setUserRole('user');
            setUserProfile(null);
            setAdminRequestStatus(null);
          }
        }
      }
    );

    return () => {
      console.log('🧹 Cleaning up auth context');
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error };
      }

      return { error: null };
    } catch (error) {
      const err = error as Error;
      return { error: err };
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        return { error };
      }

      return { error: null };
    } catch (error) {
      const err = error as Error;
      return { error: err };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Error signing out:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to sign out. Please try again.",
        });
        return;
      }

      setUser(null);
      setSession(null);
      setUserProfile(null);
      setUserRole('user');
      setAdminRequestStatus(null);
      
      toast({
        title: "Signed out successfully",
        description: "You have been logged out of your account.",
      });
    } catch (error) {
      console.error('Error in signOut:', error);
    }
  };

  const value = {
    user,
    session,
    userProfile,
    userRole,
    isLoading,
    adminRequestStatus,
    signIn,
    signUp,
    signOut,
    refreshUser,
    requestAdminAccess,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
