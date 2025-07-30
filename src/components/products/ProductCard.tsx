
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Product } from '@/types/database.types';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  return (
    <Link to={`/dashboard/products/${product.id}`} className="block group">
      <Card className="h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-2 border-border/50 hover:border-border overflow-hidden bg-card/50 backdrop-blur-sm">
        {/* Product Image */}
        <div className="relative overflow-hidden bg-gradient-to-br from-muted/20 to-muted/40">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-48 bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center">
              <ShoppingCart className="h-12 w-12 text-muted-foreground/50" />
            </div>
          )}
          
          {/* Badges Overlay */}
          <div className="absolute top-3 left-3 flex gap-2">
            {product.featured && (
              <Badge variant="default" className="text-xs font-medium bg-primary/90 backdrop-blur-sm">
                Featured
              </Badge>
            )}
            {!product.published && (
              <Badge variant="secondary" className="text-xs font-medium bg-secondary/90 backdrop-blur-sm">
                Draft
              </Badge>
            )}
          </div>

          {/* Quick Actions Overlay */}
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0 bg-background/80 backdrop-blur-sm hover:bg-background/90"
            >
              <Heart className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <CardHeader className="pb-3">
          <div className="space-y-2">
            <h3 className="font-semibold text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors">
              {product.name}
            </h3>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span>4.5</span>
                <span className="text-xs">(24)</span>
              </div>
              
              <div className="text-right">
                <div className="font-bold text-lg text-primary">
                  {formatPrice(Number(product.price))}
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2 mb-4">
            {product.description}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {product.stock !== null && product.stock > 0 ? (
                <Badge variant="outline" className="text-xs">
                  {product.stock} in stock
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-xs">
                  Out of stock
                </Badge>
              )}
            </div>
            
            <Button 
              size="sm" 
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Add to Cart
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
