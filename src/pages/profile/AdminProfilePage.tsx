
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ProfileTabs } from '@/components/profile/ProfileTabs';
import { getUserById } from '@/lib/api';
import { getUserFollowers, getUserFollowing } from '@/lib/follow-api';
import { useToast } from '@/hooks/use-toast';
import { UserProfile } from '@/types/database.types';

const AdminProfilePage = () => {
  const { userId } = useParams<{ userId: string }>();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [followers, setFollowers] = useState<any[]>([]);
  const [following, setFollowing] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchProfileData();
    }
  }, [userId]);

  const fetchProfileData = async () => {
    if (!userId) return;
    
    setIsLoading(true);
    try {
      const [profileData, followersData, followingData] = await Promise.all([
        getUserById(userId),
        getUserFollowers(userId),
        getUserFollowing(userId)
      ]);
      
      setProfile(profileData);
      setFollowers(followersData || []);
      setFollowing(followingData || []);
    } catch (error: any) {
      console.error('Error fetching profile data:', error);
      toast({
        title: "Error",
        description: "Failed to load profile data.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFollowChange = () => {
    if (userId) {
      getUserFollowers(userId).then(setFollowers).catch(console.error);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!profile) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900">Profile not found</h2>
          <p className="text-gray-600 mt-2">The user profile you're looking for doesn't exist.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <ProfileHeader 
          profile={profile}
          followersCount={followers.length}
          followingCount={following.length}
          onFollowChange={handleFollowChange}
        />
        <ProfileTabs 
          profile={profile}
          followers={followers}
          following={following}
        />
      </div>
    </DashboardLayout>
  );
};

export default AdminProfilePage;
