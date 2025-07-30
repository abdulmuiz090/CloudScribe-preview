
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Filter, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface SearchResult {
  id: string;
  type: 'blog' | 'video' | 'template' | 'product' | 'user';
  title: string;
  description?: string;
  author?: string;
  tags?: string[];
  created_at: string;
}

interface SearchFilters {
  type: string;
  dateRange: string;
  sortBy: string;
  tags: string[];
}

export const AdvancedSearchInterface = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    type: 'all',
    dateRange: 'all',
    sortBy: 'relevance',
    tags: []
  });
  const [availableTags, setAvailableTags] = useState<string[]>([]);

  const searchContent = async () => {
    if (!query.trim()) return;
    
    setIsLoading(true);
    try {
      const searchResults: SearchResult[] = [];

      // Search blogs
      if (filters.type === 'all' || filters.type === 'blog') {
        const { data: blogs } = await supabase
          .from('blogs')
          .select('*, user_profiles(full_name)')
          .eq('published', true)
          .ilike('title', `%${query}%`)
          .limit(10);

        if (blogs && Array.isArray(blogs)) {
          searchResults.push(...blogs.map((blog: any) => ({
            id: blog.id,
            type: 'blog' as const,
            title: blog.title,
            description: blog.content?.substring(0, 150) + '...',
            author: blog.user_profiles?.full_name,
            created_at: blog.created_at
          })));
        }
      }

      // Search videos
      if (filters.type === 'all' || filters.type === 'video') {
        const { data: videos } = await supabase
          .from('videos')
          .select('*, user_profiles(full_name)')
          .eq('published', true)
          .ilike('title', `%${query}%`)
          .limit(10);

        if (videos && Array.isArray(videos)) {
          searchResults.push(...videos.map((video: any) => ({
            id: video.id,
            type: 'video' as const,
            title: video.title,
            description: video.description,
            author: video.user_profiles?.full_name,
            created_at: video.created_at
          })));
        }
      }

      // Search products
      if (filters.type === 'all' || filters.type === 'product') {
        const { data: products } = await supabase
          .from('products')
          .select('*, user_profiles(full_name)')
          .eq('published', true)
          .ilike('name', `%${query}%`)
          .limit(10);

        if (products && Array.isArray(products)) {
          searchResults.push(...products.map((product: any) => ({
            id: product.id,
            type: 'product' as const,
            title: product.name,
            description: product.description,
            author: product.user_profiles?.full_name,
            created_at: product.created_at
          })));
        }
      }

      setResults(searchResults);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearFilters = () => {
    setFilters({
      type: 'all',
      dateRange: 'all',
      sortBy: 'relevance',
      tags: []
    });
  };

  const removeTag = (tagToRemove: string) => {
    setFilters(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  useEffect(() => {
    if (query) {
      const debounceTimer = setTimeout(searchContent, 300);
      return () => clearTimeout(debounceTimer);
    }
  }, [query, filters]);

  return (
    <div className="space-y-6">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search for blogs, videos, templates, products..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 pr-4 py-3 text-lg"
        />
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
            <Button variant="outline" size="sm" onClick={clearFilters}>
              Clear All
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Content Type</label>
              <Select value={filters.type} onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="blog">Blogs</SelectItem>
                  <SelectItem value="video">Videos</SelectItem>
                  <SelectItem value="template">Templates</SelectItem>
                  <SelectItem value="product">Products</SelectItem>
                  <SelectItem value="user">Users</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Date Range</label>
              <Select value={filters.dateRange} onValueChange={(value) => setFilters(prev => ({ ...prev, dateRange: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Sort By</label>
              <Select value={filters.sortBy} onValueChange={(value) => setFilters(prev => ({ ...prev, sortBy: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Relevance</SelectItem>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="popular">Most Popular</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Active Tags */}
          {filters.tags.length > 0 && (
            <div>
              <label className="text-sm font-medium mb-2 block">Active Tags</label>
              <div className="flex flex-wrap gap-2">
                {filters.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <X 
                      className="h-3 w-3 cursor-pointer hover:text-destructive" 
                      onClick={() => removeTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Searching...</p>
          </div>
        ) : results.length > 0 ? (
          <div>
            <p className="text-sm text-muted-foreground mb-4">
              Found {results.length} results for "{query}"
            </p>
            <div className="space-y-4">
              {results.map((result) => (
                <Card key={result.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">{result.type}</Badge>
                          {result.author && (
                            <span className="text-sm text-muted-foreground">by {result.author}</span>
                          )}
                        </div>
                        <h3 className="font-semibold text-lg mb-2">{result.title}</h3>
                        {result.description && (
                          <p className="text-muted-foreground text-sm mb-3">{result.description}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {new Date(result.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : query && !isLoading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No results found for "{query}"</p>
            <p className="text-sm text-muted-foreground mt-2">Try adjusting your search terms or filters</p>
          </div>
        ) : null}
      </div>
    </div>
  );
};
