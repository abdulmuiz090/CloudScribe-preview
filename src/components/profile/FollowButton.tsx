
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { followUser, unfollowUser, isFollowing } from '@/lib/follow-api';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserPlus, UserMinus, Loader2 } from 'lucide-react';

interface FollowButtonProps {
  userId: string;
  onFollowChange?: () => void;
}

export function FollowButton({ userId, onFollowChange }: FollowButtonProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Don't show follow button for own profile
  if (!user || user.id === userId) {
    return null;
  }

  const { data: isFollowingUser, isLoading } = useQuery({
    queryKey: ['isFollowing', userId],
    queryFn: () => isFollowing(userId),
  });

  const followMutation = useMutation({
    mutationFn: () => followUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['isFollowing', userId] });
      queryClient.invalidateQueries({ queryKey: ['userProfile', userId] });
      onFollowChange?.();
      toast({
        title: "Success",
        description: "You are now following this user!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to follow user",
        variant: "destructive",
      });
    },
  });

  const unfollowMutation = useMutation({
    mutationFn: () => unfollowUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['isFollowing', userId] });
      queryClient.invalidateQueries({ queryKey: ['userProfile', userId] });
      onFollowChange?.();
      toast({
        title: "Success",
        description: "You have unfollowed this user.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to unfollow user",
        variant: "destructive",
      });
    },
  });

  const handleClick = () => {
    if (isFollowingUser) {
      unfollowMutation.mutate();
    } else {
      followMutation.mutate();
    }
  };

  const isLoading2 = followMutation.isPending || unfollowMutation.isPending;

  if (isLoading) {
    return (
      <Button disabled size="sm">
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        Loading
      </Button>
    );
  }

  return (
    <Button
      onClick={handleClick}
      disabled={isLoading2}
      variant={isFollowingUser ? "outline" : "default"}
      size="sm"
    >
      {isLoading2 ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : isFollowingUser ? (
        <UserMinus className="h-4 w-4 mr-2" />
      ) : (
        <UserPlus className="h-4 w-4 mr-2" />
      )}
      {isFollowingUser ? "Unfollow" : "Follow"}
    </Button>
  );
}
