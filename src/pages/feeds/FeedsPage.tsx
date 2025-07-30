
import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Search, 
  Filter,
  RefreshCw,
  Eye,
  Play,
  Download,
  ShoppingCart,
  Star
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface Post {
  id: string;
  admin_id: string;
  title?: string;
  content_type: string;
  content_data: any;
  likes_count: number;
  comments_count: number;
  published: boolean;
  created_at: string;
  visibility: string;
  user_profiles?: {
    full_name: string;
    profile_image_url?: string;
  };
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url?: string;
  seller_id: string;
  published: boolean;
  created_at: string;
  user_profiles?: {
    full_name: string;
  };
}

interface Template {
  id: string;
  name: string;
  description: string;
  price?: number;
  is_free: boolean;
  preview_image_url?: string;
  author_id: string;
  published: boolean;
  created_at: string;
  user_profiles?: {
    full_name: string;
  };
}

interface Blog {
  id: string;
  title: string;
  content: string;
  author_id: string;
  published: boolean;
  created_at: string;
  user_profiles?: {
    full_name: string;
  };
}

const FeedsPage = () => {
  const { userProfile, userRole } = useAuth();
  const { toast } = useToast();
  
  const [posts, setPosts] = useState<Post[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('posts');

  // Fetch posts
  const fetchPosts = async () => {
    try {
      let query = supabase
        .from('posts')
        .select(`
          *,
          user_profiles!posts_admin_id_fkey (
            full_name,
            profile_image_url
          )
        `)
        .eq('published', true)
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,content_data->>text.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({
        title: "Error",
        description: "Failed to load posts",
        variant: "destructive",
      });
    }
  };

  // Fetch products
  const fetchProducts = async () => {
    try {
      let query = supabase
        .from('products')
        .select(`
          *,
          user_profiles!products_seller_id_fkey (
            full_name
          )
        `)
        .eq('published', true)
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive",
      });
    }
  };

  // Fetch templates
  const fetchTemplates = async () => {
    try {
      let query = supabase
        .from('templates')
        .select(`
          *,
          user_profiles!templates_author_id_fkey (
            full_name
          )
        `)
        .eq('published', true)
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast({
        title: "Error",
        description: "Failed to load templates",
        variant: "destructive",
      });
    }
  };

  // Fetch blogs
  const fetchBlogs = async () => {
    try {
      let query = supabase
        .from('blogs')
        .select(`
          *,
          user_profiles!blogs_author_id_fkey (
            full_name
          )
        `)
        .eq('published', true)
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      setBlogs(data || []);
    } catch (error) {
      console.error('Error fetching blogs:', error);
      toast({
        title: "Error",
        description: "Failed to load blogs",
        variant: "destructive",
      });
    }
  };

  // Fetch all data
  const fetchAllData = async () => {
    setLoading(true);
    await Promise.all([
      fetchPosts(),
      fetchProducts(),
      fetchTemplates(),
      fetchBlogs()
    ]);
    setLoading(false);
  };

  useEffect(() => {
    fetchAllData();
  }, [searchTerm]);

  // Handle like post
  const handleLike = async (postId: string) => {
    if (!userProfile) {
      toast({
        title: "Login Required",
        description: "Please login to like posts",
        variant: "destructive",
      });
      return;
    }

    try {
      // Check if already liked
      const { data: existingLike } = await supabase
        .from('likes')
        .select('id')
        .eq('content_id', postId)
        .eq('user_id', userProfile.id)
        .eq('content_type', 'post')
        .single();

      if (existingLike) {
        // Unlike
        await supabase
          .from('likes')
          .delete()
          .eq('content_id', postId)
          .eq('user_id', userProfile.id)
          .eq('content_type', 'post');
      } else {
        // Like
        await supabase
          .from('likes')
          .insert({
            content_id: postId,
            user_id: userProfile.id,
            content_type: 'post'
          });
      }

      // Refresh posts
      fetchPosts();
    } catch (error) {
      console.error('Error handling like:', error);
      toast({
        title: "Error",
        description: "Failed to update like",
        variant: "destructive",
      });
    }
  };

  const renderPostContent = (post: Post) => {
    const { content_type, content_data } = post;
    
    switch (content_type) {
      case 'text':
        return (
          <div className="prose dark:prose-invert max-w-none">
            <p>{content_data.text}</p>
          </div>
        );
      case 'image':
        return (
          <div className="space-y-2">
            {content_data.text && <p>{content_data.text}</p>}
            <img 
              src={content_data.image_url} 
              alt="Post content" 
              className="rounded-lg max-w-full h-auto"
            />
          </div>
        );
      case 'video':
        return (
          <div className="space-y-2">
            {content_data.text && <p>{content_data.text}</p>}
            <div className="relative bg-gray-100 dark:bg-gray-800 rounded-lg p-4 flex items-center justify-center">
              <Play className="h-12 w-12 text-gray-500" />
              <span className="ml-2">Video: {content_data.video_url}</span>
            </div>
          </div>
        );
      case 'link':
        return (
          <div className="space-y-2">
            {content_data.text && <p>{content_data.text}</p>}
            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="p-3">
                <h4 className="font-medium">{content_data.link_title}</h4>
                <p className="text-sm text-muted-foreground">{content_data.link_description}</p>
                <a 
                  href={content_data.link_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline text-sm"
                >
                  {content_data.link_url}
                </a>
              </CardContent>
            </Card>
          </div>
        );
      default:
        return <p>Unsupported content type</p>;
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <RefreshCw className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Feeds</h2>
          <p className="text-muted-foreground">
            Discover content from across the platform
          </p>
        </div>

        {/* Search and Filter */}
        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            onClick={fetchAllData}
            disabled={loading}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="posts">Posts ({posts.length})</TabsTrigger>
            <TabsTrigger value="products">Products ({products.length})</TabsTrigger>
            <TabsTrigger value="templates">Templates ({templates.length})</TabsTrigger>
            <TabsTrigger value="blogs">Blogs ({blogs.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="space-y-4">
            {posts.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-muted-foreground">No posts found</p>
                </CardContent>
              </Card>
            ) : (
              posts.map((post) => (
                <Card key={post.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={post.user_profiles?.profile_image_url} />
                        <AvatarFallback>
                          {post.user_profiles?.full_name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{post.user_profiles?.full_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(post.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {post.title && (
                      <CardTitle className="text-lg">{post.title}</CardTitle>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {renderPostContent(post)}
                    
                    <div className="flex items-center space-x-4 pt-2 border-t">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleLike(post.id)}
                      >
                        <Heart className="h-4 w-4 mr-1" />
                        {post.likes_count}
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MessageCircle className="h-4 w-4 mr-1" />
                        {post.comments_count}
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Share2 className="h-4 w-4 mr-1" />
                        Share
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="products" className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <Card key={product.id} className="hover:shadow-md transition-shadow">
                  <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-t-lg">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover rounded-t-lg"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingCart className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                    <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                      {product.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-lg">${product.price}</p>
                        <p className="text-xs text-muted-foreground">
                          by {product.user_profiles?.full_name}
                        </p>
                      </div>
                      <Link to={`/marketplace/${product.id}`}>
                        <Button size="sm">View</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="templates" className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {templates.map((template) => (
                <Card key={template.id} className="hover:shadow-md transition-shadow">
                  <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-t-lg">
                    {template.preview_image_url ? (
                      <img
                        src={template.preview_image_url}
                        alt={template.name}
                        className="w-full h-full object-cover rounded-t-lg"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Download className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-2">{template.name}</h3>
                    <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                      {template.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div>
                        {template.is_free ? (
                          <Badge variant="secondary">Free</Badge>
                        ) : (
                          <p className="font-bold text-lg">${template.price}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          by {template.user_profiles?.full_name}
                        </p>
                      </div>
                      <Link to={`/templates/${template.id}`}>
                        <Button size="sm">View</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="blogs" className="space-y-4">
            {blogs.map((blog) => (
              <Card key={blog.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl">{blog.title}</CardTitle>
                      <CardDescription className="flex items-center space-x-2 mt-2">
                        <span>by {blog.user_profiles?.full_name}</span>
                        <span>•</span>
                        <span>{new Date(blog.created_at).toLocaleDateString()}</span>
                      </CardDescription>
                    </div>
                    <Badge variant="outline">
                      <Eye className="h-3 w-3 mr-1" />
                      Blog
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground line-clamp-3 mb-4">
                    {blog.content.substring(0, 200)}...
                  </p>
                  <Link to={`/blogs/${blog.id}`}>
                    <Button variant="outline">Read More</Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default FeedsPage;
