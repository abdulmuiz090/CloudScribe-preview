
import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getUserProducts } from '@/lib/api';
import { Product } from '@/types/database.types';
import { ShoppingCart, Star, Download } from 'lucide-react';

interface ProfileProductsTabProps {
  userId: string;
}

interface ProductWithCategory extends Product {
  category?: { name: string };
}

export const ProfileProductsTab = ({ userId }: ProfileProductsTabProps) => {
  const [products, setProducts] = useState<ProductWithCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, [userId]);

  const fetchProducts = async () => {
    try {
      const productsData = await getUserProducts(userId);
      setProducts(productsData);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setIsLoading(false);
    }
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
      {products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No products available yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="group hover:shadow-lg transition-shadow cursor-pointer">
              {/* Product Image */}
              <div className="relative h-48 overflow-hidden rounded-t-lg bg-muted">
                {product.image_url ? (
                  <img 
                    src={product.image_url} 
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Download className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
                {product.featured && (
                  <div className="absolute top-2 left-2">
                    <Badge className="bg-yellow-500 text-yellow-900">
                      <Star className="h-3 w-3 mr-1" />
                      Featured
                    </Badge>
                  </div>
                )}
              </div>
              
              <CardContent className="p-4">
                <div className="space-y-3">
                  {/* Category */}
                  {product.category && (
                    <Badge variant="outline" className="text-xs">
                      {product.category.name}
                    </Badge>
                  )}

                  {/* Product Info */}
                  <div>
                    <h3 className="font-medium text-sm mb-1 line-clamp-2">
                      {product.name}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-3">
                      {product.description}
                    </p>
                  </div>

                  {/* Price */}
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-lg">
                      ₦{product.price.toLocaleString()}
                    </div>
                    
                    {product.stock !== null && (
                      <div className="text-xs text-muted-foreground">
                        {product.stock} left
                      </div>
                    )}
                  </div>

                  {/* CTA Button */}
                  <Button size="sm" className="w-full">
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Buy Now
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
