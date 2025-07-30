
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createProduct, getProductCategories } from "@/lib/admin-api";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Upload } from "lucide-react";

const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().min(1, "Description is required"),
  price: z.number().min(0, "Price must be positive"),
  category_id: z.string().optional(),
  image_url: z.string().url().optional().or(z.literal("")),
  stock: z.number().min(0, "Stock cannot be negative").optional(),
  published: z.boolean().default(false),
  featured: z.boolean().default(false),
});

type ProductFormData = z.infer<typeof productSchema>;

interface CreateProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateProductDialog({ open, onOpenChange, onSuccess }: CreateProductDialogProps) {
  const { toast } = useToast();
  const [uploadingImage, setUploadingImage] = useState(false);

  const { data: categories } = useQuery({
    queryKey: ['product-categories'],
    queryFn: getProductCategories,
  });

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      stock: 0,
      published: false,
      featured: false,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: ProductFormData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      return createProduct({
        name: data.name,
        description: data.description,
        price: data.price,
        seller_id: user.id,
        category_id: data.category_id,
        image_url: data.image_url,
        stock: data.stock || 0,
        published: data.published,
        featured: data.featured,
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Product created successfully!",
      });
      form.reset();
      onSuccess();
    },
    onError: (error) => {
      console.error('Product creation error:', error);
      toast({
        title: "Error",
        description: "Failed to create product. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProductFormData) => {
    createMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Product</DialogTitle>
          <DialogDescription>
            Add a new product to your marketplace
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter product name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe your product"
                      rows={4}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price ($)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="0"
                        min="0"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="category_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories?.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <FormLabel>Product Image</FormLabel>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                <input
                  type="file"
                  id="product-image"
                  className="hidden"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setUploadingImage(true);
                      try {
                        const fileExt = file.name.split('.').pop();
                        const fileName = `${Math.random()}.${fileExt}`;
                        const filePath = `products/${fileName}`;

                        const { error: uploadError } = await supabase.storage
                          .from('Product Images')
                          .upload(filePath, file);

                        if (uploadError) throw uploadError;

                        const { data: { publicUrl } } = supabase.storage
                          .from('Product Images')
                          .getPublicUrl(filePath);

                        form.setValue('image_url', publicUrl);
                        toast({
                          title: "Success",
                          description: "Product image uploaded successfully!",
                        });
                      } catch (error) {
                        console.error('Upload error:', error);
                        toast({
                          title: "Error",
                          description: "Failed to upload image. Please try again.",
                          variant: "destructive",
                        });
                      } finally {
                        setUploadingImage(false);
                      }
                    }
                  }}
                />
                <label htmlFor="product-image" className="flex flex-col items-center cursor-pointer">
                  {uploadingImage ? (
                    <LoadingSpinner size="sm" />
                  ) : form.watch('image_url') ? (
                    <img 
                      src={form.watch('image_url')} 
                      alt="Product preview" 
                      className="w-32 h-20 object-cover rounded mb-2"
                    />
                  ) : (
                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                  )}
                  <p className="text-sm text-muted-foreground text-center">
                    {form.watch('image_url') 
                      ? "Click to replace product image"
                      : "Click to upload product image"
                    }
                  </p>
                </label>
              </div>
              
              <FormField
                control={form.control}
                name="image_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Or enter image URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/image.jpg" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="published"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Published</FormLabel>
                      <FormDescription>
                        Make product visible to customers
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="featured"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Featured</FormLabel>
                      <FormDescription>
                        Highlight this product
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Creating...
                  </>
                ) : (
                  'Create Product'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
