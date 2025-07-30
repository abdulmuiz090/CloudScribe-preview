
import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { getPostsByAdmin, getPublicPosts } from '@/lib/posts-api';
import { getUserById } from '@/lib/api';
import { PostCard } from '@/components/posts/PostCard';
import { CreatePostDialog } from '@/components/posts/CreatePostDialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Loader2, Search, FileText } from 'lucide-react';
import type { Post, UserProfile } from '@/types/database.types';

export default function PostsPage() {
  const { user, userRole } = useAuth();
  const [myPosts, setMyPosts] = useState<Post[]>([]);
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [postsWithAuthors, setPostsWithAuthors] = useState<Array<{ post: Post; author: UserProfile }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [contentFilter, setContentFilter] = useState<string>('all');

  const canCreatePosts = userRole === 'admin' || userRole === 'super-admin';

  useEffect(() => {
    loadPosts();
  }, [user]);

  const loadPosts = async () => {
    setIsLoading(true);
    try {
      // Load user's own posts if they're an admin
      if (user && canCreatePosts) {
        const userPosts = await getPostsByAdmin(user.id);
        setMyPosts(userPosts);
      }

      // Load all public posts
      const publicPosts = await getPublicPosts();
      setAllPosts(publicPosts);

      // Load author profiles for each post
      const postsWithAuthorData = await Promise.all(
        publicPosts.map(async (post) => {
          try {
            const author = await getUserById(post.admin_id);
            return { post, author };
          } catch (error) {
            console.error('Error loading author for post:', post.id, error);
            return null;
          }
        })
      );

      setPostsWithAuthors(postsWithAuthorData.filter(Boolean) as Array<{ post: Post; author: UserProfile }>);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePostCreated = () => {
    loadPosts();
  };

  const filteredPosts = postsWithAuthors.filter(({ post, author }) => {
    const matchesSearch = post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.content_data.text?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         author.full_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = contentFilter === 'all' || post.content_type === contentFilter;
    
    return matchesSearch && matchesFilter;
  });

  const filteredMyPosts = myPosts.filter((post) => {
    const matchesSearch = post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.content_data.text?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = contentFilter === 'all' || post.content_type === contentFilter;
    
    return matchesSearch && matchesFilter;
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Posts</h1>
            <p className="text-muted-foreground mt-2">
              Discover and share content across the platform.
            </p>
          </div>
          
          {canCreatePosts && (
            <CreatePostDialog onPostCreated={handlePostCreated} />
          )}
        </div>

        {/* Search and Filters */}
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={contentFilter} onValueChange={setContentFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Content type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="text">Text</SelectItem>
              <SelectItem value="image">Image</SelectItem>
              <SelectItem value="video">Video</SelectItem>
              <SelectItem value="file">File</SelectItem>
              <SelectItem value="link">Link</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Tabs defaultValue="discover" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="discover">Discover Posts</TabsTrigger>
            {canCreatePosts && (
              <TabsTrigger value="my-posts">My Posts</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="discover" className="mt-6">
            {filteredPosts.length > 0 ? (
              <div className="space-y-6">
                {filteredPosts.map(({ post, author }) => (
                  <PostCard 
                    key={post.id} 
                    post={post} 
                    author={author}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No posts found</h3>
                <p className="text-muted-foreground">
                  {searchTerm || contentFilter !== 'all' 
                    ? "Try adjusting your search or filters." 
                    : "Be the first to create a post and start sharing!"}
                </p>
              </div>
            )}
          </TabsContent>

          {canCreatePosts && (
            <TabsContent value="my-posts" className="mt-6">
              {filteredMyPosts.length > 0 ? (
                <div className="space-y-6">
                  {filteredMyPosts.map((post) => (
                    <PostCard 
                      key={post.id} 
                      post={post} 
                      author={user ? {
                        id: user.id,
                        full_name: user.user_metadata?.full_name || 'You',
                        email: user.email || '',
                        role: userRole as any,
                        profile_image_url: user.user_metadata?.profile_image_url,
                        created_at: '',
                        updated_at: ''
                      } : undefined}
                      showActions={true}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Create Your First Post</h3>
                  <p className="text-muted-foreground mb-6">
                    Share your thoughts, images, videos, or files with your audience.
                  </p>
                  <CreatePostDialog onPostCreated={handlePostCreated} />
                </div>
              )}
            </TabsContent>
          )}
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
