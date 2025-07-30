
import { useState } from 'react';
import { Space } from '@/types/database.types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Users, Settings, Heart, MessageSquare, Share } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SpaceHeaderProps {
  space: Space;
  isFollowing?: boolean;
  onFollow?: () => void;
  onUnfollow?: () => void;
  followersCount?: number;
}

export const SpaceHeader = ({ 
  space, 
  isFollowing = false, 
  onFollow, 
  onUnfollow,
  followersCount = 0 
}: SpaceHeaderProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleFollowToggle = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to follow spaces.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      if (isFollowing) {
        await onUnfollow?.();
      } else {
        await onFollow?.();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update follow status",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: space.name,
        text: space.description || '',
        url: window.location.href,
      });
    } catch (error) {
      // Fallback to copying to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link Copied",
        description: "Space link copied to clipboard",
      });
    }
  };

  const isOwner = user?.id === space.admin_id;

  return (
    <Card className="w-full">
      <div className="relative">
        {space.banner_url && (
          <div className="h-32 sm:h-48 lg:h-64 w-full overflow-hidden rounded-t-lg">
            <img
              src={space.banner_url}
              alt={`${space.name} banner`}
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
          {isOwner && (
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
            <AvatarImage src={space.banner_url} alt={space.name} />
            <AvatarFallback className="text-lg font-bold">
              {space.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
              <h1 className="text-2xl sm:text-3xl font-bold">{space.name}</h1>
              {!isOwner && (
                <Button
                  onClick={handleFollowToggle}
                  disabled={loading}
                  variant={isFollowing ? "outline" : "default"}
                  className="w-full sm:w-auto"
                >
                  <Heart className={`h-4 w-4 mr-2 ${isFollowing ? 'fill-current' : ''}`} />
                  {isFollowing ? 'Following' : 'Follow'}
                </Button>
              )}
            </div>
            
            {space.description && (
              <p className="text-muted-foreground mb-3 text-sm sm:text-base">
                {space.description}
              </p>
            )}
            
            <div className="flex flex-wrap justify-center sm:justify-start gap-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{followersCount} {followersCount === 1 ? 'follower' : 'followers'}</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageSquare className="h-4 w-4" />
                <span>0 posts</span>
              </div>
            </div>
            
            {isOwner && (
              <Badge variant="secondary" className="mt-2">
                Owner
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
