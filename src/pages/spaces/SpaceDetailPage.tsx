
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { SpaceHeader } from '@/components/spaces/SpaceHeader';
import { ResponsiveContainer } from '@/components/ui/responsive-container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, FileText, Image, Video } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface Space {
  id: string;
  name: string;
  description?: string;
  banner_url?: string;
  admin_id: string;
  created_at: string;
  updated_at: string;
}

const SpaceDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const [space, setSpace] = useState<Space | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);

  useEffect(() => {
    if (id) {
      fetchSpace();
      checkFollowStatus();
    }
  }, [id, user]);

  const fetchSpace = async () => {
    try {
      const { data, error } = await supabase
        .from('spaces')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setSpace(data);
    } catch (error) {
      console.error('Error fetching space:', error);
      toast({
        title: "Error",
        description: "Failed to load space",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const checkFollowStatus = async () => {
    if (!user || !space?.admin_id) return;

    try {
      // Check if user is following the space admin
      const { data: followData, error: followError } = await supabase
        .from('followers')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', space.admin_id)
        .maybeSingle();

      if (!followError && followData) {
        setIsFollowing(true);
      }

      // Get follower count for the space admin
      const { data: countData, error: countError } = await supabase
        .from('user_profiles')
        .select('followers_count')
        .eq('id', space.admin_id)
        .single();

      if (!countError && countData) {
        setFollowersCount(countData.followers_count || 0);
      }
    } catch (error) {
      console.error('Error checking follow status:', error);
    }
  };

  const handleFollow = async () => {
    if (!user || !space?.admin_id) return;
    
    try {
      const { error } = await supabase
        .from('followers')
        .insert({
          follower_id: user.id,
          following_id: space.admin_id
        });

      if (error) throw error;

      setIsFollowing(true);
      setFollowersCount(prev => prev + 1);
      toast({
        title: "Success",
        description: "You are now following this space",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to follow space",
        variant: "destructive",
      });
    }
  };

  const handleUnfollow = async () => {
    if (!user || !space?.admin_id) return;
    
    try {
      const { error } = await supabase
        .from('followers')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', space.admin_id);

      if (error) throw error;

      setIsFollowing(false);
      setFollowersCount(prev => Math.max(0, prev - 1));
      toast({
        title: "Success",
        description: "You have unfollowed this space",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to unfollow space",
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

  if (!space) {
    return (
      <DashboardLayout>
        <ResponsiveContainer>
          <Card>
            <CardContent className="p-8 text-center">
              <h2 className="text-xl font-semibold mb-2">Space Not Found</h2>
              <p className="text-muted-foreground">
                The space you're looking for doesn't exist or has been removed.
              </p>
            </CardContent>
          </Card>
        </ResponsiveContainer>
      </DashboardLayout>
    );
  }

  const isOwner = user?.id === space.admin_id;

  return (
    <DashboardLayout>
      <ResponsiveContainer>
        <div className="space-y-6">
          <SpaceHeader
            space={space}
            isFollowing={isFollowing}
            onFollow={handleFollow}
            onUnfollow={handleUnfollow}
            followersCount={followersCount}
          />

          <Tabs defaultValue="posts" className="w-full">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <TabsList className="grid w-full sm:w-auto grid-cols-4 sm:grid-cols-none">
                <TabsTrigger value="posts">Posts</TabsTrigger>
                <TabsTrigger value="media">Media</TabsTrigger>
                <TabsTrigger value="files">Files</TabsTrigger>
                <TabsTrigger value="about">About</TabsTrigger>
              </TabsList>
              
              {isOwner && (
                <Button className="w-full sm:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Post
                </Button>
              )}
            </div>

            <TabsContent value="posts" className="space-y-6">
              <Card>
                <CardContent className="p-8 text-center">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">No posts yet</h3>
                  <p className="text-muted-foreground mb-4">
                    {isOwner 
                      ? "Start sharing content with your audience" 
                      : "Check back later for new posts"
                    }
                  </p>
                  {isOwner && (
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Post
                    </Button>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="media" className="space-y-6">
              <Card>
                <CardContent className="p-8 text-center">
                  <Image className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">No media yet</h3>
                  <p className="text-muted-foreground">
                    Photos and videos will appear here
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="files" className="space-y-6">
              <Card>
                <CardContent className="p-8 text-center">
                  <Video className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">No files yet</h3>
                  <p className="text-muted-foreground">
                    Shared files will appear here
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="about" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>About This Space</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Description</h4>
                    <p className="text-muted-foreground">
                      {space.description || "No description provided"}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Created</h4>
                    <p className="text-muted-foreground">
                      {new Date(space.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Followers</h4>
                    <p className="text-muted-foreground">
                      {followersCount} {followersCount === 1 ? 'follower' : 'followers'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </ResponsiveContainer>
    </DashboardLayout>
  );
};

export default SpaceDetailPage;
