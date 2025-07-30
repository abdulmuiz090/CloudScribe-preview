
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { CommunityHeader } from '@/components/communities/CommunityHeader';
import { ResponsiveContainer } from '@/components/ui/responsive-container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, MessageCircle, Users, Info } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface Community {
  id: string;
  name: string;
  description?: string;
  banner_url?: string;
  admin_id: string;
  members_count?: number;
  topic?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

const CommunityDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const [community, setCommunity] = useState<Community | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMember, setIsMember] = useState(false);

  useEffect(() => {
    if (id) {
      fetchCommunity();
      checkMembershipStatus();
    }
  }, [id, user]);

  const fetchCommunity = async () => {
    try {
      const { data, error } = await supabase
        .from('communities')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setCommunity(data);
    } catch (error) {
      console.error('Error fetching community:', error);
      toast({
        title: "Error",
        description: "Failed to load community",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const checkMembershipStatus = async () => {
    if (!user || !id) return;

    try {
      const { data, error } = await supabase
        .from('community_members')
        .select('id')
        .eq('community_id', id)
        .eq('user_id', user.id)
        .single();

      if (!error && data) {
        setIsMember(true);
      }
    } catch (error) {
      console.error('Error checking membership:', error);
    }
  };

  const handleJoin = async () => {
    if (!user || !id) return;
    
    try {
      const { error } = await supabase
        .from('community_members')
        .insert({
          community_id: id,
          user_id: user.id
        });

      if (error) throw error;

      setIsMember(true);
      setCommunity(prev => prev ? {
        ...prev,
        members_count: (prev.members_count || 0) + 1
      } : null);
      
      toast({
        title: "Success",
        description: "You have joined the community",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to join community",
        variant: "destructive",
      });
    }
  };

  const handleLeave = async () => {
    if (!user || !id) return;
    
    try {
      const { error } = await supabase
        .from('community_members')
        .delete()
        .eq('community_id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setIsMember(false);
      setCommunity(prev => prev ? {
        ...prev,
        members_count: Math.max(0, (prev.members_count || 0) - 1)
      } : null);
      
      toast({
        title: "Success",
        description: "You have left the community",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to leave community",
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

  if (!community) {
    return (
      <DashboardLayout>
        <ResponsiveContainer>
          <Card>
            <CardContent className="p-8 text-center">
              <h2 className="text-xl font-semibold mb-2">Community Not Found</h2>
              <p className="text-muted-foreground">
                The community you're looking for doesn't exist or has been removed.
              </p>
            </CardContent>
          </Card>
        </ResponsiveContainer>
      </DashboardLayout>
    );
  }

  const isAdmin = user?.id === community.admin_id;

  return (
    <DashboardLayout>
      <ResponsiveContainer>
        <div className="space-y-6">
          <CommunityHeader
            community={community}
            isMember={isMember}
            onJoin={handleJoin}
            onLeave={handleLeave}
            membersCount={community.members_count}
          />

          <Tabs defaultValue="posts" className="w-full">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <TabsList className="grid w-full sm:w-auto grid-cols-3 sm:grid-cols-none">
                <TabsTrigger value="posts">Posts</TabsTrigger>
                <TabsTrigger value="members">Members</TabsTrigger>
                <TabsTrigger value="about">About</TabsTrigger>
              </TabsList>
              
              {(isMember || isAdmin) && (
                <Button className="w-full sm:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  New Post
                </Button>
              )}
            </div>

            <TabsContent value="posts" className="space-y-6">
              <Card>
                <CardContent className="p-8 text-center">
                  <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">No posts yet</h3>
                  <p className="text-muted-foreground mb-4">
                    {isMember || isAdmin
                      ? "Start a conversation in this community" 
                      : "Join the community to see posts and participate"
                    }
                  </p>
                  {(isMember || isAdmin) && (
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Post
                    </Button>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="members" className="space-y-6">
              <Card>
                <CardContent className="p-8 text-center">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">Community Members</h3>
                  <p className="text-muted-foreground">
                    {community.members_count || 0} {(community.members_count || 0) === 1 ? 'member' : 'members'}
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="about" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="h-5 w-5" />
                    About This Community
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Description</h4>
                    <p className="text-muted-foreground">
                      {community.description || "No description provided"}
                    </p>
                  </div>
                  {community.topic && (
                    <div>
                      <h4 className="font-medium mb-2">Topic</h4>
                      <p className="text-muted-foreground">{community.topic}</p>
                    </div>
                  )}
                  {community.tags && community.tags.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {community.tags.map((tag, index) => (
                          <span 
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded-md text-sm bg-secondary text-secondary-foreground"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  <div>
                    <h4 className="font-medium mb-2">Created</h4>
                    <p className="text-muted-foreground">
                      {new Date(community.created_at).toLocaleDateString()}
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

export default CommunityDetailPage;
