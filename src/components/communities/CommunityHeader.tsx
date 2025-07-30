
import { useState } from 'react';
import { Community } from '@/types/database.types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Users, Settings, UserPlus, UserMinus, Share } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CommunityHeaderProps {
  community: Community;
  isMember?: boolean;
  onJoin?: () => void;
  onLeave?: () => void;
  membersCount?: number;
}

export const CommunityHeader = ({ 
  community, 
  isMember = false, 
  onJoin, 
  onLeave,
  membersCount = community.members_count || 0
}: CommunityHeaderProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleMembershipToggle = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to join communities.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      if (isMember) {
        await onLeave?.();
      } else {
        await onJoin?.();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update membership",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: community.name,
        text: community.description || '',
        url: window.location.href,
      });
    } catch (error) {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link Copied",
        description: "Community link copied to clipboard",
      });
    }
  };

  const isAdmin = user?.id === community.admin_id;

  return (
    <Card className="w-full">
      <div className="relative">
        {community.banner_url && (
          <div className="h-32 sm:h-48 lg:h-64 w-full overflow-hidden rounded-t-lg">
            <img
              src={community.banner_url}
              alt={`${community.name} banner`}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="absolute top-4 right-4 flex gap-2">
          <Button
            variant="secondary"
            size="icon"
            onClick={handleShare}
            className="h-8 w-8 bg-background/80 backdrop-blur-sm"
          >
            <Share className="h-4 w-4" />
          </Button>
          {isAdmin && (
            <Button
              variant="secondary"
              size="icon"
              className="h-8 w-8 bg-background/80 backdrop-blur-sm"
            >
              <Settings className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <Avatar className="h-16 w-16 sm:h-20 sm:w-20 mx-auto sm:mx-0">
            <AvatarImage src={community.banner_url} alt={community.name} />
            <AvatarFallback className="text-lg font-bold">
              {community.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
              <h1 className="text-2xl sm:text-3xl font-bold">{community.name}</h1>
              {!isAdmin && (
                <Button
                  onClick={handleMembershipToggle}
                  disabled={loading}
                  variant={isMember ? "outline" : "default"}
                  className="w-full sm:w-auto"
                >
                  {isMember ? (
                    <>
                      <UserMinus className="h-4 w-4 mr-2" />
                      Leave
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Join
                    </>
                  )}
                </Button>
              )}
            </div>
            
            {community.description && (
              <p className="text-muted-foreground mb-3 text-sm sm:text-base">
                {community.description}
              </p>
            )}
            
            <div className="flex flex-wrap justify-center sm:justify-start gap-3 text-sm text-muted-foreground mb-3">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{membersCount} {membersCount === 1 ? 'member' : 'members'}</span>
              </div>
              {community.topic && (
                <Badge variant="outline">{community.topic}</Badge>
              )}
            </div>
            
            {community.tags && community.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {community.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}
            
            {isAdmin && (
              <Badge variant="secondary">
                Admin
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
