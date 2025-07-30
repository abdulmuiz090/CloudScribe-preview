
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DollarSign, Globe, Users, Lock, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { EditPostDialog } from './EditPostDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import type { Post, UserProfile } from '@/types/database.types';

interface PostHeaderProps {
  post: Post;
  author?: UserProfile;
  showActions?: boolean;
  onDelete: () => void;
  onRefresh: () => void;
  isDeleting: boolean;
}

export function PostHeader({ post, author, showActions, onDelete, onRefresh, isDeleting }: PostHeaderProps) {
  const getVisibilityIcon = () => {
    switch (post.visibility) {
      case 'public': return <Globe className="h-3 w-3" />;
      case 'followers': return <Users className="h-3 w-3" />;
      case 'paid': return <Lock className="h-3 w-3" />;
      default: return <Globe className="h-3 w-3" />;
    }
  };

  const getVisibilityLabel = () => {
    switch (post.visibility) {
      case 'public': return 'Public';
      case 'followers': return 'Followers';
      case 'paid': return 'Paid';
      default: return 'Public';
    }
  };

  return (
    <div className="flex items-start justify-between">
      <div className="flex items-center space-x-3">
        <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
          <AvatarImage src={author?.profile_image_url || ''} />
          <AvatarFallback>{author?.full_name?.[0] || 'U'}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold text-sm">{author?.full_name || 'Unknown User'}</p>
          <div className="flex items-center space-x-1 sm:space-x-2 text-xs text-muted-foreground">
            <span className="hidden sm:inline">
              {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
            </span>
            <span className="sm:hidden">
              {formatDistanceToNow(new Date(post.created_at), { addSuffix: true }).replace('about ', '')}
            </span>
            <div className="flex items-center space-x-1">
              {getVisibilityIcon()}
              <span className="hidden sm:inline">{getVisibilityLabel()}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-1 sm:space-x-2">
        {post.is_paid && (
          <Badge variant="secondary" className="text-xs">
            <DollarSign className="h-3 w-3 mr-1" />
            <span className="hidden sm:inline">${post.price}</span>
            <span className="sm:hidden">${post.price}</span>
          </Badge>
        )}
        <Badge variant="outline" className="text-xs capitalize">
          {post.content_type}
        </Badge>
        
        {showActions && (
          <div className="flex space-x-1">
            <EditPostDialog post={post} onPostUpdated={onRefresh} />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Post</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this post? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={onDelete}
                    disabled={isDeleting}
                  >
                    {isDeleting ? "Deleting..." : "Delete"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>
    </div>
  );
}
