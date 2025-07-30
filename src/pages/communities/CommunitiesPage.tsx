
import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { getPublishedCommunities, getCommunitiesByAdmin } from '@/lib/communities-api';
import { getUserById } from '@/lib/api';
import { CommunityCard } from '@/components/communities/CommunityCard';
import { CreateCommunityDialog } from '@/components/communities/CreateCommunityDialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, Users } from 'lucide-react';
import type { Community, UserProfile } from '@/types/database.types';

export default function CommunitiesPage() {
  const { user, userRole } = useAuth();
  const [myCommunities, setMyCommunities] = useState<Community[]>([]);
  const [allCommunities, setAllCommunities] = useState<Community[]>([]);
  const [communitiesWithAdmins, setCommunitiesWithAdmins] = useState<Array<{ community: Community; admin: UserProfile }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const canCreateCommunities = userRole === 'admin' || userRole === 'super-admin';

  // Get unique tags from all communities
  const allTags = Array.from(
    new Set(
      allCommunities.flatMap(community => community.tags || [])
    )
  );

  useEffect(() => {
    loadCommunities();
  }, [user]);

  const loadCommunities = async () => {
    setIsLoading(true);
    try {
      // Load user's own communities if they're an admin
      if (user && canCreateCommunities) {
        const userCommunities = await getCommunitiesByAdmin(user.id);
        setMyCommunities(userCommunities);
      }

      // Load all published communities
      const communities = await getPublishedCommunities();
      setAllCommunities(communities);

      // Load admin profiles for each community
      const communitiesWithAdminData = await Promise.all(
        communities.map(async (community) => {
          try {
            const admin = await getUserById(community.admin_id);
            return { community, admin };
          } catch (error) {
            console.error('Error loading admin for community:', community.id, error);
            return null;
          }
        })
      );

      setCommunitiesWithAdmins(communitiesWithAdminData.filter(Boolean) as Array<{ community: Community; admin: UserProfile }>);
    } catch (error) {
      console.error('Error loading communities:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCommunityCreated = () => {
    loadCommunities();
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const filteredCommunities = communitiesWithAdmins.filter(({ community, admin }) => {
    const matchesSearch = 
      community.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      community.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      community.topic?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.full_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTags = selectedTags.length === 0 || 
      selectedTags.some(tag => community.tags?.includes(tag));
    
    return matchesSearch && matchesTags;
  });

  const filteredMyCommunities = myCommunities.filter((community) => {
    const matchesSearch = 
      community.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      community.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      community.topic?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTags = selectedTags.length === 0 || 
      selectedTags.some(tag => community.tags?.includes(tag));
    
    return matchesSearch && matchesTags;
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Communities</h1>
            <p className="text-muted-foreground mt-2">
              Join communities and connect with like-minded people.
            </p>
          </div>
          
          {canCreateCommunities && (
            <CreateCommunityDialog onCommunityCreated={handleCommunityCreated} />
          )}
        </div>

        {/* Search and Filters */}
        <div className="space-y-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search communities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {allTags.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Filter by tags:</p>
              <div className="flex flex-wrap gap-2">
                {allTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant={selectedTags.includes(tag) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        <Tabs defaultValue="discover" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="discover">Discover Communities</TabsTrigger>
            {canCreateCommunities && (
              <TabsTrigger value="my-communities">My Communities</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="discover" className="mt-6">
            {filteredCommunities.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCommunities.map(({ community, admin }) => (
                  <CommunityCard 
                    key={community.id} 
                    community={community} 
                    admin={admin}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No communities found</h3>
                <p className="text-muted-foreground">
                  {searchTerm || selectedTags.length > 0
                    ? "Try adjusting your search or filters."
                    : "Be the first to create a community and bring people together!"}
                </p>
              </div>
            )}
          </TabsContent>

          {canCreateCommunities && (
            <TabsContent value="my-communities" className="mt-6">
              {filteredMyCommunities.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredMyCommunities.map((community) => (
                    <CommunityCard 
                      key={community.id} 
                      community={community}
                      showActions={true}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Create Your First Community</h3>
                  <p className="text-muted-foreground mb-6">
                    Build a space where people can connect around shared interests.
                  </p>
                  <CreateCommunityDialog onCommunityCreated={handleCommunityCreated} />
                </div>
              )}
            </TabsContent>
          )}
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
