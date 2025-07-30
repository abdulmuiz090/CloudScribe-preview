
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { ShoppingCart, ArrowLeft, Star, Package, Truck } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { AppLayout } from '@/components/layout/AppLayout';
import type { Product } from '@/types/database.types';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      if (!id) throw new Error('Product ID is required');
      
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:product_categories(name)
        `)
        .eq('id', id)
        .eq('published', true)
        .single();
      
      if (error) throw error;
      return data as Product & { category?: { name: string } };
    },
    enabled: !!id,
  });

  const handleAddToCart = () => {
    if (!product) return;
    
    addItem({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      quantity,
      image_url: product.image_url
    });
    
    toast({
      title: "Added to Cart",
      description: `${quantity} × ${product.name} added to your cart.`,
    });
  };

  const handleBuyNow = () => {
    if (!product) return;
    
    addItem({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      quantity,
      image_url: product.image_url
    });
    
    navigate('/cart');
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-2 gap-8">
            <Skeleton className="aspect-square" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error || !product) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-destructive mb-4">Product Not Found</h1>
            <p className="text-muted-foreground mb-4">
              The product you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => navigate('/marketplace')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Marketplace
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock !== undefined && product.stock <= 5 && product.stock > 0;

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Product Image */}
          <div className="space-y-4">
            <div className="aspect-square overflow-hidden rounded-lg bg-muted">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <Package className="h-16 w-16 text-muted-foreground" />
                </div>
              )}
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {product.featured && (
                  <Badge variant="default">Featured</Badge>
                )}
                {product.category && (
                  <Badge variant="outline">{product.category.name}</Badge>
                )}
              </div>
              
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {product.name}
              </h1>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-current text-yellow-500" />
                  <span>4.5 (24 reviews)</span>
                </div>
                
                {product.stock !== undefined && (
                  <div className="flex items-center gap-1">
                    <Package className="h-4 w-4" />
                    <span>{product.stock} in stock</span>
                  </div>
                )}
              </div>
            </div>

            <div className="text-3xl font-bold text-primary">
              ${product.price}
            </div>

            {/* Stock Status */}
            {isOutOfStock && (
              <Badge variant="destructive" className="w-fit">
                Out of Stock
              </Badge>
            )}
            {isLowStock && (
              <Badge variant="secondary" className="w-fit">
                Only {product.stock} left
              </Badge>
            )}

            <Separator />

            {/* Description */}
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            </div>

            <Separator />

            {/* Quantity and Actions */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="font-medium">Quantity:</label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    -
                  </Button>
                  <span className="w-12 text-center">{quantity}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(quantity + 1)}
                    disabled={isOutOfStock || (product.stock !== undefined && quantity >= product.stock)}
                  >
                    +
                  </Button>
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  className="flex-1"
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add to Cart
                </Button>
                
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleBuyNow}
                  disabled={isOutOfStock}
                >
                  Buy Now
                </Button>
              </div>

              {/* Shipping Info */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Truck className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      Free shipping on orders over $50
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
