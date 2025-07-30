
import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { getMyProducts, updateProduct, deleteProduct, getProductCategories } from "@/lib/admin-api";
import { Plus, Edit, Trash2, Eye, EyeOff, Package, Filter, TrendingUp, DollarSign, ShoppingCart } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ErrorMessage } from "@/components/ui/error-message";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreateProductDialog } from "@/components/products/CreateProductDialog";
import { EditProductDialog } from "@/components/products/EditProductDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { Product } from "@/types/database.types";

const AdminMarketplacePage = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const { data: products, isLoading, error } = useQuery({
    queryKey: ['my-products'],
    queryFn: getMyProducts,
  });

  const { data: categories } = useQuery({
    queryKey: ['product-categories'],
    queryFn: getProductCategories,
  });

  const publishMutation = useMutation({
    mutationFn: ({ id, published }: { id: string; published: boolean }) =>
      updateProduct(id, { published }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-products'] });
      toast({
        title: "Success",
        description: "Product status updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update product status.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-products'] });
      toast({
        title: "Success",
        description: "Product deleted successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete product.",
        variant: "destructive",
      });
    },
  });

  // Filter products
  const filteredProducts = products?.filter((product: Product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === "all" || 
                           (product.category_id && selectedCategory === product.category_id);
    
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "published" && product.published) ||
                         (statusFilter === "draft" && !product.published) ||
                         (statusFilter === "featured" && product.featured) ||
                         (statusFilter === "low-stock" && (product.stock || 0) < 10);
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Calculate analytics
  const analytics = products ? {
    totalProducts: products.length,
    publishedProducts: products.filter(p => p.published).length,
    totalRevenue: products.reduce((sum, p) => sum + (p.price * (p.stock || 0)), 0),
    lowStockProducts: products.filter(p => (p.stock || 0) < 10).length,
  } : { totalProducts: 0, publishedProducts: 0, totalRevenue: 0, lowStockProducts: 0 };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <ErrorMessage 
          message="Failed to load products. Please try again."
          onRetry={() => queryClient.invalidateQueries({ queryKey: ['my-products'] })}
        />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">My Marketplace</h2>
            <p className="text-muted-foreground">
              Manage your products, inventory, and sales
            </p>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </div>

        {/* Analytics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalProducts}</div>
              <p className="text-xs text-muted-foreground">
                {analytics.publishedProducts} published
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Published</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.publishedProducts}</div>
              <p className="text-xs text-muted-foreground">
                {analytics.totalProducts > 0 
                  ? `${Math.round((analytics.publishedProducts / analytics.totalProducts) * 100)}% of total`
                  : "No products yet"
                }
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${analytics.totalRevenue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                Based on current stock
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.lowStockProducts}</div>
              <p className="text-xs text-muted-foreground">
                Products with &lt; 10 items
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <span className="text-sm font-medium">Filters:</span>
          </div>
          
          <div className="flex flex-wrap gap-4 flex-1">
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64"
            />
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories?.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="low-stock">Low Stock</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredProducts?.map((product: Product) => (
            <Card key={product.id}>
              <CardHeader className="pb-2">
                {product.image_url ? (
                  <div className="aspect-square rounded-md bg-muted mb-2 overflow-hidden">
                    <img 
                      src={product.image_url} 
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-square rounded-md bg-muted mb-2 flex items-center justify-center">
                    <Package className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-base line-clamp-1">{product.name}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {product.description}
                    </CardDescription>
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    <Badge variant={product.published ? "default" : "secondary"}>
                      {product.published ? "Published" : "Draft"}
                    </Badge>
                    {product.featured && (
                      <Badge variant="outline">Featured</Badge>
                    )}
                    {(product.stock || 0) < 10 && (
                      <Badge variant="destructive">Low Stock</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-lg font-semibold">${product.price}</div>
                  <div className="text-sm text-muted-foreground">
                    Stock: {product.stock || 0}
                  </div>
                </div>
                <div className="flex items-center justify-between space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => publishMutation.mutate({
                      id: product.id,
                      published: !product.published
                    })}
                    disabled={publishMutation.isPending}
                  >
                    {product.published ? (
                      <>
                        <EyeOff className="h-4 w-4 mr-1" />
                        Unpub
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4 mr-1" />
                        Publish
                      </>
                    )}
                  </Button>
                  <div className="flex items-center space-x-1">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setEditingProduct(product)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Product</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{product.name}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteMutation.mutate(product.id)}
                            disabled={deleteMutation.isPending}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredProducts?.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">No products found</h3>
                <p className="text-muted-foreground mb-4">
                  {products?.length === 0 
                    ? "Get started by adding your first product"
                    : "Try adjusting your filters to see more results"
                  }
                </p>
                <Button onClick={() => setCreateDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Product
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <CreateProductDialog 
          open={createDialogOpen} 
          onOpenChange={setCreateDialogOpen}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['my-products'] });
            setCreateDialogOpen(false);
          }}
        />

        {editingProduct && (
          <EditProductDialog
            product={editingProduct}
            open={!!editingProduct}
            onOpenChange={(open) => !open && setEditingProduct(null)}
            onSuccess={() => {
              queryClient.invalidateQueries({ queryKey: ['my-products'] });
              setEditingProduct(null);
            }}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminMarketplacePage;
