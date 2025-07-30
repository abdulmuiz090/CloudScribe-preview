
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Users, FileText, ShoppingBag, X, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getPublishedProducts, getPublishedBlogs } from '@/lib/api';
import { getAdminUsers } from '@/lib/follow-api';
import { getPublicPosts } from '@/lib/posts-api';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface GlobalSearchProps {
  onClose?: () => void;
}

export const GlobalSearch = ({ onClose }: GlobalSearchProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<any>({
    users: [],
    posts: [],
    products: [],
    blogs: [],
    templates: []
  });

  // Get all data for searching
  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ['products', 'search'],
    queryFn: getPublishedProducts
  });

  const { data: blogs, isLoading: blogsLoading } = useQuery({
    queryKey: ['blogs', 'search'],
    queryFn: getPublishedBlogs
  });

  const { data: posts, isLoading: postsLoading } = useQuery({
    queryKey: ['posts', 'search'],
    queryFn: getPublicPosts
  });

  const { data: allUsers, isLoading: usersLoading } = useQuery({
    queryKey: ['users', 'search'],
    queryFn: getAdminUsers
  });

  // Filter out super-admin from search results
  const users = allUsers?.filter(user => user.role === 'admin');

  const { data: templates, isLoading: templatesLoading } = useQuery({
    queryKey: ['templates', 'search'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  const isLoading = productsLoading || blogsLoading || postsLoading || usersLoading || templatesLoading;

  useEffect(() => {
    if (!searchQuery.trim()) {
      setResults({ users: [], posts: [], products: [], blogs: [], templates: [] });
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const query = searchQuery.toLowerCase();

    // Perform search across all data
    const filteredUsers = (users || []).filter((user: any) =>
      user.full_name?.toLowerCase().includes(query) ||
      user.username?.toLowerCase().includes(query) ||
      user.bio?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query)
    );

    const filteredPosts = (posts || []).filter((post: any) =>
      post.title?.toLowerCase().includes(query) ||
      post.content_data?.text?.toLowerCase().includes(query)
    );

    const filteredProducts = (products || []).filter((product: any) =>
      product.name?.toLowerCase().includes(query) ||
      product.description?.toLowerCase().includes(query)
    );

    const filteredBlogs = (blogs || []).filter((blog: any) =>
      blog.title?.toLowerCase().includes(query) ||
      blog.content?.toLowerCase().includes(query)
    );

    const filteredTemplates = (templates || []).filter((template: any) =>
      template.name?.toLowerCase().includes(query) ||
      template.description?.toLowerCase().includes(query)
    );

    setResults({
      users: filteredUsers.slice(0, 5),
      posts: filteredPosts.slice(0, 5),
      products: filteredProducts.slice(0, 5),
      blogs: filteredBlogs.slice(0, 5),
      templates: filteredTemplates.slice(0, 5)
    });
    setIsSearching(false);
  }, [searchQuery, users, posts, products, blogs, templates]);

  const hasResults = results.users.length > 0 || results.posts.length > 0 || 
                   results.products.length > 0 || results.blogs.length > 0 || 
                   results.templates.length > 0;

  const totalResults = results.users.length + results.posts.length + 
                      results.products.length + results.blogs.length + 
                      results.templates.length;

  return (
    <div className="relative w-full max-w-2xl">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search users, posts, products, blogs, templates..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-10"
        />
        {onClose && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {searchQuery && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-background border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {isLoading || isSearching ? (
            <div className="p-4 text-center">
              <Loader2 className="h-4 w-4 animate-spin mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Searching...</p>
            </div>
          ) : hasResults ? (
            <div className="p-4 space-y-4">
              <div className="text-xs text-muted-foreground">
                Found {totalResults} result{totalResults !== 1 ? 's' : ''} for "{searchQuery}"
              </div>

              {/* Users */}
              {results.users.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-4 w-4" />
                    <span className="font-medium text-sm">Users ({results.users.length})</span>
                  </div>
                  <div className="space-y-2">
                    {results.users.map((user: any) => (
                      <Link
                        key={user.id}
                        to={`/profile/${user.username || user.id}`}
                        className="block p-2 hover:bg-accent rounded"
                        onClick={onClose}
                      >
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            {user.full_name?.[0] || 'U'}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{user.full_name}</p>
                            <p className="text-xs text-muted-foreground">@{user.username || user.email?.split('@')[0]}</p>
                          </div>
                          <Badge variant="secondary" className="ml-auto text-xs">
                            {user.role}
                          </Badge>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Posts */}
              {results.posts.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-4 w-4" />
                    <span className="font-medium text-sm">Posts ({results.posts.length})</span>
                  </div>
                  <div className="space-y-2">
                    {results.posts.map((post: any) => (
                      <Link
                        key={post.id}
                        to="/posts"
                        className="block p-2 hover:bg-accent rounded"
                        onClick={onClose}
                      >
                        <p className="font-medium text-sm line-clamp-1">{post.title || 'Untitled Post'}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {post.content_data?.text || 'No content preview'}
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Products */}
              {results.products.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <ShoppingBag className="h-4 w-4" />
                    <span className="font-medium text-sm">Products ({results.products.length})</span>
                  </div>
                  <div className="space-y-2">
                    {results.products.map((product: any) => (
                      <Link
                        key={product.id}
                        to="/marketplace"
                        className="block p-2 hover:bg-accent rounded"
                        onClick={onClose}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-sm">{product.name}</p>
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {product.description}
                            </p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            ${product.price}
                          </Badge>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Blogs */}
              {results.blogs.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-4 w-4" />
                    <span className="font-medium text-sm">Blogs ({results.blogs.length})</span>
                  </div>
                  <div className="space-y-2">
                    {results.blogs.map((blog: any) => (
                      <Link
                        key={blog.id}
                        to="/blogs"
                        className="block p-2 hover:bg-accent rounded"
                        onClick={onClose}
                      >
                        <p className="font-medium text-sm line-clamp-1">{blog.title}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {blog.content?.substring(0, 100)}...
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Templates */}
              {results.templates.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-4 w-4" />
                    <span className="font-medium text-sm">Templates ({results.templates.length})</span>
                  </div>
                  <div className="space-y-2">
                    {results.templates.map((template: any) => (
                      <Link
                        key={template.id}
                        to="/templates"
                        className="block p-2 hover:bg-accent rounded"
                        onClick={onClose}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-sm">{template.name}</p>
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {template.description}
                            </p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {template.is_free ? 'Free' : `$${template.price}`}
                          </Badge>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 text-center">
              <p className="text-sm text-muted-foreground">No results found for "{searchQuery}"</p>
              <p className="text-xs text-muted-foreground mt-1">Try different keywords or check spelling</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
