import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare, Send, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { getComments, createComment, updateComment, deleteComment, type Comment } from '@/lib/comments-api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface CommentSystemProps {
  contentId: string;
  contentType: 'post' | 'product' | 'blog' | 'template';
}

export const CommentSystem = ({ contentId, contentType }: CommentSystemProps) => {
  const [newComment, setNewComment] = useState('');
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const { user, userProfile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['comments', contentId, contentType],
    queryFn: () => getComments(contentId, contentType),
  });

  const createMutation = useMutation({
    mutationFn: (content: string) => createComment(contentId, contentType, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', contentId, contentType] });
      setNewComment('');
      toast({
        title: "Comment Added",
        description: "Your comment has been posted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to post comment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ commentId, content }: { commentId: string; content: string }) => 
      updateComment(commentId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', contentId, contentType] });
      setEditingComment(null);
      setEditContent('');
      toast({
        title: "Comment Updated",
        description: "Your comment has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update comment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteComment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', contentId, contentType] });
      toast({
        title: "Comment Deleted",
        description: "Your comment has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete comment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to comment.",
        variant: "destructive",
      });
      return;
    }

    createMutation.mutate(newComment);
  };

  const handleEditComment = (comment: Comment) => {
    setEditingComment(comment.id);
    setEditContent(comment.content);
  };

  const handleUpdateComment = () => {
    if (!editContent.trim() || !editingComment) return;
    updateMutation.mutate({ commentId: editingComment, content: editContent });
  };

  const handleDeleteComment = (commentId: string) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      deleteMutation.mutate(commentId);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Comments ({comments.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add Comment */}
        {user && (
          <div className="space-y-2">
            <Textarea
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={3}
            />
            <Button 
              onClick={handleSubmitComment}
              disabled={createMutation.isPending || !newComment.trim()}
              size="sm"
            >
              <Send className="h-4 w-4 mr-2" />
              {createMutation.isPending ? "Posting..." : "Post Comment"}
            </Button>
          </div>
        )}

        {/* Comments List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : comments.length > 0 ? (
            comments.map((comment) => (
              <div key={comment.id} className="flex gap-3 p-3 border rounded-lg">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={comment.user_profiles?.profile_image_url} />
                  <AvatarFallback>{comment.user_profiles?.full_name?.[0] || 'U'}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{comment.user_profiles?.full_name || 'Anonymous'}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    {user?.id === comment.user_id && (
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditComment(comment)}
                          className="h-6 w-6 p-0"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteComment(comment.id)}
                          className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                  {editingComment === comment.id ? (
                    <div className="space-y-2">
                      <Textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        rows={2}
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={handleUpdateComment}
                          disabled={updateMutation.isPending}
                        >
                          Save
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingComment(null);
                            setEditContent('');
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm">{comment.content}</p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No comments yet. Be the first to comment!</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
