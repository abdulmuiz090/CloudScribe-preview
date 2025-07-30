
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { FollowButton } from '@/components/profile/FollowButton';
import { getAdminUsers } from '@/lib/follow-api';
import { useToast } from '@/hooks/use-toast';
import { UserProfile } from '@/types/database.types';
import { Search, Users, UserCheck } from 'lucide-react';

const AdminDirectoryPage = () => {
  const { toast } = useToast();
  const [admins, setAdmins] = useState<UserProfile[]>([]);
  const [filteredAdmins, setFilteredAdmins] = useState<UserProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAdmins();
  }, []);

  useEffect(() => {
    filterAdmins();
  }, [admins, searchQuery]);

  const fetchAdmins = async () => {
    setIsLoading(true);
    try {
      const adminData = await getAdminUsers();
      // Cast the data to match our UserProfile type and filter out super-admin
      const typedAdmins = adminData?.map(admin => ({
        ...admin,
        social_links: typeof admin.social_links === 'object' ? admin.social_links : {}
      })).filter(admin => admin.role === 'admin') as UserProfile[] || [];
      setAdmins(typedAdmins);
    } catch (error: any) {
      console.error('Error fetching admins:', error);
      toast({
        title: "Error",
        description: "Failed to load admin directory.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterAdmins = () => {
    if (!searchQuery.trim()) {
      setFilteredAdmins(admins);
      return;
    }

    const filtered = admins.filter(admin =>
      admin.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredAdmins(filtered);
  };

  const handleFollowChange = () => {
    // Refresh admin data to update follow counts
    fetchAdmins();
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading admin directory...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Admin Directory</h2>
          <p className="text-muted-foreground">
            Discover and connect with platform administrators.
          </p>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search admins by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Admin Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAdmins.map((admin) => (
            <Card key={admin.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <Link to={`/admin-profile/${admin.id}`} className="flex items-center space-x-3 group">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={admin.profile_image_url || ''} alt={admin.full_name} />
                      <AvatarFallback>{admin.full_name?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold group-hover:text-primary transition-colors">
                        {admin.full_name}
                      </h3>
                      <p className="text-sm text-muted-foreground">{admin.email}</p>
                    </div>
                  </Link>
                  <Badge className={
                    admin.role === 'super-admin' ? 'bg-purple-100 text-purple-800' :
                    'bg-blue-100 text-blue-800'
                  }>
                    {admin.role === 'super-admin' ? 'Super Admin' : 'Admin'}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      <span>{admin.followers_count || 0}</span>
                    </div>
                    <div className="flex items-center">
                      <UserCheck className="h-4 w-4 mr-1" />
                      <span>{admin.following_count || 0}</span>
                    </div>
                  </div>
                  
                  <FollowButton 
                    userId={admin.id} 
                    onFollowChange={handleFollowChange}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredAdmins.length === 0 && !isLoading && (
          <Card>
            <CardContent className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchQuery ? 'No admins found' : 'No admins available'}
              </h3>
              <p className="text-muted-foreground">
                {searchQuery 
                  ? 'Try adjusting your search terms.' 
                  : 'There are no administrators to display at the moment.'
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminDirectoryPage;
