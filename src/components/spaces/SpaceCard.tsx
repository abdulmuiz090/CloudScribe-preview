
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, Eye } from 'lucide-react';
import type { Space, UserProfile } from '@/types/database.types';
import { Link } from 'react-router-dom';

interface SpaceCardProps {
  space: Space;
  admin?: UserProfile;
  showActions?: boolean;
}

export function SpaceCard({ space, admin, showActions = false }: SpaceCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {space.banner_url && (
        <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600 relative">
          <img 
            src={space.banner_url} 
            alt={space.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            {admin && (
              <Avatar className="h-12 w-12">
                <AvatarImage src={admin.profile_image_url || ''} />
                <AvatarFallback>{admin.full_name[0]}</AvatarFallback>
              </Avatar>
            )}
            <div>
              <h3 className="font-semibold text-lg">{space.name}</h3>
              {admin && (
                <p className="text-sm text-muted-foreground">by {admin.full_name}</p>
              )}
            </div>
          </div>
          
          {admin?.role === 'admin' && (
            <Badge variant="secondary">Admin</Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {space.description && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
            {space.description}
          </p>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Users className="h-4 w-4" />
              <span>{admin?.followers_count || 0}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Eye className="h-4 w-4" />
              <span>View Space</span>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" asChild>
              <Link to={`/spaces/${space.id}`}>
                View
              </Link>
            </Button>
            {showActions && (
              <Button variant="default" size="sm" asChild>
                <Link to={`/spaces/${space.id}/edit`}>
                  Edit
                </Link>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
