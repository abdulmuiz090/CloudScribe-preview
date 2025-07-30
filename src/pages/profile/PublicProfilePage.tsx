
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { EnhancedProfileHeader } from '@/components/profile/EnhancedProfileHeader';
import { MobileProfileHeader } from '@/components/profile/MobileProfileHeader';
import { ProfileTabs } from '@/components/profile/ProfileTabs';
import { ResponsiveContainer } from '@/components/ui/responsive-container';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { UserProfile } from '@/types/database.types';

const PublicProfilePage = () => {
  const { identifier } = useParams<{ identifier: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    if (identifier) {
      fetchProfile();
      checkFollowStatus();
    }
  }, [identifier, user]);

  const fetchProfile = async () => {
    if (!identifier) return;

    try {
      let query = supabase.from('user_profiles').select('*');
      
      // Try to find by username first, then by ID
      if (identifier.length === 36) {
        // Looks like a UUID
        query = query.eq('id', identifier);
      } else {
        // Treat as username
        query = query.eq('username', identifier);
      }

      const { data, error } = await query.single();

      if (error) {
        // If not found by username, try by ID
        if (!error.message.includes('No rows')) {
          throw error;
        }
        
        const { data: idData, error: idError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', identifier)
          .single();

        if (idError) throw idError;
        
        // Transform the data to match our interface
        const transformedProfile: UserProfile = {
          ...idData,
          social_links: (idData.social_links as Record<string, string>) || {},
        };
        
        setProfile(transformedProfile);
      } else {
        // Transform the data to match our interface
        const transformedProfile: UserProfile = {
          ...data,
          social_links: (data.social_links as Record<string, string>) || {},
        };
        
        setProfile(transformedProfile);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const checkFollowStatus = async () => {
    if (!user || !identifier) return;

    try {
      const { data, error } = await supabase
        .from('followers')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', identifier)
        .single();

      if (!error && data) {
        setIsFollowing(true);
      }
    } catch (error) {
      // Not following or error - both cases mean not following
      setIsFollowing(false);
    }
  };

  const handleFollow = async () => {
    if (!user || !profile) return;
    
    try {
      const { error } = await supabase
        .from('followers')
        .insert({
          follower_id: user.id,
          following_id: profile.id
        });

      if (error) throw error;

      setIsFollowing(true);
      setProfile(prev => prev ? {
        ...prev,
        followers_count: (prev.followers_count || 0) + 1
      } : null);
      
      toast({
        title: "Success",
        description: `You are now following ${profile.full_name}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to follow user",
        variant: "destructive",
      });
    }
  };

  const handleUnfollow = async () => {
    if (!user || !profile) return;
    
    try {
      const { error } = await supabase
        .from('followers')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', profile.id);

      if (error) throw error;

      setIsFollowing(false);
      setProfile(prev => prev ? {
        ...prev,
        followers_count: Math.max(0, (prev.followers_count || 0) - 1)
      } : null);
      
      toast({
        title: "Success",
        description: `You have unfollowed ${profile.full_name}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to unfollow user",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <ResponsiveContainer>
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        </ResponsiveContainer>
      </DashboardLayout>
    );
  }

  if (!profile) {
    return (
      <DashboardLayout>
        <ResponsiveContainer>
          <Card>
            <CardContent className="p-8 text-center">
              <h2 className="text-xl font-semibold mb-2">Profile Not Found</h2>
              <p className="text-muted-foreground">
                The profile you're looking for doesn't exist or has been removed.
              </p>
            </CardContent>
          </Card>
        </ResponsiveContainer>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <ResponsiveContainer>
        <div className="space-y-6">
          {isMobile ? (
            <MobileProfileHeader
              profile={profile}
              isFollowing={isFollowing}
              onFollow={handleFollow}
              onUnfollow={handleUnfollow}
              followersCount={profile.followers_count}
              followingCount={profile.following_count}
            />
          ) : (
            <EnhancedProfileHeader
              profile={profile}
              isFollowing={isFollowing}
              onFollow={handleFollow}
              onUnfollow={handleUnfollow}
              followersCount={profile.followers_count}
              followingCount={profile.following_count}
            />
          )}
          
          <ProfileTabs 
            profile={profile} 
            followers={[]} 
            following={[]} 
          />
        </div>
      </ResponsiveContainer>
    </DashboardLayout>
  );
};

export default PublicProfilePage;
