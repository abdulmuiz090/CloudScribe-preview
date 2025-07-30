
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ProfileFollowersTabProps {
  followers: any[];
  following: any[];
}

export const ProfileFollowersTab = ({ followers, following }: ProfileFollowersTabProps) => {
  return (
    <Tabs defaultValue="followers" className="space-y-4">
      <TabsList>
        <TabsTrigger value="followers">Followers ({followers.length})</TabsTrigger>
        <TabsTrigger value="following">Following ({following.length})</TabsTrigger>
      </TabsList>
      
      <TabsContent value="followers">
        <Card>
          <CardHeader>
            <CardTitle>Followers</CardTitle>
            <CardDescription>People who follow this creator</CardDescription>
          </CardHeader>
          <CardContent>
            {followers.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No followers yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {followers.map((follower) => (
                  <div key={follower.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={follower.follower?.profile_image_url || ''} />
                        <AvatarFallback>{follower.follower?.full_name?.charAt(0) || 'U'}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{follower.follower?.full_name}</p>
                        <p className="text-xs text-muted-foreground">{follower.follower?.email}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {follower.follower?.role}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="following">
        <Card>
          <CardHeader>
            <CardTitle>Following</CardTitle>
            <CardDescription>People this creator follows</CardDescription>
          </CardHeader>
          <CardContent>
            {following.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">Not following anyone yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {following.map((followingUser) => (
                  <div key={followingUser.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={followingUser.following?.profile_image_url || ''} />
                        <AvatarFallback>{followingUser.following?.full_name?.charAt(0) || 'U'}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{followingUser.following?.full_name}</p>
                        <p className="text-xs text-muted-foreground">{followingUser.following?.email}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {followingUser.following?.role}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};
