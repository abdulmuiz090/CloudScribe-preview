
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

interface EnhancedProfileHeaderProps {
  profile: UserProfile;
  isFollowing?: boolean;
  onFollow?: () => void;
  onUnfollow?: () => void;
  followersCount?: number;
  followingCount?: number;
}

export const EnhancedProfileHeader = ({
  profile,
  isFollowing = false,
  onFollow,
  onUnfollow,
  followersCount = profile.followers_count || 0,
  followingCount = profile.following_count || 0,
}: EnhancedProfileHeaderProps) => {
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
    <Card className="w-full overflow-hidden">
      <div className="relative">
        {profile.banner_url && (
          <div className="h-48 md:h-64 w-full overflow-hidden">
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
            className="bg-background/80 backdrop-blur-sm"
          >
            <Share className="h-4 w-4" />
          </Button>
          {isOwnProfile && (
            <Button
              variant="secondary"
              size="icon"
              className="bg-background/80 backdrop-blur-sm"
            >
              <Settings className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-4">
            <div className="relative">
              <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-background -mt-12 md:-mt-16">
                <AvatarImage src={profile.profile_image_url || undefined} />
                <AvatarFallback className="text-2xl md:text-3xl font-bold">
                  {profile.full_name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              {profile.status_tag && (
                <Badge 
                  className="absolute -bottom-2 left-1/2 transform -translate-x-1/2"
                  style={{ backgroundColor: profile.accent_color || '#3b82f6' }}
                >
                  {profile.status_tag}
                </Badge>
              )}
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl md:text-3xl font-bold mb-2">{profile.full_name}</h1>
              {profile.username && (
                <p className="text-muted-foreground text-lg mb-2">@{profile.username}</p>
              )}
              
              {profile.role && (
                <Badge 
                  variant="outline" 
                  className="mb-4 capitalize"
                >
                  {profile.role}
                </Badge>
              )}
              
              {profile.bio && (
                <p className="text-muted-foreground mb-4 max-w-2xl leading-relaxed">
                  {profile.bio}
                </p>
              )}
              
              <div className="flex justify-center md:justify-start gap-8 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{followersCount}</div>
                  <div className="text-sm text-muted-foreground">Followers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{followingCount}</div>
                  <div className="text-sm text-muted-foreground">Following</div>
                </div>
              </div>
              
              <div className="flex flex-col gap-2 mb-4 text-sm text-muted-foreground">
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Joined {formatDistanceToNow(new Date(profile.created_at), { addSuffix: true })}
                  </span>
                </div>
              </div>
              
              {Object.keys(socialLinks).length > 0 && (
                <div className="flex justify-center md:justify-start gap-2 mb-4">
                  {Object.entries(socialLinks).map(([platform, url]) => (
                    <Button
                      key={platform}
                      variant="ghost"
                      size="icon"
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
                <div className="flex justify-center md:justify-start gap-3">
                  <Button
                    onClick={isFollowing ? onUnfollow : onFollow}
                    variant={isFollowing ? "outline" : "default"}
                    className="flex-1 md:flex-none"
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
        </div>
      </CardContent>
    </Card>
  );
};
