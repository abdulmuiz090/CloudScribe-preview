
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FollowButton } from '@/components/profile/FollowButton';
import { UserProfile } from '@/types/database.types';
import { Calendar, Users, UserCheck, MapPin, Link as LinkIcon, Twitter, Instagram, Globe } from 'lucide-react';
import { format } from 'date-fns';

interface ProfileHeaderProps {
  profile: UserProfile;
  followersCount: number;
  followingCount: number;
  onFollowChange: () => void;
}

export const ProfileHeader = ({ profile, followersCount, followingCount, onFollowChange }: ProfileHeaderProps) => {
  const isAdmin = profile.role === 'admin' || profile.role === 'super-admin';
  
  const socialLinks = profile.social_links as { 
    twitter?: string; 
    instagram?: string; 
    website?: string; 
  } || {};

  return (
    <div className="relative">
      {/* Cover Banner */}
      <div className="relative h-48 md:h-64 bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-lg overflow-hidden">
        {profile.banner_url ? (
          <img 
            src={profile.banner_url} 
            alt="Profile banner"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-600" />
        )}
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Profile Content */}
      <div className="relative px-4 md:px-6 pb-6">
        {/* Avatar positioned over banner */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between -mt-16 md:-mt-20">
          <div className="flex flex-col md:flex-row md:items-end md:space-x-6">
            <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-background bg-background">
              <AvatarImage src={profile.profile_image_url || ''} alt={profile.full_name} />
              <AvatarFallback className="text-2xl md:text-3xl font-bold">
                {profile.full_name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            
            <div className="mt-4 md:mt-0 md:mb-2 flex-1">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-2xl md:text-3xl font-bold">{profile.full_name}</h1>
                    {isAdmin && (
                      <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                        ✓ Verified Creator
                      </Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground">@{profile.email.split('@')[0]}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="mt-4 md:mt-0 flex items-center gap-3">
            <FollowButton 
              userId={profile.id} 
              onFollowChange={onFollowChange}
            />
            <Button variant="outline" size="sm">
              Share Profile
            </Button>
          </div>
        </div>

        {/* Bio and Info */}
        <div className="mt-6 space-y-4">
          {profile.bio && (
            <p className="text-sm md:text-base text-foreground max-w-2xl">
              {profile.bio}
            </p>
          )}
          
          {/* Stats and Info Row */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>Joined {format(new Date(profile.created_at), 'MMMM yyyy')}</span>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span className="font-medium text-foreground">{followersCount}</span>
                <span>followers</span>
              </div>
              <div className="flex items-center gap-1">
                <UserCheck className="h-4 w-4" />
                <span className="font-medium text-foreground">{followingCount}</span>
                <span>following</span>
              </div>
            </div>
          </div>

          {/* Social Links */}
          {(socialLinks.twitter || socialLinks.instagram || socialLinks.website) && (
            <div className="flex items-center gap-3">
              {socialLinks.twitter && (
                <a 
                  href={socialLinks.twitter} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-blue-500 transition-colors"
                >
                  <Twitter className="h-5 w-5" />
                </a>
              )}
              {socialLinks.instagram && (
                <a 
                  href={socialLinks.instagram} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-pink-500 transition-colors"
                >
                  <Instagram className="h-5 w-5" />
                </a>
              )}
              {socialLinks.website && (
                <a 
                  href={socialLinks.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-blue-600 transition-colors"
                >
                  <Globe className="h-5 w-5" />
                </a>
              )}
            </div>
          )}

          {/* Status Badge */}
          {isAdmin && (
            <div className="flex gap-2">
              <Badge variant="outline" className="text-green-700 border-green-200">
                🟢 Available for Projects
              </Badge>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
