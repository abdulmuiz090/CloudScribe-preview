import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { ShoppingBag, Plus, Filter } from "lucide-react";
import { ProductCard } from "@/components/products/ProductCard";
import { CardSkeleton } from "@/components/ui/card-skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from '@tanstack/react-query';
import type { Product } from "@/types/database.types";

interface ProductWithSeller extends Product {
  seller?: {
    full_name: string;
  };
}

const MarketplacePage = () => {
  const { userRole } = useAuth();
  const canCreate = userRole === 'admin' || userRole === 'super-admin';
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const { data: categories = [] } = useQuery({
    queryKey: ['product-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products', selectedCategory],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select(`
          *,
          seller:user_profiles(full_name),
          category:product_categories(name)
        `)
        .eq('published', true);

      if (selectedCategory !== 'all') {
        query = query.eq('category_id', selectedCategory);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as ProductWithSeller[];
    },
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <ShoppingBag className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Marketplace</h1>
              <p className="text-muted-foreground">
                Discover amazing products from our community of creators
              </p>
            </div>
          </div>
          {canCreate && (
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          )}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <CardSkeleton type="product" count={6} />
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-center">No Products Available</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground mb-4">
                No published products found. Check back later for new items!
              </p>
              {canCreate && (
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Product
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MarketplacePage;
