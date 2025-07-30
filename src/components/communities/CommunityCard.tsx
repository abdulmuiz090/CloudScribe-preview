
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, Hash } from 'lucide-react';
import { EditCommunityDialog } from './EditCommunityDialog';
import type { Community, UserProfile } from '@/types/database.types';
import { Link } from 'react-router-dom';

interface CommunityCardProps {
  community: Community;
  admin?: UserProfile;
  isJoined?: boolean;
  onJoinToggle?: () => void;
  showActions?: boolean;
  onCommunityUpdated?: () => void;
}

export function CommunityCard({ 
  community, 
  admin, 
  isJoined = false, 
  onJoinToggle, 
  showActions = false,
  onCommunityUpdated
}: CommunityCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {community.banner_url && (
        <div className="h-24 bg-gradient-to-r from-green-500 to-blue-600 relative">
          <img 
            src={community.banner_url} 
            alt={community.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            {admin && (
              <Avatar className="h-10 w-10">
                <AvatarImage src={admin.profile_image_url || ''} />
                <AvatarFallback>{admin.full_name[0]}</AvatarFallback>
              </Avatar>
            )}
            <div>
              <h3 className="font-semibold">{community.name}</h3>
              {community.topic && (
                <p className="text-xs text-muted-foreground">{community.topic}</p>
              )}
            </div>
          </div>
          
          {admin?.role === 'admin' && (
            <Badge variant="secondary" className="text-xs">Admin</Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {community.description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {community.description}
          </p>
        )}
        
        {community.tags && community.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {community.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                <Hash className="h-3 w-3 mr-1" />
                {tag}
              </Badge>
            ))}
            {community.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{community.tags.length - 3}
              </Badge>
            )}
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{community.members_count} members</span>
          </div>
          
          <div className="flex space-x-2">
            {onJoinToggle && (
              <Button
                variant={isJoined ? "outline" : "default"}
                size="sm"
                onClick={onJoinToggle}
              >
                {isJoined ? 'Leave' : 'Join'}
              </Button>
            )}
            <Button variant="outline" size="sm" asChild>
              <Link to={`/communities/${community.id}`}>
                View
              </Link>
            </Button>
            {showActions && onCommunityUpdated && (
              <EditCommunityDialog 
                community={community} 
                onCommunityUpdated={onCommunityUpdated}
              />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
