
import { FeedItem as FeedItemType } from '@/lib/feed';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Share2, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface FeedItemProps {
  item: FeedItemType;
}

export function FeedItem({ item }: FeedItemProps) {
  const { content, author, type, created_at } = item;

  const formatRole = (role: string) => {
    if (role === 'super-admin') return 'Creator'; // Hide super-admin role
    if (role === 'admin') return 'Creator';
    return 'User';
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'post': return 'bg-blue-100 text-blue-800';
      case 'blog': return 'bg-green-100 text-green-800';
      case 'video': return 'bg-purple-100 text-purple-800';
      case 'template': return 'bg-orange-100 text-orange-800';
      case 'product': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderContent = () => {
    switch (type) {
      case 'post':
        return (
          <div className="space-y-3">
            {content.title && (
              <h3 className="text-lg font-semibold">{content.title}</h3>
            )}
            {content.content_data?.text && (
              <p className="text-muted-foreground line-clamp-3">
                {content.content_data.text}
              </p>
            )}
            {content.content_data?.image_url && (
              <img 
                src={content.content_data.image_url} 
                alt="Post content" 
                className="rounded-lg max-h-64 w-full object-cover"
              />
            )}
          </div>
        );

      case 'blog':
        return (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">{content.title}</h3>
            <p className="text-muted-foreground line-clamp-3">
              {content.content?.substring(0, 200)}...
            </p>
            <Button variant="outline" size="sm">
              <ExternalLink className="h-4 w-4 mr-2" />
              Read More
            </Button>
          </div>
        );

      case 'video':
        return (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">{content.title}</h3>
            <p className="text-muted-foreground line-clamp-2">
              {content.description}
            </p>
            {content.thumbnail_url && (
              <div className="relative">
                <img 
                  src={content.thumbnail_url} 
                  alt="Video thumbnail" 
                  className="rounded-lg w-full max-h-48 object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-black/70 rounded-full p-3">
                    <div className="w-0 h-0 border-l-[12px] border-l-white border-y-[8px] border-y-transparent ml-1"></div>
                  </div>
                </div>
              </div>
            )}
            {content.duration && (
              <Badge variant="secondary">
                {Math.floor(content.duration / 60)}:{(content.duration % 60).toString().padStart(2, '0')}
              </Badge>
            )}
          </div>
        );

      case 'template':
        return (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">{content.name}</h3>
            <p className="text-muted-foreground line-clamp-2">
              {content.description}
            </p>
            {content.preview_image_url && (
              <img 
                src={content.preview_image_url} 
                alt="Template preview" 
                className="rounded-lg w-full max-h-48 object-cover"
              />
            )}
            <div className="flex items-center justify-between">
              <Badge variant={content.is_free ? "secondary" : "default"}>
                {content.is_free ? 'Free' : `$${content.price}`}
              </Badge>
              <Button size="sm">
                Download
              </Button>
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-2">
            <p className="text-muted-foreground">Content not available</p>
          </div>
        );
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={author?.profile_image_url} />
              <AvatarFallback>
                {author?.full_name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <p className="font-medium">{author?.full_name || 'Unknown User'}</p>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-xs">
                  {formatRole(author?.role || 'user')}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(created_at), { addSuffix: true })}
                </span>
              </div>
            </div>
          </div>
          <Badge className={`text-xs ${getTypeColor(type)}`}>
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {renderContent()}
        
        {/* Engagement Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-red-500">
              <Heart className="h-4 w-4 mr-1" />
              {(content.likes_count || 0)}
            </Button>
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-blue-500">
              <MessageCircle className="h-4 w-4 mr-1" />
              {(content.comments_count || 0)}
            </Button>
          </div>
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-green-500">
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
