
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Share2, Eye } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toggleLike, hasUserLiked, getLikeCount } from '@/lib/likes-api';

interface PostActionsProps {
  postId: string;
  commentsCount: number;
  onToggleComments: () => void;
  onToggleRating: () => void;
}

export function PostActions({ postId, commentsCount, onToggleComments, onToggleRating }: PostActionsProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: isLiked = false } = useQuery({
    queryKey: ['user-liked', postId, 'post'],
    queryFn: () => hasUserLiked(postId, 'post'),
    enabled: !!user,
  });

  const { data: likeCount = 0 } = useQuery({
    queryKey: ['like-count', postId, 'post'],
    queryFn: () => getLikeCount(postId, 'post'),
  });

  const likeMutation = useMutation({
    mutationFn: () => toggleLike(postId, 'post'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-liked', postId, 'post'] });
      queryClient.invalidateQueries({ queryKey: ['like-count', postId, 'post'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update like. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleLike = () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to like posts.",
        variant: "destructive",
      });
      return;
    }
    likeMutation.mutate();
  };

  const handleShare = () => {
    const url = `${window.location.origin}/posts/${postId}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "Link Copied",
      description: "Post link has been copied to clipboard.",
    });
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2 sm:space-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLike}
          disabled={likeMutation.isPending}
          className={`${isLiked ? "text-red-500" : ""} text-xs sm:text-sm`}
        >
          <Heart className={`h-4 w-4 mr-1 ${isLiked ? 'fill-current' : ''}`} />
          <span className="hidden sm:inline">{likeCount}</span>
          <span className="sm:hidden">{likeCount > 999 ? '999+' : likeCount}</span>
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleComments}
          className="text-xs sm:text-sm"
        >
          <MessageCircle className="h-4 w-4 mr-1" />
          <span className="hidden sm:inline">{commentsCount || 0}</span>
          <span className="sm:hidden">{commentsCount > 999 ? '999+' : commentsCount || 0}</span>
        </Button>
        
        <Button variant="ghost" size="sm" onClick={handleShare} className="text-xs sm:text-sm">
          <Share2 className="h-4 w-4 mr-1" />
          <span className="hidden sm:inline">Share</span>
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleRating}
          className="text-xs sm:text-sm"
        >
          <Eye className="h-4 w-4 mr-1" />
          <span className="hidden sm:inline">Rate</span>
        </Button>
      </div>
    </div>
  );
}
