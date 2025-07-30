
import { UserProfile } from '@/types/database.types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { 
  UserPlus, 
  UserCheck, 
  MessageCircle, 
  Share, 
  Settings,
  MapPin,
  Calendar,
  Link as LinkIcon
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface MobileProfileHeaderProps {
  profile: UserProfile;
  isFollowing?: boolean;
  onFollow?: () => void;
  onUnfollow?: () => void;
  followersCount?: number;
  followingCount?: number;
}

export const MobileProfileHeader = ({
  profile,
  isFollowing = false,
  onFollow,
  onUnfollow,
  followersCount = profile.followers_count || 0,
  followingCount = profile.following_count || 0,
}: MobileProfileHeaderProps) => {
  const { user } = useAuth();
  const isOwnProfile = user?.id === profile.id;
  
  const handleShare = async () => {
    try {
      await navigator.share({
        title: profile.full_name,
        text: profile.bio || '',
        url: window.location.href,
      });
    } catch (error) {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const socialLinks = profile.social_links as Record<string, string> || {};

  return (
    <Card className="w-full">
      <div className="relative">
        {profile.banner_url && (
          <div className="h-32 w-full overflow-hidden rounded-t-lg">
            <img
              src={profile.banner_url}
              alt="Profile banner"
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
          {isOwnProfile && (
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
      
      <CardContent className="p-4">
        <div className="flex flex-col items-center text-center">
          <div className="relative -mt-12 mb-4">
            <Avatar className="h-24 w-24 border-4 border-background">
              <AvatarImage src={profile.profile_image_url || undefined} />
              <AvatarFallback className="text-2xl font-bold">
                {profile.full_name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            {profile.status_tag && (
              <Badge 
                className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 text-xs"
                style={{ backgroundColor: profile.accent_color || '#3b82f6' }}
              >
                {profile.status_tag}
              </Badge>
            )}
          </div>
          
          <div className="w-full">
            <h1 className="text-xl font-bold mb-1">{profile.full_name}</h1>
            {profile.username && (
              <p className="text-muted-foreground text-sm mb-2">@{profile.username}</p>
            )}
            
            {profile.role && (
              <Badge 
                variant="outline" 
                className="mb-3 capitalize"
              >
                {profile.role}
              </Badge>
            )}
            
            {profile.bio && (
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                {profile.bio}
              </p>
            )}
            
            <div className="flex justify-center gap-6 mb-4 text-sm">
              <div className="text-center">
                <div className="font-bold">{followersCount}</div>
                <div className="text-muted-foreground">Followers</div>
              </div>
              <div className="text-center">
                <div className="font-bold">{followingCount}</div>
                <div className="text-muted-foreground">Following</div>
              </div>
            </div>
            
            <div className="flex flex-col gap-2 mb-4 text-xs text-muted-foreground">
              <div className="flex items-center justify-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>
                  Joined {formatDistanceToNow(new Date(profile.created_at), { addSuffix: true })}
                </span>
              </div>
            </div>
            
            {Object.keys(socialLinks).length > 0 && (
              <div className="flex justify-center gap-2 mb-4">
                {Object.entries(socialLinks).map(([platform, url]) => (
                  <Button
                    key={platform}
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    asChild
                  >
                    <a href={url} target="_blank" rel="noopener noreferrer">
                      <LinkIcon className="h-4 w-4" />
                    </a>
                  </Button>
                ))}
              </div>
            )}
            
            {!isOwnProfile && (
              <div className="flex gap-2">
                <Button
                  onClick={isFollowing ? onUnfollow : onFollow}
                  className="flex-1"
                  variant={isFollowing ? "outline" : "default"}
                >
                  {isFollowing ? (
                    <>
                      <UserCheck className="h-4 w-4 mr-2" />
                      Following
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Follow
                    </>
                  )}
                </Button>
                <Button variant="outline" size="icon">
                  <MessageCircle className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
