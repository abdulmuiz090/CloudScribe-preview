
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getUserSpace, getPublishedSpaces } from '@/lib/spaces-api';
import { getUserById } from '@/lib/api';
import { SpaceCard } from '@/components/spaces/SpaceCard';
import { CreateSpaceDialog } from '@/components/spaces/CreateSpaceDialog';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorMessage } from '@/components/ui/error-message';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Rocket } from 'lucide-react';
import type { Space, UserProfile } from '@/types/database.types';

export default function SpacesPage() {
  const { user, userRole } = useAuth();
  const [userSpace, setUserSpace] = useState<Space | null>(null);
  const [allSpaces, setAllSpaces] = useState<Space[]>([]);
  const [spacesWithAdmins, setSpacesWithAdmins] = useState<Array<{ space: Space; admin: UserProfile }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const canCreateSpace = userRole === 'admin' || userRole === 'super-admin';

  useEffect(() => {
    loadSpaces();
  }, [user]);

  const loadSpaces = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Load user's own space if they're an admin
      if (user && canCreateSpace) {
        try {
          const space = await getUserSpace(user.id);
          setUserSpace(space);
        } catch (err) {
          console.error('Error loading user space:', err);
        }
      }

      // Load all published spaces
      const spaces = await getPublishedSpaces();
      setAllSpaces(spaces);

      // Load admin profiles for each space
      const spacesWithAdminData = await Promise.all(
        spaces.map(async (space) => {
          try {
            const admin = await getUserById(space.admin_id);
            return { space, admin };
          } catch (error) {
            console.error('Error loading admin for space:', space.id, error);
            return null;
          }
        })
      );

      setSpacesWithAdmins(spacesWithAdminData.filter(Boolean) as Array<{ space: Space; admin: UserProfile }>);
    } catch (error) {
      console.error('Error loading spaces:', error);
      setError('Failed to load spaces. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpaceCreated = () => {
    loadSpaces();
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-64">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-64">
          <ErrorMessage message={error} onRetry={loadSpaces} />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Spaces</h1>
          <p className="text-muted-foreground mt-2">
            Discover admin spaces and create your own hub for content and community.
          </p>
        </div>
        
        {canCreateSpace && !userSpace && (
          <CreateSpaceDialog onSpaceCreated={handleSpaceCreated} />
        )}
      </div>

      <Tabs defaultValue="discover" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="discover">Discover Spaces</TabsTrigger>
          {canCreateSpace && (
            <TabsTrigger value="my-space">My Space</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="discover" className="mt-6">
          {spacesWithAdmins.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {spacesWithAdmins.map(({ space, admin }) => (
                <SpaceCard 
                  key={space.id} 
                  space={space} 
                  admin={admin}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Rocket className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No spaces yet</h3>
              <p className="text-muted-foreground">
                Be the first to create a space and start building your community!
              </p>
            </div>
          )}
        </TabsContent>

        {canCreateSpace && (
          <TabsContent value="my-space" className="mt-6">
            {userSpace ? (
              <div className="max-w-md">
                <SpaceCard 
                  space={userSpace} 
                  showActions={true}
                />
              </div>
            ) : (
              <div className="text-center py-12">
                <Rocket className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Create Your Space</h3>
                <p className="text-muted-foreground mb-6">
                  As an admin, you can create your own space to share content and build your community.
                </p>
                <CreateSpaceDialog onSpaceCreated={handleSpaceCreated} />
              </div>
            )}
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
