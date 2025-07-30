
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { CommentSystem } from '@/components/comments/CommentSystem';
import { RatingSystem } from '@/components/rating/RatingSystem';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Heart, 
  MessageCircle, 
  Share2, 
  Star,
  User
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toggleLike, hasUserLiked, getLikeCount } from '@/lib/likes-api';
import type { Blog } from '@/types/database.types';

interface BlogWithAuthor extends Blog {
  author?: {
    full_name: string;
    profile_image_url?: string;
  };
}

const BlogDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showComments, setShowComments] = useState(false);
  const [showRating, setShowRating] = useState(false);

  // Fetch blog data
  const { data: blog, isLoading: blogLoading, error: blogError } = useQuery({
    queryKey: ['blog', id],
    queryFn: async () => {
      if (!id) throw new Error('Blog ID is required');
      
      const { data, error } = await supabase
        .from('blogs')
        .select(`
          *,
          author:user_profiles(full_name, profile_image_url)
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as BlogWithAuthor;
    },
    enabled: !!id,
  });

  // Fetch like data
  const { data: isLiked = false } = useQuery({
    queryKey: ['user-liked', id, 'blog'],
    queryFn: () => hasUserLiked(id!, 'blog'),
    enabled: !!user && !!id,
  });

  const { data: likeCount = 0 } = useQuery({
    queryKey: ['like-count', id, 'blog'],
    queryFn: () => getLikeCount(id!, 'blog'),
    enabled: !!id,
  });

  // Like mutation
  const likeMutation = useMutation({
    mutationFn: () => toggleLike(id!, 'blog'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-liked', id, 'blog'] });
      queryClient.invalidateQueries({ queryKey: ['like-count', id, 'blog'] });
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
        description: "Please log in to like blogs.",
        variant: "destructive",
      });
      return;
    }
    likeMutation.mutate();
  };

  const handleShare = () => {
    const url = `${window.location.origin}/dashboard/blogs/${id}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "Link Copied",
      description: "Blog link has been copied to clipboard.",
    });
  };

  const getReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const wordCount = content.split(' ').length;
    return Math.ceil(wordCount / wordsPerMinute);
  };

  if (blogLoading) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-8 w-32" />
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-3/4" />
              <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (blogError || !blog) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="text-center py-12">
              <h2 className="text-2xl font-semibold mb-2">Blog Not Found</h2>
              <p className="text-muted-foreground mb-4">
                The blog you're looking for doesn't exist or has been removed.
              </p>
              <Link to="/dashboard/blogs">
                <Button>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Blogs
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back Button */}
        <Link to="/dashboard/blogs">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Blogs
          </Button>
        </Link>

        {/* Main Blog Card */}
        <Card>
          <CardHeader className="space-y-4">
            {/* Blog Title */}
            <h1 className="text-3xl font-bold leading-tight">{blog.title}</h1>
            
            {/* Author & Meta Information */}
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={blog.author?.profile_image_url} />
                  <AvatarFallback>
                    {blog.author?.full_name?.[0] || 'A'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{blog.author?.full_name || 'Anonymous'}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {formatDistanceToNow(new Date(blog.created_at), { addSuffix: true })}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {getReadingTime(blog.content)} min read
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Badges */}
              <div className="flex items-center gap-2">
                {blog.published ? (
                  <Badge variant="default">Published</Badge>
                ) : (
                  <Badge variant="secondary">Draft</Badge>
                )}
                {blog.featured && (
                  <Badge variant="outline">Featured</Badge>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Blog Content */}
            <div className="prose prose-sm max-w-none">
              <div className="whitespace-pre-wrap leading-relaxed">
                {blog.content}
              </div>
            </div>

            <Separator />

            {/* Action Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLike}
                  disabled={likeMutation.isPending}
                  className={isLiked ? "text-red-500" : ""}
                >
                  <Heart className={`h-4 w-4 mr-2 ${isLiked ? 'fill-current' : ''}`} />
                  {likeCount} {likeCount === 1 ? 'Like' : 'Likes'}
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowComments(!showComments)}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Comments
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowRating(!showRating)}
                >
                  <Star className="h-4 w-4 mr-2" />
                  Rate
                </Button>
              </div>

              <Button variant="ghost" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>

            {/* Comments Section */}
            {showComments && (
              <div className="pt-6 border-t">
                <CommentSystem
                  contentId={blog.id}
                  contentType="blog"
                />
              </div>
            )}

            {/* Rating Section */}
            {showRating && (
              <div className="pt-6 border-t">
                <RatingSystem
                  contentId={blog.id}
                  contentType="blog"
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default BlogDetailPage;
