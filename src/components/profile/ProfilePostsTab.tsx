
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getPostsByAdmin } from '@/lib/posts-api';
import { Post } from '@/types/database.types';
import { Lock, Heart, MessageCircle, Share, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface ProfilePostsTabProps {
  userId: string;
}

export const ProfilePostsTab = ({ userId }: ProfilePostsTabProps) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'recent' | 'popular'>('recent');

  useEffect(() => {
    fetchPosts();
  }, [userId]);

  const fetchPosts = async () => {
    try {
      const postsData = await getPostsByAdmin(userId);
      setPosts(postsData);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getContentPreview = (post: Post) => {
    if (post.content_type === 'text') {
      return post.content_data.text?.substring(0, 150) + '...';
    }
    return post.title || 'Untitled Post';
  };

  const getContentThumbnail = (post: Post) => {
    if (post.content_type === 'image') {
      return post.content_data.image_url;
    }
    if (post.content_type === 'video') {
      return post.content_data.image_url; // thumbnail
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <div className="h-48 bg-muted rounded-t-lg" />
            <CardContent className="p-4">
              <div className="h-4 bg-muted rounded mb-2" />
              <div className="h-3 bg-muted rounded w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter Buttons */}
      <div className="flex items-center gap-2">
        <Button
          variant={filter === 'recent' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('recent')}
        >
          Most Recent
        </Button>
        <Button
          variant={filter === 'popular' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('popular')}
        >
          Most Popular
        </Button>
      </div>

      {/* Posts Grid */}
      {posts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No posts published yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Card key={post.id} className="group hover:shadow-lg transition-shadow cursor-pointer">
              {/* Thumbnail */}
              {getContentThumbnail(post) && (
                <div className="relative h-48 overflow-hidden rounded-t-lg">
                  <img 
                    src={getContentThumbnail(post)} 
                    alt="Post thumbnail"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  {post.is_paid && (
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-yellow-500 text-yellow-900">
                        <Lock className="h-3 w-3 mr-1" />
                        Premium
                      </Badge>
                    </div>
                  )}
                </div>
              )}
              
              <CardContent className="p-4">
                <div className="space-y-3">
                  {/* Content Type Badge */}
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">
                      {post.content_type.charAt(0).toUpperCase() + post.content_type.slice(1)}
                    </Badge>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3 mr-1" />
                      {format(new Date(post.created_at), 'MMM d')}
                    </div>
                  </div>

                  {/* Title/Preview */}
                  <div>
                    {post.title && (
                      <h3 className="font-medium text-sm mb-1 line-clamp-2">
                        {post.title}
                      </h3>
                    )}
                    <p className="text-xs text-muted-foreground line-clamp-3">
                      {getContentPreview(post)}
                    </p>
                  </div>

                  {/* Engagement Stats */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        <span>{post.likes_count || 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="h-3 w-3" />
                        <span>{post.comments_count || 0}</span>
                      </div>
                    </div>
                    
                    {post.is_paid && (
                      <Badge variant="outline" className="text-xs">
                        ₦{post.price}
                      </Badge>
                    )}
                  </div>

                  {/* CTA Button */}
                  <Button size="sm" className="w-full" variant={post.is_paid ? 'default' : 'outline'}>
                    {post.is_paid ? `Unlock for ₦${post.price}` : 'Read More'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
