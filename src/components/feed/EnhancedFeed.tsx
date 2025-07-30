
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, MessageSquare, Share2, Bookmark, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface FeedItem {
  id: string;
  type: 'blog' | 'video' | 'template' | 'product' | 'post';
  title: string;
  content?: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
    role?: string;
  };
  metadata: {
    likes: number;
    comments: number;
    shares: number;
    bookmarks: number;
    views?: number;
    price?: number;
  };
  tags?: string[];
  created_at: string;
  image_url?: string;
  isLiked?: boolean;
  isBookmarked?: boolean;
}

export const EnhancedFeed = () => {
  const { user } = useAuth();
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'following' | 'trending'>('all');

  const loadFeedItems = async () => {
    setIsLoading(true);
    try {
      const feedData: FeedItem[] = [];

      // Load blogs
      const { data: blogs } = await supabase
        .from('blogs')
        .select(`
          *,
          user_profiles(id, full_name, profile_image_url, role)
        `)
        .eq('published', true)
        .order('created_at', { ascending: false })
        .limit(10);

      if (blogs) {
        feedData.push(...blogs.map((blog: any) => ({
          id: blog.id,
          type: 'blog' as const,
          title: blog.title,
          content: blog.content?.substring(0, 200) + '...',
          author: {
            id: blog.user_profiles?.id || '',
            name: blog.user_profiles?.full_name || 'Unknown',
            avatar: blog.user_profiles?.profile_image_url,
            role: blog.user_profiles?.role
          },
          metadata: {
            likes: 0,
            comments: 0,
            shares: 0,
            bookmarks: 0,
            views: Math.floor(Math.random() * 1000)
          },
          created_at: blog.created_at,
          isLiked: false,
          isBookmarked: false
        })));
      }

      // Load videos
      const { data: videos } = await supabase
        .from('videos')
        .select(`
          *,
          user_profiles(id, full_name, profile_image_url, role)
        `)
        .eq('published', true)
        .order('created_at', { ascending: false })
        .limit(10);

      if (videos) {
        feedData.push(...videos.map((video: any) => ({
          id: video.id,
          type: 'video' as const,
          title: video.title,
          content: video.description,
          author: {
            id: video.user_profiles?.id || '',
            name: video.user_profiles?.full_name || 'Unknown',
            avatar: video.user_profiles?.profile_image_url,
            role: video.user_profiles?.role
          },
          metadata: {
            likes: 0,
            comments: 0,
            shares: 0,
            bookmarks: 0,
            views: Math.floor(Math.random() * 1000)
          },
          created_at: video.created_at,
          image_url: video.thumbnail_url,
          isLiked: false,
          isBookmarked: false
        })));
      }

      // Sort by created_at
      feedData.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      setFeedItems(feedData);
    } catch (error) {
      console.error('Error loading feed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = async (itemId: string) => {
    if (!user) return;

    setFeedItems(prev => prev.map(item => 
      item.id === itemId 
        ? { 
            ...item, 
            isLiked: !item.isLiked,
            metadata: {
              ...item.metadata,
              likes: item.isLiked ? item.metadata.likes - 1 : item.metadata.likes + 1
            }
          }
        : item
    ));
  };

  const handleBookmark = async (itemId: string) => {
    if (!user) return;

    setFeedItems(prev => prev.map(item => 
      item.id === itemId 
        ? { 
            ...item, 
            isBookmarked: !item.isBookmarked,
            metadata: {
              ...item.metadata,
              bookmarks: item.isBookmarked ? item.metadata.bookmarks - 1 : item.metadata.bookmarks + 1
            }
          }
        : item
    ));
  };

  useEffect(() => {
    loadFeedItems();
  }, [filter]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="rounded-full bg-muted h-12 w-12"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-muted rounded w-1/4"></div>
                  <div className="h-3 bg-muted rounded w-1/6"></div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="h-4 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded w-5/6"></div>
                <div className="h-32 bg-muted rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="flex gap-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          onClick={() => setFilter('all')}
        >
          All
        </Button>
        <Button
          variant={filter === 'following' ? 'default' : 'outline'}
          onClick={() => setFilter('following')}
        >
          Following
        </Button>
        <Button
          variant={filter === 'trending' ? 'default' : 'outline'}
          onClick={() => setFilter('trending')}
        >
          <TrendingUp className="h-4 w-4 mr-2" />
          Trending
        </Button>
      </div>

      {/* Feed Items */}
      <div className="space-y-4">
        {feedItems.map((item) => (
          <Card key={item.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              {/* Author Header */}
              <div className="flex items-center space-x-3 mb-4">
                <Avatar>
                  <AvatarImage src={item.author.avatar} />
                  <AvatarFallback>{item.author.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{item.author.name}</p>
                    {item.author.role && (
                      <Badge variant="secondary" className="text-xs">
                        {item.author.role}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {new Date(item.created_at).toLocaleDateString()}
                  </p>
                </div>
                <Badge variant="outline">{item.type}</Badge>
              </div>

              {/* Content */}
              <div className="space-y-3">
                <h3 className="text-xl font-semibold">{item.title}</h3>
                {item.content && (
                  <p className="text-muted-foreground">{item.content}</p>
                )}
                
                {item.image_url && (
                  <div className="rounded-lg overflow-hidden">
                    <img 
                      src={item.image_url} 
                      alt={item.title}
                      className="w-full h-64 object-cover"
                    />
                  </div>
                )}

                {item.tags && item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {item.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between mt-6 pt-4 border-t">
                <div className="flex items-center space-x-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleLike(item.id)}
                    className={item.isLiked ? 'text-red-500' : ''}
                  >
                    <Heart className={`h-4 w-4 mr-2 ${item.isLiked ? 'fill-current' : ''}`} />
                    {item.metadata.likes}
                  </Button>
                  
                  <Button variant="ghost" size="sm">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    {item.metadata.comments}
                  </Button>
                  
                  <Button variant="ghost" size="sm">
                    <Share2 className="h-4 w-4 mr-2" />
                    {item.metadata.shares}
                  </Button>
                </div>

                <div className="flex items-center space-x-2">
                  {item.metadata.views && (
                    <span className="text-sm text-muted-foreground">
                      {item.metadata.views} views
                    </span>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleBookmark(item.id)}
                    className={item.isBookmarked ? 'text-blue-500' : ''}
                  >
                    <Bookmark className={`h-4 w-4 ${item.isBookmarked ? 'fill-current' : ''}`} />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {feedItems.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No content found</p>
          <p className="text-sm text-muted-foreground mt-2">
            Try following some creators or check back later
          </p>
        </div>
      )}
    </div>
  );
};
