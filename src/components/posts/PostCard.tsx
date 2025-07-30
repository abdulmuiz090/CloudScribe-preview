
import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CommentSystem } from '@/components/comments/CommentSystem';
import { RatingSystem } from '@/components/rating/RatingSystem';
import { PostHeader } from './PostHeader';
import { PostActions } from './PostActions';
import { deletePost } from '@/lib/posts-api';
import type { Post, UserProfile } from '@/types/database.types';

interface PostCardProps {
  post: Post;
  author?: UserProfile;
  showActions?: boolean;
}

export function PostCard({ post, author, showActions = false }: PostCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: () => deletePost(post.id),
    onSuccess: () => {
      toast({
        title: "Post Deleted",
        description: "Your post has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete post. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['posts'] });
  };

  const renderContent = () => {
    const { content_data } = post;
    
    return (
      <div className="space-y-3">
        {content_data.text && (
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {content_data.text}
          </p>
        )}
        
        {post.content_type === 'image' && content_data.image_url && (
          <div className="rounded-lg overflow-hidden">
            <img 
              src={content_data.image_url} 
              alt="Post content"
              className="w-full max-h-64 sm:max-h-96 object-cover"
            />
          </div>
        )}
        
        {post.content_type === 'video' && content_data.video_url && (
          <div className="rounded-lg overflow-hidden">
            <video 
              src={content_data.video_url} 
              controls
              className="w-full max-h-64 sm:max-h-96"
            >
              Your browser does not support the video tag.
            </video>
          </div>
        )}
        
        {post.content_type === 'link' && content_data.link_url && (
          <div className="border rounded-lg p-3 bg-muted/50">
            <a 
              href={content_data.link_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline break-all text-sm"
            >
              {content_data.link_url}
            </a>
          </div>
        )}
        
        {post.content_type === 'file' && content_data.file_url && (
          <div className="border rounded-lg p-3 bg-muted/50">
            <a 
              href={content_data.file_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline break-all text-sm"
            >
              📎 Download File
            </a>
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <PostHeader
          post={post}
          author={author}
          showActions={showActions}
          onDelete={() => deleteMutation.mutate()}
          onRefresh={handleRefresh}
          isDeleting={deleteMutation.isPending}
        />
        
        {post.title && (
          <h3 className="font-semibold text-lg mt-2">{post.title}</h3>
        )}
      </CardHeader>
      
      <CardContent>
        {renderContent()}
        
        <Separator className="my-4" />
        
        <PostActions
          postId={post.id}
          commentsCount={post.comments_count || 0}
          onToggleComments={() => setShowComments(!showComments)}
          onToggleRating={() => setShowRating(!showRating)}
        />
        
        {/* Comments Section */}
        {showComments && (
          <div className="mt-4 pt-4 border-t">
            <CommentSystem
              contentId={post.id}
              contentType="post"
            />
          </div>
        )}
        
        {/* Rating Section */}
        {showRating && (
          <div className="mt-4 pt-4 border-t">
            <RatingSystem
              contentId={post.id}
              contentType="post"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
