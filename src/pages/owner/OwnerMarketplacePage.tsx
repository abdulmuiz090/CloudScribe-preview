
import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Plus, Package } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { EditProductDialog } from "@/components/products/EditProductDialog";
import { useAuth } from "@/contexts/AuthContext";
import { getUserProducts } from "@/lib/api";
import { Loader2 } from "lucide-react";
import type { Product } from "@/types/database.types";

const OwnerMarketplacePage = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    loadProducts();
  }, [user]);

  const loadProducts = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const userProducts = await getUserProducts(user.id);
      setProducts(userProducts);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProductUpdated = () => {
    loadProducts();
    setEditingProduct(null);
  };

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
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Marketplace Management</h2>
            <p className="text-muted-foreground">
              Manage products and services in the marketplace
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Add New Product
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Your Products ({products.length})</CardTitle>
            <CardDescription>
              Manage all your products on the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            {products.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {products.map((product) => (
                  <Card key={product.id}>
                    <CardHeader className="pb-2">
                      {product.image_url && (
                        <div className="aspect-video relative overflow-hidden rounded-md">
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="object-cover w-full h-full"
                          />
                        </div>
                      )}
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold">{product.name}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {product.description}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-lg font-bold">${product.price}</span>
                        <div className="flex gap-1">
                          {product.published ? (
                            <Badge variant="default">Published</Badge>
                          ) : (
                            <Badge variant="secondary">Draft</Badge>
                          )}
                          {product.featured && (
                            <Badge variant="outline">Featured</Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                        <span>Stock: {product.stock}</span>
                        <span>{new Date(product.created_at).toLocaleDateString()}</span>
                      </div>
                      
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setEditingProduct(product)}
                        className="w-full"
                      >
                        Edit Product
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No products yet</h3>
                <p className="text-muted-foreground mb-6">
                  Start selling by creating your first product.
                </p>
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> Create Your First Product
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {editingProduct && (
        <EditProductDialog 
          product={editingProduct}
          open={!!editingProduct}
          onOpenChange={(open) => !open && setEditingProduct(null)}
          onSuccess={handleProductUpdated}
        />
      )}
    </DashboardLayout>
  );
};

export default OwnerMarketplacePage;
