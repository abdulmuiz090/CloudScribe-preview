
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, X } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useSearch } from '@/hooks/use-search';
import { useIsMobile } from '@/hooks/use-mobile';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export const MobileSearchInterface = () => {
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    type: 'all' as 'products' | 'blogs' | 'templates' | 'all',
    published: true
  });
  
  const { results, loading, search } = useSearch();
  const isMobile = useIsMobile();

  const handleSearch = () => {
    search(query, filters);
  };

  const clearSearch = () => {
    setQuery('');
    search('', filters);
  };

  if (!isMobile) return null;

  return (
    <div className="space-y-4">
      {/* Mobile Search Header */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            placeholder="Search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="pr-10"
          />
          {query && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
              onClick={clearSearch}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        <Button onClick={handleSearch} disabled={loading} size="icon">
          {loading ? <LoadingSpinner size="sm" /> : <Search className="h-4 w-4" />}
        </Button>
        
        <Sheet open={showFilters} onOpenChange={setShowFilters}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[60vh]">
            <SheetHeader>
              <SheetTitle>Search Filters</SheetTitle>
            </SheetHeader>
            <div className="space-y-4 mt-6">
              <div>
                <label className="text-sm font-medium mb-2 block">Content Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {['all', 'products', 'blogs', 'templates'].map((type) => (
                    <Button
                      key={type}
                      variant={filters.type === type ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilters({ ...filters, type: type as any })}
                      className="capitalize"
                    >
                      {type}
                    </Button>
                  ))}
                </div>
              </div>
              
              <Button 
                onClick={() => {
                  handleSearch();
                  setShowFilters(false);
                }}
                className="w-full"
              >
                Apply Filters
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Mobile Results */}
      <div className="space-y-3">
        {results.map((item) => (
          <Card key={`${item.type}-${item.id}`} className="p-3">
            <CardContent className="p-0">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium text-sm line-clamp-1">
                  {item.name || item.title}
                </h3>
                <Badge variant="secondary" className="text-xs">
                  {item.type}
                </Badge>
              </div>
              
              <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                {item.description || item.content?.substring(0, 100) + '...'}
              </p>
              
              {item.type === 'product' && (
                <div className="flex justify-between items-center text-sm">
                  <span className="font-semibold text-primary">
                    ${Number(item.price).toFixed(2)}
                  </span>
                  {item.stock !== undefined && (
                    <span className="text-muted-foreground">
                      Stock: {item.stock}
                    </span>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        
        {results.length === 0 && query && !loading && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No results found</p>
          </div>
        )}
      </div>
    </div>
  );
};
