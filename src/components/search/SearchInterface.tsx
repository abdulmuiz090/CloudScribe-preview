
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Filter } from 'lucide-react';
import { useSearch } from '@/hooks/use-search';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export const SearchInterface = () => {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({
    type: 'all' as 'products' | 'blogs' | 'templates' | 'all',
    published: true,
    minPrice: undefined as number | undefined,
    maxPrice: undefined as number | undefined
  });
  
  const { results, loading, totalCount, search } = useSearch();

  const handleSearch = () => {
    search(query, filters);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="flex gap-4 items-end">
        <div className="flex-1">
          <Input
            placeholder="Search products, blogs, templates..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="text-lg h-12"
          />
        </div>
        <Button onClick={handleSearch} size="lg" disabled={loading}>
          {loading ? <LoadingSpinner size="sm" /> : <Search className="h-4 w-4" />}
          Search
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center flex-wrap">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <span className="text-sm font-medium">Filters:</span>
        </div>
        
        <Select value={filters.type} onValueChange={(value: any) => setFilters({ ...filters, type: value })}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="products">Products</SelectItem>
            <SelectItem value="blogs">Blogs</SelectItem>
            <SelectItem value="templates">Templates</SelectItem>
          </SelectContent>
        </Select>

        {filters.type === 'products' && (
          <>
            <Input
              type="number"
              placeholder="Min Price"
              value={filters.minPrice || ''}
              onChange={(e) => setFilters({ ...filters, minPrice: e.target.value ? Number(e.target.value) : undefined })}
              className="w-32"
            />
            <Input
              type="number"
              placeholder="Max Price"
              value={filters.maxPrice || ''}
              onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value ? Number(e.target.value) : undefined })}
              className="w-32"
            />
          </>
        )}
      </div>

      {/* Results */}
      {totalCount > 0 && (
        <div className="text-sm text-muted-foreground">
          Found {totalCount} result{totalCount !== 1 ? 's' : ''}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {results.map((item) => (
          <Card key={`${item.type}-${item.id}`} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg line-clamp-2">
                  {item.name || item.title}
                </CardTitle>
                <Badge variant="secondary">
                  {item.type}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground line-clamp-3 mb-4">
                {item.description || item.content?.substring(0, 150) + '...'}
              </p>
              
              {item.type === 'product' && (
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-primary">
                    ${Number(item.price).toFixed(2)}
                  </span>
                  {item.stock !== undefined && (
                    <span className="text-sm text-muted-foreground">
                      Stock: {item.stock}
                    </span>
                  )}
                </div>
              )}

              {item.type === 'template' && (
                <div className="flex justify-between items-center">
                  {item.is_free ? (
                    <Badge variant="outline">Free</Badge>
                  ) : (
                    <span className="font-semibold text-primary">
                      ${Number(item.price || 0).toFixed(2)}
                    </span>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {results.length === 0 && query && !loading && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No results found for "{query}"</p>
        </div>
      )}
    </div>
  );
};
